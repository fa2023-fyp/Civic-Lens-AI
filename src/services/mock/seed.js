const SLA_STATES = ['on_track', 'warning', 'breached', 'escalated', 'completed'];
const COMPLAINTS_WITHOUT_SLA = new Set([
  'Submitted',
  'AI Processing',
  'Pending Analysis',
  'Pending Human Review',
]);
const COMPLETED_STATUSES = new Set([
  'Resolved',
  'Resolved (Unverified)',
  'Closed',
  'Rejected',
  'Invalid',
]);
const LOCALITIES = [
  'Model Town',
  'Johar Town',
  'Township',
  'Gulberg',
  'Iqbal Town',
  'Samanabad',
  'Wapda Town',
  'DHA',
];

function iso(value) {
  return new Date(value).toISOString();
}

function seedSlaTrackers(now, complaints) {
  return complaints.map((complaint, index) => {
    if (COMPLAINTS_WITHOUT_SLA.has(complaint.status)) {
      return {
        id: `SYN-SLA-${String(index + 1).padStart(4, '0')}`,
        complaintId: complaint.id,
        state: 'not_started',
        startedAt: null,
        warningAt: null,
        dueAt: null,
        breachedAt: null,
        escalationLevel: 0,
        isSynthetic: true,
        dataLabel: 'SYNTHETIC',
      };
    }
    if (complaint.status === 'Citizen Verification') {
      return {
        id: `SYN-SLA-${String(index + 1).padStart(4, '0')}`,
        complaintId: complaint.id,
        state: 'verification',
        startedAt: null,
        warningAt: null,
        dueAt: null,
        breachedAt: null,
        escalationLevel: 0,
        isSynthetic: true,
        dataLabel: 'SYNTHETIC',
      };
    }

    const state = COMPLETED_STATUSES.has(complaint.status)
      ? 'completed'
      : SLA_STATES[index % (SLA_STATES.length - 1)];
    const durationMs = 8 * 60 * 60 * 1000;
    const startedAt = new Date(complaint.createdAt).getTime();
    const progressMs =
      state === 'on_track'
        ? durationMs * 0.4
        : state === 'warning'
          ? durationMs * 0.8
          : durationMs * 1.3;
    const elapsedStart = Math.min(startedAt, now - progressMs);
    const dueAt = elapsedStart + durationMs;
    const breachedAt = ['breached', 'escalated'].includes(state) ? iso(dueAt) : null;
    return {
      id: `SYN-SLA-${String(index + 1).padStart(4, '0')}`,
      complaintId: complaint.id,
      state,
      startedAt: iso(elapsedStart),
      warningAt: iso(elapsedStart + durationMs * 0.75),
      dueAt: iso(dueAt),
      breachedAt,
      escalationLevel: state === 'escalated' ? 1 + (index % 3) : 0,
      isSynthetic: true,
      dataLabel: 'SYNTHETIC',
    };
  });
}

function seedClusters(complaints, now) {
  const categories = [
    ['sewerage', 'Sewer overflow reports around Model Town'],
    ['street-lighting', 'Street lighting reports near Johar Town'],
    ['roads', 'Road surface reports around Gulberg'],
    ['water-supply', 'Water supply reports in Township'],
    ['garbage', 'Waste collection reports in Iqbal Town'],
    ['drainage', 'Drainage reports around Samanabad'],
  ];
  return categories.map(([categoryId, title], index) => ({
    id: `SYN-CLUSTER-${String(index + 1).padStart(2, '0')}`,
    title,
    categoryId,
    locality: LOCALITIES[index],
    complaintIds: complaints
      .filter((complaint) => complaint.categoryId === categoryId)
      .slice(0, 6)
      .map((complaint) => complaint.id),
    status: index % 3 === 0 ? 'proposed' : 'confirmed',
    confidence: Number((0.79 + (index % 5) * 0.04).toFixed(2)),
    createdAt: iso(now - (index + 2) * 60 * 60 * 1000),
    isSynthetic: true,
    dataLabel: 'SYNTHETIC',
  }));
}

function seedAuditEvents(now, complaints, users) {
  const actors = users.filter((user) => ['supervisor', 'officer', 'admin'].includes(user.role));
  const overrides = [
    ['category', 'sewerage', 'drainage', 'Clarified after site review'],
    ['department', 'dept-infrastructure', 'dept-water', 'Routing corrected after review'],
    ['urgency', 'medium', 'high', 'Safety indicators reviewed'],
    ['category', 'roads', 'drainage', 'Human review of reported location'],
  ];
  return Array.from({ length: 25 }, (_item, index) => {
    const complaint = complaints[index % complaints.length];
    const actor = actors[index % actors.length];
    const override = index % 6 === 0 ? overrides[Math.floor(index / 6) % overrides.length] : null;
    const createdAt = iso(now - (index + 1) * 45 * 60 * 1000);
    return {
      id: `SYN-AUDIT-${String(index + 1).padStart(3, '0')}`,
      sequence: index + 1,
      action: override
        ? 'ai_override'
        : ['complaint_reviewed', 'status_changed', 'sla_checked'][index % 3],
      complaintId: complaint.id,
      actorId: actor.id,
      actorRole: actor.role,
      createdAt,
      ...(override
        ? {
            field: override[0],
            aiValue: override[1],
            humanValue: override[2],
            reason: override[3],
            user: { id: actor.id, name: actor.name },
            time: createdAt,
          }
        : {}),
      isSynthetic: true,
      dataLabel: 'SYNTHETIC',
    };
  });
}

