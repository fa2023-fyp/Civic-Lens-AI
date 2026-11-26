import { analyzeComplaint } from './analyze.js';

const CLONE = (value) => JSON.parse(JSON.stringify(value));
const TERMINAL_STATUSES = new Set([
  'Resolved',
  'Resolved (Unverified)',
  'Closed',
  'Rejected',
  'Invalid',
]);
const STAFF_ROLES = ['officer', 'supervisor', 'admin'];

function safeUser(user) {
  const result = { ...user };
  delete result.password;
  return CLONE(result);
}

function requiredReason(input, label = 'A reason', makeError) {
  const reason = String(input?.reason ?? '').trim();
  if (!reason) {
    throw makeError(`${label} is required.`, 400, 'REASON_REQUIRED');
  }
  return reason;
}

function getId(value) {
  return typeof value === 'object' && value !== null
    ? (value.id ?? value.complaintId ?? value.clusterId)
    : value;
}

export function createMockDomains({
  getStore,
  transact,
  getActor,
  requireRole,
  assertComplaintAccess,
  findComplaint,
  paginate,
  makeError,
  clock,
  eventQueue,
}) {
  const store = getStore;

  const REVIEW_THRESHOLDS = { language: 0.6, category: 0.7, urgency: 0.7, department: 0.75 };

  function reviewerDeptIds(actor) {
    return actor.departmentIds?.length
      ? actor.departmentIds
      : [actor.departmentId].filter(Boolean);
  }

  function assertReviewerAccess(complaint, actor) {
    if (actor.role === 'admin') return;
    if (actor.role === 'supervisor' || actor.role === 'officer') {
      if (!reviewerDeptIds(actor).includes(complaint.departmentId)) {
        throw makeError('You do not have access to this complaint.', 403, 'FORBIDDEN');
      }
      return;
    }
    throw makeError('This role cannot review complaints.', 403, 'FORBIDDEN');
  }

  function flagFor(complaint, analysis) {
    const checks = [
      ['language', analysis.language_confidence ?? analysis.language?.confidence, REVIEW_THRESHOLDS.language],
      ['category', analysis.category?.confidence, REVIEW_THRESHOLDS.category],
      ['urgency', analysis.urgency?.confidence, REVIEW_THRESHOLDS.urgency],
      ['department', analysis.department?.confidence, REVIEW_THRESHOLDS.department],
    ];
    const below = checks.find(
      ([, confidence, threshold]) =>
        typeof confidence === 'number' && confidence < threshold,
    );
    if (below) {
      return { field: below[0], confidence: below[1], threshold: below[2] };
    }
    const forced = analyzeComplaint(complaint.originalText, {
      forceLowConfidence: true,
      complaints: store().complaints,
      locality: complaint.locality,
    });
    const forcedChecks = [
      ['language', forced.language_confidence, REVIEW_THRESHOLDS.language],
      ['category', forced.category?.confidence, REVIEW_THRESHOLDS.category],
      ['urgency', forced.urgency?.confidence, REVIEW_THRESHOLDS.urgency],
      ['department', forced.department?.confidence, REVIEW_THRESHOLDS.department],
    ];
    const forcedBelow = forcedChecks.find(
      ([, confidence, threshold]) =>
        typeof confidence === 'number' && confidence < threshold,
    );
    return forcedBelow
      ? { field: forcedBelow[0], confidence: forcedBelow[1], threshold: forcedBelow[2] }
      : { field: 'category', confidence: 0, threshold: REVIEW_THRESHOLDS.category };
  }

  function getTracker(complaintId, draft = store()) {
    let tracker = draft.slaTrackers.find((item) => item.complaintId === complaintId);
    if (!tracker) {
      tracker = {
        id: `SLA-${complaintId}`,
        complaintId,
        state: 'not_started',
        startedAt: null,
        warningAt: null,
        dueAt: null,
        breachedAt: null,
        escalationLevel: 0,
        isSynthetic: false,
      };
      draft.slaTrackers.push(tracker);
    }
    return tracker;
  }

  function policyFor(complaint, draft = store()) {
    return (
      draft.slaPolicies.find(
        (policy) =>
          policy.active &&
          (policy.categoryId === complaint.categoryId ||
            policy.departmentId === complaint.departmentId),
      ) ??
      draft.slaPolicies.find((policy) => policy.active) ?? {
        durationMs: 8 * 60 * 60 * 1000,
        warningPercent: 75,
        verificationTimeoutMs: 14 * 24 * 60 * 60 * 1000,
        escalationAfterMs: [8 * 60 * 60 * 1000, 12 * 60 * 60 * 1000, 24 * 60 * 60 * 1000],
      }
    );
  }

  function appendAudit(draft, action, actor, complaint, details = {}) {
    const record = {
      id: `AUDIT-${String((draft.auditEvents.at(-1)?.sequence ?? 25) + 1).padStart(6, '0')}`,
      sequence: (draft.auditEvents.at(-1)?.sequence ?? 25) + 1,
      action,
      actorId: actor?.id ?? null,
      actorRole: actor?.role ?? 'system',
      complaintId: complaint?.id ?? details.complaintId ?? null,
      createdAt: clock.now(),
      ...CLONE(details),
      isSynthetic: false,
    };
    draft.auditEvents.push(record);
    return record;
  }

  function setStatus(complaint, status, actorId = null, details = {}) {
    const changedAt = clock.now();
    complaint.status = status;
    complaint.updatedAt = changedAt;
    complaint.statusHistory ??= [];
    complaint.statusHistory.push({ status, changedAt, actorId, ...details });
  }

  function requireComplaint(id, options, { write = false } = {}) {
    const actor = getActor(options);
    const complaint = findComplaint(id);
    assertComplaintAccess(complaint, actor, { write });
    return { actor, complaint };
  }

  function scopedComplaints(actor) {
    if (actor.role === 'admin') return store().complaints;
    if (actor.role === 'citizen') {
      return store().complaints.filter((item) => item.reporterId === actor.id);
    }
    if (actor.role === 'officer') {
      return store().complaints.filter((item) => item.assignedOfficerId === actor.id);
    }
    if (actor.role === 'supervisor') {
      const departmentIds = actor.departmentIds?.length
        ? actor.departmentIds
        : [actor.departmentId].filter(Boolean);
      return store().complaints.filter((item) => departmentIds.includes(item.departmentId));
    }
    throw makeError('This role cannot access complaint data.', 403, 'FORBIDDEN');
  }

  function scopedCluster(cluster, actor) {
    const visibleIds = new Set(scopedComplaints(actor).map((complaint) => complaint.id));
    const complaintIds = cluster.complaintIds.filter((id) => visibleIds.has(id));
    if (!complaintIds.length) return null;
    const members = complaintIds
      .map((id) => store().complaints.find((complaint) => complaint.id === id))
      .filter(Boolean);
    const affectedStreets = [...new Set(members.map((item) => item.address).filter(Boolean))];
    const timestamps = members
      .map((item) => Date.parse(item.createdAt))
      .filter((value) => Number.isFinite(value));
    const firstReport = timestamps.length
      ? new Date(Math.min(...timestamps)).toISOString()
      : null;
    const latestReport = timestamps.length
      ? new Date(Math.max(...timestamps)).toISOString()
      : null;
    return {
      ...cluster,
      complaintIds,
      reportCount: complaintIds.length,
      area: cluster.locality,
      affectedStreets,
      firstReport,
      latestReport,
    };
  }

  function scopedEvents(actor) {
    if (actor.role === 'admin') return store().auditEvents;
    const visibleIds = new Set(scopedComplaints(actor).map((complaint) => complaint.id));
    return store().auditEvents.filter(
      (event) => event.complaintId && visibleIds.has(event.complaintId),
    );
  }

  function resolveTargetAndInput(idOrInput, input = {}, context = input) {
    if (typeof idOrInput === 'object' && idOrInput !== null) {
      return {
        id: getId(idOrInput),
        input: idOrInput,
        context: input?.token || input?.authToken ? input : idOrInput,
      };
    }
    return { id: idOrInput, input, context };
  }

  function makeReviewApi() {
    return Object.freeze({
      queue: (options = {}) => {
        const actor = getActor(options);
        requireRole(actor, ['officer', 'supervisor', 'admin']);
        const departmentIds = actor.role === 'admin' ? null : reviewerDeptIds(actor);
        const nowMs = clock.timestamp();
        const items = store()
          .complaints.filter((item) => item.status === 'Pending Human Review')
          .filter((item) => !departmentIds || departmentIds.includes(item.departmentId))
          .map((complaint) => {
            const analysis =
              complaint.aiAnalysis ||
              analyzeComplaint(complaint.originalText, {
                complaints: store().complaints,
                locality: complaint.locality,
              });
            const queuedEntry = (complaint.statusHistory ?? [])
              .filter((entry) => entry.status === 'Pending Human Review')
              .at(-1);
            const queuedAt = queuedEntry?.changedAt ?? complaint.createdAt;
            const ageMs = Math.max(0, nowMs - Date.parse(queuedAt));
            return {
              ...CLONE(complaint),
              aiAnalysis: analysis,
              flag: flagFor(complaint, analysis),
              queuedAt,
              ageMs,
              sla: CLONE(getTracker(complaint.id)),
            };
          });
        return { ...paginate(items, options), now: clock.now() };
      },
      confirm: (idOrInput, input = {}, context = input) => {
        const args = resolveTargetAndInput(idOrInput, input, context);
        const actor = getActor(args.context);
        requireRole(actor, ['officer', 'supervisor']);
        const assignment = transact((draft) => {
          const complaint = findComplaint(args.id, draft);
          assertReviewerAccess(complaint, actor);
          if (!['Pending Human Review', 'Submitted'].includes(complaint.status)) {
            throw makeError('Only queued complaints can be confirmed.', 409, 'INVALID_TRANSITION');
          }
          const category = draft.categories.find(
            (item) => item.id === (args.input.categoryId ?? complaint.categoryId),
          );
          if (!category) throw makeError('The selected category was not found.', 404, 'NOT_FOUND');
          const departmentId = args.input.departmentId ?? category.departmentId;
          const department = draft.departments.find((item) => item.id === departmentId);
          if (!department)
            throw makeError('The selected department was not found.', 404, 'NOT_FOUND');
          const officerId = args.input.assignedOfficerId ?? department.officerIds[0] ?? null;
          const officer = draft.users.find(
            (item) =>
              item.id === officerId &&
              item.role === 'officer' &&
              item.active !== false &&
              department.officerIds.includes(item.id),
          );
          if (!officer) {
            throw makeError('The selected department has no available officer.', 409, 'NO_OFFICER');
          }
          complaint.categoryId = category.id;
          complaint.category = category.name;
          complaint.departmentId = department.id;
          complaint.assignedOfficerId = officer.id;
          setStatus(complaint, 'Assigned', actor.id);
          const policy = policyFor(complaint, draft);
          const startedAt = clock.now();
          const durationMs = Number(policy.durationMs);
          const tracker = getTracker(complaint.id, draft);
          Object.assign(tracker, {
            state: 'on_track',
            startedAt,
            warningAt: new Date(
              Date.parse(startedAt) + (durationMs * policy.warningPercent) / 100,
            ).toISOString(),
            dueAt: new Date(Date.parse(startedAt) + durationMs).toISOString(),
            breachedAt: null,
            escalationLevel: 0,
            warningSentAt: null,
            breachSentAt: null,
          });
          appendAudit(draft, 'review_confirmed', actor, complaint, {
            assignedOfficerId: complaint.assignedOfficerId,
            departmentId: complaint.departmentId,
          });
          draft.notifications.unshift({
            id: `NOT-${String(++draft.counters.notification).padStart(5, '0')}`,
            userId: complaint.assignedOfficerId,
            complaintId: complaint.id,
            type: 'complaint_assigned',
            readAt: null,
            createdAt: startedAt,
            isSynthetic: false,
          });
          return { complaint: CLONE(complaint), tracker: CLONE(tracker) };
        });
        eventQueue.publish('review.confirmed', {
          complaintId: assignment.complaint.id,
          assignedOfficerId: assignment.complaint.assignedOfficerId,
        });
        return assignment;
      },
      correct: (idOrInput, input = {}, context = input) => {
        const args = resolveTargetAndInput(idOrInput, input, context);
        const actor = getActor(args.context);
        requireRole(actor, ['officer', 'supervisor']);
        const reason = requiredReason(args.input, 'A reason', makeError);
        const field = String(args.input.field ?? '');
        const aiValue = args.input.aiValue;
        const humanValue = args.input.humanValue;
        if (!field || humanValue === undefined) {
          throw makeError('A field and human value are required.', 400, 'INVALID_OVERRIDE');
        }
        return transact((draft) => {
          const complaint = findComplaint(args.id, draft);
          assertReviewerAccess(complaint, actor);
          const override = {
            field,
            aiValue: aiValue ?? complaint.aiAnalysis?.[field] ?? null,
            humanValue: CLONE(humanValue),
            reason,
            user: { id: actor.id, name: actor.name },
            userId: actor.id,
            time: clock.now(),
            decidedBy: actor.id,
            decidedAt: clock.now(),
          };
          complaint.overrides ??= [];
          complaint.overrides.push(override);
          if (field === 'category' || field === 'categoryId') {
            const categoryId = typeof humanValue === 'object' ? humanValue.id : String(humanValue);
            const category = draft.categories.find((item) => item.id === categoryId);
            if (!category)
              throw makeError('The selected category was not found.', 404, 'NOT_FOUND');
            complaint.categoryId = category.id;
            complaint.category = category.name;
            complaint.departmentId = category.departmentId;
          } else if (field === 'department' || field === 'departmentId') {
            const departmentId =
              typeof humanValue === 'object' ? humanValue.id : String(humanValue);
            if (!draft.departments.some((item) => item.id === departmentId)) {
              throw makeError('The selected department was not found.', 404, 'NOT_FOUND');
            }
            complaint.departmentId = departmentId;
          } else if (field === 'urgency') {
            complaint.urgency = CLONE(humanValue);
          } else {
            complaint[field] = CLONE(humanValue);
          }
          complaint.updatedAt = override.time;
          appendAudit(draft, 'ai_override', actor, complaint, override);
          return override;
        });
      },
      markInvalid: (idOrInput, input = {}, context = input) => {
        const args = resolveTargetAndInput(idOrInput, input, context);
        const actor = getActor(args.context);
        requireRole(actor, ['officer', 'supervisor']);
        const reason = requiredReason(args.input, 'A reason', makeError);
        return transact((draft) => {
          const complaint = findComplaint(args.id, draft);
          assertReviewerAccess(complaint, actor);
          if (TERMINAL_STATUSES.has(complaint.status)) {
            throw makeError(
              'A terminal complaint cannot be marked invalid.',
              409,
              'INVALID_TRANSITION',
            );
          }
          setStatus(complaint, 'Invalid', actor.id, { reason });
          complaint.invalidReason = reason;
          getTracker(complaint.id, draft).state = 'completed';
          appendAudit(draft, 'complaint_marked_invalid', actor, complaint, { reason });
          const invalidatedAt = clock.now();
          draft.notifications.unshift({
            id: `NOT-${String(++draft.counters.notification).padStart(5, '0')}`,
            userId: complaint.reporterId,
            complaintId: complaint.id,
            type: 'complaint_invalid',
            readAt: null,
            createdAt: invalidatedAt,
            isSynthetic: false,
          });
          return complaint;
        });
      },
    });
  }

  function makeDuplicatesApi() {
    return Object.freeze({
      list: (options = {}) => {
        const actor = getActor(options);
        requireRole(actor, STAFF_ROLES);
        const visibleIds = new Set(scopedComplaints(actor).map((item) => item.id));
        const items = store().duplicateCandidates.filter((candidate) =>
          visibleIds.has(candidate.complaintId),
        );
        return paginate(items, options);
      },
      confirm: (idOrInput, input = {}, context = input) => {
        const args = resolveTargetAndInput(idOrInput, input, context);
        const actor = getActor(args.context);
        requireRole(actor, ['officer', 'supervisor']);
        const candidateId =
          args.input.candidateId ??
          args.input.duplicateCandidateId ??
          args.input.candidateComplaintId;
        return transact((draft) => {
          const candidate = draft.duplicateCandidates.find(
            (item) =>
              item.id === String(candidateId) || item.candidateComplaintId === String(candidateId),
          );
          if (!candidate || candidate.complaintId !== String(args.id)) {
            throw makeError('The duplicate candidate could not be found.', 404, 'NOT_FOUND');
          }
          const complaint = findComplaint(candidate.complaintId, draft);
          const linked = findComplaint(candidate.candidateComplaintId, draft);
          assertComplaintAccess(complaint, actor, { write: true });
          assertComplaintAccess(linked, actor, { write: true });
          candidate.state = 'confirmed';
          candidate.confirmedAt = clock.now();
          candidate.confirmedBy = actor.id;
          complaint.duplicateOf = linked.id;
          linked.duplicateIds ??= [];
          if (!linked.duplicateIds.includes(complaint.id)) linked.duplicateIds.push(complaint.id);
          appendAudit(draft, 'duplicate_confirmed', actor, complaint, {
            candidateComplaintId: linked.id,
            candidateId: candidate.id,
          });
          return candidate;
        });
      },
      reject: (idOrInput, input = {}, context = input) => {
        const args = resolveTargetAndInput(idOrInput, input, context);
        const actor = getActor(args.context);
        requireRole(actor, ['officer', 'supervisor']);
        const reason = requiredReason(args.input, 'A reason', makeError);
        const candidateId =
          args.input.candidateId ??
          args.input.duplicateCandidateId ??
          args.input.candidateComplaintId;
        return transact((draft) => {
          const candidate = draft.duplicateCandidates.find(
            (item) =>
              item.id === String(candidateId) || item.candidateComplaintId === String(candidateId),
          );
          if (!candidate || candidate.complaintId !== String(args.id)) {
            throw makeError('The duplicate candidate could not be found.', 404, 'NOT_FOUND');
          }
          const complaint = findComplaint(candidate.complaintId, draft);
          assertComplaintAccess(complaint, actor, { write: true });
          candidate.state = 'rejected';
          candidate.rejectedAt = clock.now();
          candidate.rejectedBy = actor.id;
          candidate.reason = reason;
          appendAudit(draft, 'duplicate_rejected', actor, complaint, {
            candidateComplaintId: candidate.candidateComplaintId,
            candidateId: candidate.id,
            reason,
          });
          return candidate;
        });
      },
    });
  }

  function makeClustersApi() {
    return Object.freeze({
      list: (options = {}) => {
        const actor = getActor(options);
        const clusters = store()
          .clusters.map((cluster) => scopedCluster(cluster, actor))
          .filter(Boolean);
        return paginate(clusters, options);
      },
      get: (id, options = {}) => {
        const actor = getActor(options);
        const cluster = store().clusters.find((item) => item.id === String(getId(id)));
        const visible = cluster && scopedCluster(cluster, actor);
        if (!visible) throw makeError('The cluster could not be found.', 404, 'NOT_FOUND');
        return visible;
      },
      merge: (idsOrInput, input = {}, context = input) => {
        const args = resolveTargetAndInput(idsOrInput, input, context);
        const actor = getActor(args.context);
        requireRole(actor, ['officer', 'supervisor']);
        const reason = requiredReason(args.input, 'A reason', makeError);
        const ids =
          args.input.clusterIds ?? args.input.ids ?? (Array.isArray(idsOrInput) ? idsOrInput : []);
        if (!Array.isArray(ids) || ids.length < 2) {
          throw makeError('At least two cluster IDs are required.', 400, 'INVALID_CLUSTERS');
        }
        return transact((draft) => {
          const selected = ids.map((id) => draft.clusters.find((item) => item.id === String(id)));
          if (selected.some((item) => !item))
            throw makeError('A cluster could not be found.', 404, 'NOT_FOUND');
          selected.forEach((cluster) =>
            cluster.complaintIds.forEach((id) =>
              assertReviewerAccess(findComplaint(id, draft), actor),
            ),
          );
          const target = selected[0];
          target.complaintIds = [...new Set(selected.flatMap((cluster) => cluster.complaintIds))];
          target.mergedClusterIds = selected.slice(1).map((cluster) => cluster.id);
          target.updatedAt = clock.now();
          draft.clusters = draft.clusters.filter((cluster) => !selected.slice(1).includes(cluster));
          appendAudit(draft, 'clusters_merged', actor, null, {
            clusterIds: ids,
            targetClusterId: target.id,
            reason,
            humanAction: true,
          });
          return target;
        });
      },
      split: (idOrInput, input = {}, context = input) => {
        const args = resolveTargetAndInput(idOrInput, input, context);
        const actor = getActor(args.context);
        requireRole(actor, ['officer', 'supervisor']);
        const reason = requiredReason(args.input, 'A reason', makeError);
        return transact((draft) => {
          const cluster = draft.clusters.find((item) => item.id === String(args.id));
          if (!cluster) throw makeError('The cluster could not be found.', 404, 'NOT_FOUND');
          cluster.complaintIds.forEach((id) =>
            assertReviewerAccess(findComplaint(id, draft), actor),
          );
          const groups = args.input.groups;
          if (!Array.isArray(groups) || groups.length < 2) {
            throw makeError('At least two complaint groups are required.', 400, 'INVALID_SPLIT');
          }
          const allIds = new Set(cluster.complaintIds);
          const flattened = groups.flat();
          if (
            flattened.some((complaintId) => !allIds.has(complaintId)) ||
            new Set(flattened).size !== flattened.length ||
            flattened.length !== allIds.size
          ) {
            throw makeError(
              'Split groups must partition all cluster complaints.',
              400,
              'INVALID_SPLIT',
            );
          }
          cluster.complaintIds = groups[0];
          cluster.updatedAt = clock.now();
          const created = groups.slice(1).map((complaintIds, index) => ({
            ...CLONE(cluster),
            id: `CLUSTER-${Date.now().toString(36)}-${index}`,
            complaintIds,
            createdAt: clock.now(),
            isSynthetic: false,
          }));
          draft.clusters.push(...created);
          appendAudit(draft, 'cluster_split', actor, null, {
            clusterId: cluster.id,
            newClusterIds: created.map((item) => item.id),
            reason,
            humanAction: true,
          });
          return { original: cluster, created };
        });
      },
    });
  }

  function makeSlaApi() {
    return Object.freeze({
      get: (idOrInput, options = {}) => {
        const id = getId(idOrInput);
        const authOptions =
          typeof idOrInput === 'object' && idOrInput !== null ? idOrInput : options;
        const { complaint } = requireComplaint(id, authOptions);
        return {
          ...CLONE(getTracker(complaint.id)),
          policy: CLONE(policyFor(complaint)),
          elapsedMs: getTracker(complaint.id).startedAt
            ? Math.max(0, clock.timestamp() - Date.parse(getTracker(complaint.id).startedAt))
            : 0,
        };
      },
      policies: (options = {}) => {
        const actor = getActor(options);
        requireRole(actor, ['admin', 'supervisor']);
        const items =
          actor.role === 'admin'
            ? store().slaPolicies
            : store().slaPolicies.filter((policy) =>
                (actor.departmentIds?.length ? actor.departmentIds : [actor.departmentId]).includes(
                  policy.departmentId,
                ),
              );
        return CLONE(items);
      },
      riskFor: (idOrInput, options = {}) => {
        const id = getId(idOrInput);
        const authOptions =
          typeof idOrInput === 'object' && idOrInput !== null ? idOrInput : options;
        const { complaint } = requireComplaint(id, authOptions);
        const tracker = getTracker(complaint.id);
        const elapsedMs = tracker.startedAt
          ? Math.max(0, clock.timestamp() - Date.parse(tracker.startedAt))
          : 0;
        const durationMs = Number(policyFor(complaint).durationMs);
        const utilization = durationMs ? elapsedMs / durationMs : 0;
        return {
          complaintId: complaint.id,
          risk:
            tracker.state === 'not_started'
              ? 'not_applicable'
              : utilization >= 1
                ? 'high'
                : utilization >= 0.75
                  ? 'elevated'
                  : utilization >= 0.5
                    ? 'moderate'
                    : 'low',
          elapsedPercent: Math.round(utilization * 100),
          state: tracker.state,
          estimatedAt: clock.now(),
        };
      },
    });
  }

  function makeVerificationApi() {
    function submitResolution(idOrInput, input = {}, context = input) {
      const args = resolveTargetAndInput(idOrInput, input, context);
      const actor = getActor(args.context);
      requireRole(actor, ['officer']);
      const description = String(args.input.description ?? '').trim();
      if (!description)
        throw makeError('A resolution description is required.', 400, 'INVALID_RESOLUTION');
      return transact((draft) => {
        const complaint = findComplaint(args.id, draft);
        assertComplaintAccess(complaint, actor, { write: true });
        if (!['Assigned', 'In Progress', 'Reopened', 'Escalated'].includes(complaint.status)) {
          throw makeError(
            'The complaint is not ready for a proposed resolution.',
            409,
            'INVALID_TRANSITION',
          );
        }
        const submittedAt = clock.now();
        const policy = policyFor(complaint, draft);
        complaint.resolution = {
          description,
          actionTaken: args.input.actionTaken ?? '',
          beforeMedia: CLONE(args.input.beforeMedia ?? []),
          afterMedia: CLONE(args.input.afterMedia ?? []),
          submittedBy: actor.id,
          submittedAt,
          verificationDueAt: new Date(
            Date.parse(submittedAt) + Number(policy.verificationTimeoutMs),
          ).toISOString(),
          unverified: false,
        };
        complaint.rejectionCount ??= 0;
        setStatus(complaint, 'Citizen Verification', actor.id);
        const tracker = getTracker(complaint.id, draft);
        tracker.state = 'verification';
        appendAudit(draft, 'resolution_submitted', actor, complaint, {
          verificationDueAt: complaint.resolution.verificationDueAt,
        });
        return complaint;
      });
    }

    function accept(idOrInput, input = {}, context = input) {
      const args = resolveTargetAndInput(idOrInput, input, context);
      const actor = getActor(args.context);
      requireRole(actor, ['citizen']);
      return transact((draft) => {
        const complaint = findComplaint(args.id, draft);
        assertComplaintAccess(complaint, actor, { write: true });
        if (!['Resolution Submitted', 'Citizen Verification'].includes(complaint.status)) {
          throw makeError(
            'The complaint has no proposed resolution to accept.',
            409,
            'INVALID_TRANSITION',
          );
        }
        const acceptedAt = clock.now();
        complaint.acceptedAt = acceptedAt;
        complaint.verifiedBy = actor.id;
        setStatus(complaint, 'Resolved', actor.id, { verification: 'accepted' });
        complaint.verificationOutcome = 'accepted';
        const tracker = getTracker(complaint.id, draft);
        tracker.state = 'completed';
        appendAudit(draft, 'resolution_accepted', actor, complaint, { acceptedAt });
        return complaint;
      });
    }

    function reject(idOrInput, input = {}, context = input) {
      const args = resolveTargetAndInput(idOrInput, input, context);
      const actor = getActor(args.context);
      requireRole(actor, ['citizen']);
      const reason = requiredReason(args.input, 'A rejection reason', makeError);
      const result = transact((draft) => {
        const complaint = findComplaint(args.id, draft);
        assertComplaintAccess(complaint, actor, { write: true });
        if (!['Resolution Submitted', 'Citizen Verification'].includes(complaint.status)) {
          throw makeError(
            'The complaint has no proposed resolution to reject.',
            409,
            'INVALID_TRANSITION',
          );
        }
        complaint.rejectionCount = (complaint.rejectionCount ?? 0) + 1;
        complaint.rejections ??= [];
        complaint.rejections.push({ reason, rejectedBy: actor.id, rejectedAt: clock.now() });
        const escalated = complaint.rejectionCount >= 2;
        setStatus(complaint, escalated ? 'Escalated' : 'Reopened', actor.id, { reason });
        complaint.escalationLevel = escalated
          ? Math.max(1, complaint.escalationLevel ?? 0)
          : (complaint.escalationLevel ?? 0);
        const tracker = getTracker(complaint.id, draft);
        if (tracker.startedAt && !['breached', 'escalated'].includes(tracker.state)) {
          tracker.state = 'on_track';
        }
        appendAudit(draft, 'resolution_rejected', actor, complaint, {
          reason,
          rejectionCount: complaint.rejectionCount,
          escalated,
        });
        return { complaint, escalated };
      });
      eventQueue.publish('resolution.rejected', {
        complaintId: result.complaint.id,
        rejectionCount: result.complaint.rejectionCount,
        escalated: result.escalated,
      });
      return result.complaint;
    }

    function reopen(idOrInput, input = {}, context = input) {
      const args = resolveTargetAndInput(idOrInput, input, context);
      const actor = getActor(args.context);
      requireRole(actor, ['citizen']);
      const reason = requiredReason(args.input, 'A reopen reason', makeError);
      return transact((draft) => {
        const complaint = findComplaint(args.id, draft);
        assertComplaintAccess(complaint, actor, { write: true });
        if (!['Resolved', 'Resolved (Unverified)', 'Closed'].includes(complaint.status)) {
          throw makeError('Only a completed complaint can be reopened.', 409, 'INVALID_TRANSITION');
        }
        const acceptedAt = Date.parse(complaint.acceptedAt ?? complaint.updatedAt);
        if (clock.timestamp() - acceptedAt > 14 * 24 * 60 * 60 * 1000) {
          throw makeError(
            'The complaint is outside the reopen window.',
            409,
            'REOPEN_WINDOW_EXPIRED',
          );
        }
        setStatus(complaint, 'Reopened', actor.id, { reason });
        complaint.reopenedReason = reason;
        complaint.acceptedAt = null;
        complaint.resolvedUnverified = false;
        if (complaint.resolution) complaint.resolution.unverified = false;
        const tracker = getTracker(complaint.id, draft);
        tracker.state = tracker.startedAt ? 'on_track' : 'not_started';
        appendAudit(draft, 'complaint_reopened', actor, complaint, { reason });
        return complaint;
      });
    }

    return Object.freeze({ submitResolution, accept, reject, reopen });
  }

  function makeAuditApi() {
    return Object.freeze({
      list: (options = {}) => {
        const actor = getActor(options);
        if (options.complaintId) {
          const complaint = findComplaint(options.complaintId);
          assertComplaintAccess(complaint, actor);
        }
        const items = scopedEvents(actor).filter(
          (event) => !options.complaintId || event.complaintId === options.complaintId,
        );
        return paginate(items, options);
      },
      get: (idOrInput, options = {}) => {
        const id = getId(idOrInput);
        const authOptions =
          typeof idOrInput === 'object' && idOrInput !== null ? idOrInput : options;
        const actor = getActor(authOptions);
        const item = scopedEvents(actor).find((event) => event.id === String(id));
        if (!item) throw makeError('The audit record could not be found.', 404, 'NOT_FOUND');
        return CLONE(item);
      },
      export: (options = {}) => {
        const actor = getActor(options);
        return paginate(scopedEvents(actor), options);
      },
    });
  }

  function makeAdminApi() {
    function adminActor(options) {
      const actor = getActor(options);
      requireRole(actor, ['admin']);
      return actor;
    }

    const users = Object.freeze({
      list(options = {}) {
        adminActor(options);
        const items = store().users.map(safeUser);
        return paginate(items, options);
      },
      get(id, options = {}) {
        adminActor(options);
        const user = store().users.find((item) => item.id === String(getId(id)));
        if (!user) throw makeError('The user could not be found.', 404, 'NOT_FOUND');
        return safeUser(user);
      },
      create(input = {}, options = input) {
        const actor = adminActor(options);
        const email = String(input.email ?? '')
          .trim()
          .toLowerCase();
        const name = String(input.name ?? '').trim();
        const role = String(input.role ?? '');
        if (!email || !name || !['citizen', 'officer', 'supervisor', 'admin'].includes(role)) {
          throw makeError('Name, email, and a valid role are required.', 400, 'INVALID_USER');
        }
        if (
          input.departmentId &&
          !store().departments.some((department) => department.id === input.departmentId)
        ) {
          throw makeError('The selected department was not found.', 404, 'NOT_FOUND');
        }
        if (store().users.some((item) => item.email.toLowerCase() === email)) {
          throw makeError('An account already uses this email.', 409, 'AUTH_EMAIL_EXISTS');
        }
        return transact((draft) => {
          const user = {
            id: `admin-user-${Date.now().toString(36)}`,
            name,
            email,
            password: String(input.password ?? 'Demo123!'),
            role,
            departmentId: input.departmentId ?? null,
            departmentIds: input.departmentIds ?? (input.departmentId ? [input.departmentId] : []),
            verified: true,
            active: true,
            createdAt: clock.now(),
            isSynthetic: false,
          };
          draft.users.push(user);
          appendAudit(draft, 'admin_user_created', actor, null, { targetUserId: user.id });
          return safeUser(user);
        });
      },
      update(id, input = {}, options = input) {
        const actor = adminActor(options);
        return transact((draft) => {
          const user = draft.users.find((item) => item.id === String(getId(id)));
          if (!user) throw makeError('The user could not be found.', 404, 'NOT_FOUND');
          const reason =
            input.active === false && user.active !== false
              ? requiredReason(input, 'A deactivation reason', makeError)
              : undefined;
          if (
            input.role !== undefined &&
            !['citizen', 'officer', 'supervisor', 'admin'].includes(input.role)
          ) {
            throw makeError('The selected role is not supported.', 400, 'INVALID_USER');
          }
          if (
            input.email !== undefined &&
            draft.users.some(
              (item) =>
                item.id !== user.id &&
                item.email.toLowerCase() === String(input.email).trim().toLowerCase(),
            )
          ) {
            throw makeError('An account already uses this email.', 409, 'AUTH_EMAIL_EXISTS');
          }
          if (
            input.departmentId &&
            !draft.departments.some((department) => department.id === input.departmentId)
          ) {
            throw makeError('The selected department was not found.', 404, 'NOT_FOUND');
          }
          ['name', 'email', 'role', 'departmentId', 'departmentIds', 'verified', 'active'].forEach(
            (key) => {
              if (input[key] !== undefined) user[key] = CLONE(input[key]);
            },
          );
          if (input.email !== undefined) user.email = String(input.email).trim().toLowerCase();
          appendAudit(draft, 'admin_user_updated', actor, null, {
            targetUserId: user.id,
            fields: Object.keys(input),
            ...(reason ? { reason } : {}),
          });
          return safeUser(user);
        });
      },
      delete(id, options = {}) {
        const actor = adminActor(options);
        const reason = requiredReason(options, 'A deactivation reason', makeError);
        return transact((draft) => {
          const user = draft.users.find((item) => item.id === String(getId(id)));
          if (!user) throw makeError('The user could not be found.', 404, 'NOT_FOUND');
          if (user.id === actor.id)
            throw makeError('You cannot deactivate your own account.', 409, 'INVALID_USER');
          user.active = false;
          user.deletedAt = clock.now();
          appendAudit(draft, 'admin_user_deactivated', actor, null, {
            targetUserId: user.id,
            reason,
          });
          return { id: user.id, active: user.active, deletedAt: user.deletedAt };
        });
      },
    });

    const taxonomy = Object.freeze({
      list(options = {}) {
        adminActor(options);
        return CLONE(store().categories);
      },
      create(input = {}, options = input) {
        const actor = adminActor(options);
        const id = String(input.id ?? '').trim();
        const name = String(input.name ?? '').trim();
        const departmentId = String(input.departmentId ?? '').trim();
        if (!id || !name || !store().departments.some((item) => item.id === departmentId)) {
          throw makeError(
            'A category ID, name, and valid department are required.',
            400,
            'INVALID_CATEGORY',
          );
        }
        return transact((draft) => {
          if (draft.categories.some((item) => item.id === id))
            throw makeError('The category already exists.', 409, 'CATEGORY_EXISTS');
          const category = { id, name, departmentId, isSynthetic: false };
          draft.categories.push(category);
          appendAudit(draft, 'taxonomy_created', actor, null, { categoryId: id });
          return category;
        });
      },
      update(id, input = {}, options = input) {
        const actor = adminActor(options);
        return transact((draft) => {
          const category = draft.categories.find((item) => item.id === String(getId(id)));
          if (!category) throw makeError('The category could not be found.', 404, 'NOT_FOUND');
          if (input.name !== undefined) category.name = String(input.name);
          if (input.departmentId !== undefined) {
            if (!draft.departments.some((item) => item.id === input.departmentId)) {
              throw makeError('The selected department was not found.', 404, 'NOT_FOUND');
            }
            category.departmentId = input.departmentId;
          }
          appendAudit(draft, 'taxonomy_updated', actor, null, { categoryId: category.id });
          return category;
        });
      },
      delete(id, options = {}) {
        const actor = adminActor(options);
        return transact((draft) => {
          const category = draft.categories.find((item) => item.id === String(getId(id)));
          if (!category) throw makeError('The category could not be found.', 404, 'NOT_FOUND');
          if (draft.complaints.some((item) => item.categoryId === category.id)) {
            throw makeError(
              'A category used by complaints cannot be deleted.',
              409,
              'CATEGORY_IN_USE',
            );
          }
          draft.categories = draft.categories.filter((item) => item.id !== category.id);
          appendAudit(draft, 'taxonomy_deleted', actor, null, { categoryId: category.id });
          return { id: category.id, deleted: true };
        });
      },
    });

    function activateModel(id, input, options, action) {
      const actor = adminActor(options);
      const reason = requiredReason(input, 'An activation or rollback reason', makeError);
      return transact((draft) => {
        const model = draft.models.find((item) => item.id === String(getId(id)));
        if (!model) throw makeError('The model could not be found.', 404, 'NOT_FOUND');
        draft.models
          .filter((item) => item.type === model.type)
          .forEach((item) => {
            item.active = item.id === model.id;
            item.status = item.active ? 'active' : 'inactive';
          });
        model.activatedAt = clock.now();
        appendAudit(draft, action, actor, null, { modelId: model.id, reason });
        return model;
      });
    }

    const models = Object.freeze({
      list(options = {}) {
        adminActor(options);
        return CLONE(store().models);
      },
      activate(id, input = {}, options = input) {
        return activateModel(id, input, options, 'model_activated');
      },
      rollback(id, input = {}, options = input) {
        return activateModel(id, input, options, 'model_rolled_back');
      },
    });

    return Object.freeze({
      users,
      taxonomy,
      departmentMapping: Object.freeze({
        get(options = {}) {
          adminActor(options);
          return CLONE(store().departmentMapping);
        },
        update(input = {}, options = input) {
          const actor = adminActor(options);
          if (!Array.isArray(input.mappings))
            throw makeError('A mappings array is required.', 400, 'INVALID_MAPPING');
          return transact((draft) => {
            input.mappings.forEach((mapping) => {
              if (!draft.departments.some((item) => item.id === mapping.departmentId)) {
                throw makeError('A mapped department was not found.', 404, 'NOT_FOUND');
              }
              if (
                mapping.categoryIds.some((id) => !draft.categories.some((item) => item.id === id))
              ) {
                throw makeError('A mapped category was not found.', 404, 'NOT_FOUND');
              }
            });
            draft.departmentMapping = CLONE(input.mappings);
            appendAudit(draft, 'department_mapping_updated', actor, null, {
              count: input.mappings.length,
            });
            return draft.departmentMapping;
          });
        },
      }),
      slaPolicies: Object.freeze({
        list(options = {}) {
          adminActor(options);
          return CLONE(store().slaPolicies);
        },
        update(id, input = {}, options = input) {
          const actor = adminActor(options);
          return transact((draft) => {
            const policy = draft.slaPolicies.find((item) => item.id === String(getId(id)));
            if (!policy) throw makeError('The SLA policy could not be found.', 404, 'NOT_FOUND');
            [
              'durationMs',
              'warningPercent',
              'verificationTimeoutMs',
              'escalationAfterMs',
              'active',
            ].forEach((key) => {
              if (input[key] !== undefined) policy[key] = CLONE(input[key]);
            });
            appendAudit(draft, 'sla_policy_updated', actor, null, { policyId: policy.id });
            return policy;
          });
        },
      }),
      thresholds: Object.freeze({
        get(options = {}) {
          adminActor(options);
          return CLONE(store().thresholds);
        },
        update(input = {}, options = input) {
          const actor = adminActor(options);
          return transact((draft) => {
            Object.assign(draft.thresholds, CLONE(input));
            appendAudit(draft, 'thresholds_updated', actor, null, { fields: Object.keys(input) });
            return draft.thresholds;
          });
        },
      }),
      models,
      features: Object.freeze({
        list(options = {}) {
          adminActor(options);
          return CLONE(store().featureFlags);
        },
        update(key, input = {}, options = input) {
          const actor = adminActor(options);
          return transact((draft) => {
            const feature = draft.featureFlags.find((item) => item.key === String(getId(key)));
            if (!feature) throw makeError('The feature flag could not be found.', 404, 'NOT_FOUND');
            feature.enabled = Boolean(input.enabled);
            appendAudit(draft, 'feature_flag_updated', actor, null, {
              key: feature.key,
              enabled: feature.enabled,
            });
            return feature;
          });
        },
      }),
    });
  }

  function makeGeoApi() {
    function filteredPoints(options = {}) {
      const actor = getActor(options);
      const visibleIds = new Set(scopedComplaints(actor).map((item) => item.id));
      return store()
        .mapPoints.filter((point) => visibleIds.has(point.complaintId))
        .filter((point) => !options.locality || point.locality === options.locality)
        .filter((point) => !options.categoryId || point.categoryId === options.categoryId)
        .filter((point) => !options.status || point.status === options.status);
    }
    return Object.freeze({
      points(options = {}) {
        return paginate(filteredPoints(options), options);
      },
      areaStats(options = {}) {
        const groups = new Map();
        filteredPoints(options).forEach((point) => {
          const group = groups.get(point.locality) ?? {
            locality: point.locality,
            count: 0,
            categories: {},
            dataLabel: 'SYNTHETIC',
          };
          group.count += 1;
          group.categories[point.categoryId] = (group.categories[point.categoryId] ?? 0) + 1;
          groups.set(point.locality, group);
        });
        return [...groups.values()];
      },
      hotspots(options = {}) {
        const buckets = new Map();
        filteredPoints(options).forEach((point) => {
          const key = `${Math.round(point.latitude * 50) / 50},${Math.round(point.longitude * 50) / 50}`;
          const bucket = buckets.get(key) ?? {
            latitude: point.latitude,
            longitude: point.longitude,
            count: 0,
            complaintIds: [],
            locality: point.locality,
          };
          bucket.count += 1;
          if (!bucket.complaintIds.includes(point.complaintId))
            bucket.complaintIds.push(point.complaintId);
          buckets.set(key, bucket);
        });
        return [...buckets.values()].sort((left, right) => right.count - left.count).slice(0, 20);
      },
    });
  }

  function makeAnalyticsApi() {
    function summary(options = {}) {
      const actor = getActor(options);
      requireRole(actor, ['supervisor', 'admin']);
      const complaints = scopedComplaints(actor);
      const byStatus = {};
      complaints.forEach((complaint) => {
        byStatus[complaint.status] = (byStatus[complaint.status] ?? 0) + 1;
      });
      return {
        totalComplaints: complaints.length,
        byStatus,
        pendingReview: byStatus['Pending Human Review'] ?? 0,
        resolved: byStatus.Resolved ?? 0,
        escalated: byStatus.Escalated ?? 0,
        activeSlaWarnings: store().slaTrackers.filter(
          (tracker) =>
            complaints.some((complaint) => complaint.id === tracker.complaintId) &&
            ['warning', 'breached', 'escalated'].includes(tracker.state),
        ).length,
        generatedAt: clock.now(),
        dataLabel: 'SYNTHETIC',
      };
    }
    return Object.freeze({
      overview: summary,
      aiPerformance(options = {}) {
        const actor = getActor(options);
        requireRole(actor, ['supervisor', 'admin']);
        const complaints = scopedComplaints(actor);
        const overrides = store().auditEvents.filter(
          (event) =>
            event.action === 'ai_override' &&
            complaints.some((item) => item.id === event.complaintId),
        );
        return {
          analyzed: complaints.filter((item) => item.aiAnalysis).length,
          humanReview: complaints.filter((item) => item.status === 'Pending Human Review').length,
          overrides: overrides.length,
          overrideRate: complaints.length
            ? Number((overrides.length / complaints.length).toFixed(3))
            : 0,
          modelVersions: { classifier: 'v1.3', extractor: 'v0.9', embedding: 'v1.0' },
          generatedAt: clock.now(),
          dataLabel: 'SYNTHETIC',
        };
      },
    });
  }

  function makeAutomationApi() {
    function scopeList(items, actor) {
      if (actor.role === 'admin') return items;
      const visibleIds = new Set(scopedComplaints(actor).map((complaint) => complaint.id));
      return items.filter(
        (item) => item.payload?.complaintId && visibleIds.has(item.payload.complaintId),
      );
    }
    return Object.freeze({
      status(options = {}) {
        const actor = getActor(options);
        requireRole(actor, ['admin', 'supervisor']);
        return eventQueue.status();
      },
      events(options = {}) {
        const actor = getActor(options);
        requireRole(actor, ['admin', 'supervisor']);
        return paginate(scopeList(eventQueue.listEvents(), actor), options);
      },
      deliveries(options = {}) {
        const actor = getActor(options);
        requireRole(actor, ['admin', 'supervisor']);
        return paginate(scopeList(eventQueue.listDeliveries(), actor), options);
      },
      templates(options = {}) {
        const actor = getActor(options);
        requireRole(actor, ['admin', 'supervisor']);
        return CLONE(store().automationTemplates);
      },
      setAvailability(available, options = {}) {
        const actor = getActor(options);
        requireRole(actor, ['admin']);
        return eventQueue.setAvailable(available);
      },
    });
  }

  function makeReportsApi() {
    function getRows(options = {}) {
      const actor = getActor(options);
      requireRole(actor, ['admin', 'supervisor']);
      const filters = options.filters ?? options;
      return scopedComplaints(actor).filter((complaint) => {
        if (filters.status && complaint.status !== filters.status) return false;
        if (filters.categoryId && complaint.categoryId !== filters.categoryId) return false;
        if (filters.locality && complaint.locality !== filters.locality) return false;
        return true;
      });
    }
    function quoteCsv(value) {
      const text = String(value ?? '');
      const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
      return `"${safe.replaceAll('"', '""')}"`;
    }
    return Object.freeze({
      build(options = {}) {
        const rows = getRows(options);
        const report = {
          id: `REPORT-${Date.now().toString(36)}`,
          filters: CLONE(options.filters ?? {}),
          generatedAt: clock.now(),
          dataLabel: 'SYNTHETIC',
          total: rows.length,
          byStatus: rows.reduce((counts, complaint) => {
            counts[complaint.status] = (counts[complaint.status] ?? 0) + 1;
            return counts;
          }, {}),
          complaintIds: rows.map((complaint) => complaint.id),
        };
        transact((draft) => {
          draft.builtReports.unshift(report);
          return report;
        });
        return report;
      },
      exportCsv(options = {}) {
        const rows = getRows(options);
        const headers = ['id', 'status', 'category', 'departmentId', 'locality', 'createdAt'];
        const csv = [
          headers.map(quoteCsv).join(','),
          ...rows.map((complaint) =>
            [
              complaint.id,
              complaint.status,
              complaint.category,
              complaint.departmentId,
              complaint.locality,
              complaint.createdAt,
            ]
              .map(quoteCsv)
              .join(','),
          ),
        ].join('\r\n');
        return {
          filename: `civiclens-report-${clock.timestamp()}.csv`,
          contentType: 'text/csv;charset=utf-8',
          csv,
          rows: rows.length,
        };
      },
    });
  }

  function makeClockApi() {
    function authorize(options) {
      const actor = getActor(options);
      requireRole(actor, ['admin']);
    }
    return Object.freeze({
      now(options = {}) {
        authorize(options);
        return clock.now();
      },
      advanceBy(milliseconds, options = {}) {
        authorize(options);
        return { now: clock.advanceBy(milliseconds) };
      },
      advanceTo(value, options = {}) {
        authorize(options);
        return { now: clock.advanceTo(value) };
      },
    });
  }

  function advanceTime(timestamp) {
    const currentTime = Number(timestamp);
    const eventRecords = [];
    transact((draft) => {
      draft.slaTrackers.forEach((tracker) => {
        if (
          !tracker.startedAt ||
          ['completed', 'not_started', 'verification'].includes(tracker.state)
        ) {
          return;
        }
        const complaint = draft.complaints.find((item) => item.id === tracker.complaintId);
        if (!complaint || TERMINAL_STATUSES.has(complaint.status)) {
          tracker.state = 'completed';
          return;
        }
        const policy = policyFor(complaint, draft);
        const startedAt = Date.parse(tracker.startedAt);
        const elapsed = currentTime - startedAt;
        const duration = Number(policy.durationMs);
        const warningElapsed = (duration * Number(policy.warningPercent ?? 75)) / 100;
        if (elapsed >= warningElapsed && !tracker.warningSentAt) {
          tracker.state = 'warning';
          tracker.warningSentAt = new Date(currentTime).toISOString();
          eventRecords.push({
            type: 'sla.warning',
            complaintId: complaint.id,
            state: tracker.state,
          });
          appendAudit(draft, 'sla_warning', null, complaint, { state: tracker.state });
        }
        if (elapsed >= duration && !tracker.breachSentAt) {
          tracker.state = 'breached';
          tracker.breachedAt = new Date(currentTime).toISOString();
          tracker.breachSentAt = tracker.breachedAt;
          setStatus(complaint, 'Escalated', null, { source: 'virtual_clock_sla' });
          complaint.escalationLevel = Math.max(complaint.escalationLevel ?? 0, 1);
          eventRecords.push({
            type: 'sla.breach',
            complaintId: complaint.id,
            state: tracker.state,
          });
          appendAudit(draft, 'sla_breached', null, complaint, { breachedAt: tracker.breachedAt });
        }
        const escalationAfter = policy.escalationAfterMs ?? [];
        escalationAfter.forEach((threshold, index) => {
          if (elapsed >= Number(threshold) && tracker.escalationLevel < index + 1) {
            tracker.escalationLevel = index + 1;
            tracker.state = 'escalated';
            complaint.escalationLevel = Math.max(complaint.escalationLevel ?? 0, index + 1);
            if (complaint.status !== 'Escalated')
              setStatus(complaint, 'Escalated', null, { source: 'virtual_clock_escalation' });
            eventRecords.push({
              type: 'sla.escalated',
              complaintId: complaint.id,
              escalationLevel: tracker.escalationLevel,
            });
            appendAudit(draft, 'sla_escalated', null, complaint, {
              escalationLevel: tracker.escalationLevel,
            });
          }
        });
      });

      draft.complaints.forEach((complaint) => {
        const dueAt = complaint.resolution?.verificationDueAt;
        if (
          complaint.status !== 'Citizen Verification' ||
          !dueAt ||
          Date.parse(dueAt) > currentTime
        ) {
          return;
        }
        complaint.resolution.unverified = true;
        complaint.resolution.verificationTimedOutAt = new Date(currentTime).toISOString();
        complaint.resolvedUnverified = true;
        setStatus(complaint, 'Resolved (Unverified)', null, {
          source: 'verification_timeout',
          unverified: true,
        });
        getTracker(complaint.id, draft).state = 'completed';
        eventRecords.push({
          type: 'verification.timeout',
          complaintId: complaint.id,
          unverified: true,
        });
        appendAudit(draft, 'verification_timed_out', null, complaint, {
          unverified: true,
          verificationTimedOutAt: complaint.resolution.verificationTimedOutAt,
        });
      });
    });
    eventRecords.forEach(({ type, ...payload }) => eventQueue.publish(type, payload));
  }

  function makeApi() {
    const review = makeReviewApi();
    const verification = makeVerificationApi();
    const admin = makeAdminApi();
    const geo = makeGeoApi();
    const analytics = makeAnalyticsApi();
    const automation = makeAutomationApi();
    const reports = makeReportsApi();
    return {
      review,
      duplicates: makeDuplicatesApi(),
      clusters: makeClustersApi(),
      sla: makeSlaApi(),
      verification,
      audit: makeAuditApi(),
      admin,
      geo,
      analytics,
      automation,
      reports,
      clock: makeClockApi(),
      advanceTime,
    };
  }

  return makeApi();
}