function seedMapPoints(now, complaints) {
  const center = { lat: 31.5204, lng: 74.3587 };
  const categories = [...new Set(complaints.map((complaint) => complaint.categoryId))];
  const states = ['Assigned', 'In Progress', 'Escalated', 'Resolved', 'Pending Human Review'];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: 5000 }, (_item, index) => {
    const radiusKm = 0.25 + 6.5 * Math.sqrt((index + 0.5) / 5000);
    const angle = index * goldenAngle;
    const lat = center.lat + (radiusKm / 111) * Math.sin(angle);
    const lng =
      center.lng + (radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180))) * Math.cos(angle);
    return {
      id: `SYN-GEO-${String(index + 1).padStart(5, '0')}`,
      complaintId: complaints[index % complaints.length].id,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      locality: LOCALITIES[index % LOCALITIES.length],
      categoryId: categories[index % categories.length],
      status: states[index % states.length],
      createdAt: iso(now - (index % 30) * 24 * 60 * 60 * 1000),
      isSynthetic: true,
      dataLabel: 'SYNTHETIC',
    };
  });
}

export function createDomainSeed({ now, complaints, users, departments, categories }) {
  return {
    clusters: seedClusters(complaints, now),
    slaTrackers: seedSlaTrackers(now, complaints),
    slaPolicies: departments.map((department) => ({
      id: `SYN-SLA-POLICY-${department.id}`,
      departmentId: department.id,
      categoryId: null,
      durationMs: 8 * 60 * 60 * 1000,
      warningPercent: 75,
      verificationTimeoutMs: 14 * 24 * 60 * 60 * 1000,
      escalationAfterMs: [8 * 60 * 60 * 1000, 12 * 60 * 60 * 1000, 24 * 60 * 60 * 1000],
      active: true,
      isSynthetic: true,
      dataLabel: 'SYNTHETIC',
    })),
    auditEvents: seedAuditEvents(now, complaints, users),
    mapPoints: seedMapPoints(now, complaints),
    duplicateCandidates: complaints.slice(0, 18).map((complaint, index) => ({
      id: `SYN-DUP-${String(index + 1).padStart(3, '0')}`,
      complaintId: complaint.id,
      candidateComplaintId: complaints[(index + 12) % complaints.length].id,
      score: Number((0.78 + (index % 5) * 0.04).toFixed(2)),
      state: index % 4 === 0 ? 'confirmed' : 'pending',
      createdAt: iso(now - (index + 1) * 20 * 60 * 1000),
      isSynthetic: true,
      dataLabel: 'SYNTHETIC',
    })),
    models: [
      {
        id: 'classifier-v1.3',
        type: 'classifier',
        version: 'v1.3',
        active: true,
        status: 'active',
        activatedAt: iso(now - 7 * 86400000),
        isSynthetic: true,
        dataLabel: 'SYNTHETIC',
      },
      {
        id: 'extractor-v0.9',
        type: 'extractor',
        version: 'v0.9',
        active: true,
        status: 'active',
        activatedAt: iso(now - 5 * 86400000),
        isSynthetic: true,
        dataLabel: 'SYNTHETIC',
      },
      {
        id: 'embedding-v1.0',
        type: 'embedding',
        version: 'v1.0',
        active: true,
        status: 'active',
        activatedAt: iso(now - 3 * 86400000),
        isSynthetic: true,
        dataLabel: 'SYNTHETIC',
      },
      {
        id: 'classifier-v1.2',
        type: 'classifier',
        version: 'v1.2',
        active: false,
        status: 'inactive',
        activatedAt: iso(now - 30 * 86400000),
        isSynthetic: true,
        dataLabel: 'SYNTHETIC',
      },
    ],
    featureFlags: [
      { key: 'duplicate-suggestions', enabled: true },
      { key: 'cluster-proposals', enabled: true },
      { key: 'sla-risk-refresh', enabled: true },
      { key: 'automation-delivery', enabled: true },
    ],
    thresholds: {
      languageConfidence: 0.6,
      classificationConfidence: 0.7,
      departmentConfidence: 0.75,
      duplicateRadiusMeters: 500,
      duplicateWindowDays: 30,
      slaWarningPercent: 75,
      slaRiskRefreshMinutes: 15,
      rejectionEscalationCount: 2,
    },
    departmentMapping: departments.map((department) => ({
      departmentId: department.id,
      categoryIds: categories
        .filter((category) => category.departmentId === department.id)
        .map((category) => category.id),
    })),
    automationTemplates: [
      {
        id: 'complaint-submitted',
        name: 'Complaint submitted',
        event: 'complaint.submitted',
        active: true,
      },
      { id: 'sla-warning', name: 'SLA warning', event: 'sla.warning', active: true },
      { id: 'sla-breach', name: 'SLA breach', event: 'sla.breach', active: true },
      {
        id: 'verification-timeout',
        name: 'Verification timeout',
        event: 'verification.timeout',
        active: true,
      },
    ],
    automationAvailability: true,
    builtReports: [],
    analytics: {
      generatedAt: iso(now),
      dataLabel: 'SYNTHETIC',
    },
  };
}
