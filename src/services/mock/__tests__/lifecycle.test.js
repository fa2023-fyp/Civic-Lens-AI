import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '../../api.js';

async function login(email) {
  return api.auth.login({ email, password: 'Demo123!' });
}

describe('mock complaint lifecycle', () => {
  beforeEach(async () => {
    await api.reset();
  });

  it('does not resolve a complaint until its citizen accepts the proposed resolution', async () => {
    const officer = await login('officer@demo.civiclens.test');
    const complaintId = 'SYN-0006';

    await api.verification.submitResolution(
      complaintId,
      { description: 'The streetlight wiring was checked and repaired.' },
      { token: officer.token },
    );
    await expect(
      api.verification.accept(complaintId, {}, { token: officer.token }),
    ).rejects.toMatchObject({ status: 403, code: 'FORBIDDEN' });
    expect((await api.complaints.get(complaintId, { token: officer.token })).status).toBe(
      'Citizen Verification',
    );

    const citizen = await login('citizen3@demo.civiclens.test');
    const resolved = await api.verification.accept(complaintId, {}, { token: citizen.token });
    expect(resolved.status).toBe('Resolved');
    expect(resolved.verifiedBy).toBe(citizen.user.id);
  });

  it('requires rejection reasons and escalates after the second rejection', async () => {
    const complaintId = 'SYN-0006';
    const officer = await login('officer@demo.civiclens.test');
    await api.verification.submitResolution(
      complaintId,
      { description: 'The streetlight wiring was checked and repaired.' },
      { token: officer.token },
    );

    const citizen = await login('citizen3@demo.civiclens.test');
    await expect(
      api.verification.reject(complaintId, {}, { token: citizen.token }),
    ).rejects.toMatchObject({ code: 'REASON_REQUIRED' });
    const first = await api.verification.reject(
      complaintId,
      { reason: 'The light is still not working.' },
      { token: citizen.token },
    );
    expect(first.status).toBe('Reopened');
    expect(first.rejectionCount).toBe(1);

    const assignedOfficer = await login('officer@demo.civiclens.test');
    await api.verification.submitResolution(
      complaintId,
      { description: 'A replacement lamp was installed.' },
      { token: assignedOfficer.token },
    );
    const sameCitizen = await login('citizen3@demo.civiclens.test');
    const second = await api.verification.reject(
      complaintId,
      { reason: 'The replacement has not fixed the outage.' },
      { token: sameCitizen.token },
    );
    expect(second.status).toBe('Escalated');
    expect(second.rejectionCount).toBe(2);
    expect(second.escalationLevel).toBeGreaterThanOrEqual(1);
  }, 20_000);

  it('keeps low-confidence review-queue complaints unassigned and without an SLA timer', async () => {
    const supervisor = await login('supervisor2@demo.civiclens.test');
    const queued = await api.review.queue({ token: supervisor.token, pageSize: 100 });
    const complaint = queued.items.find((item) => item.id === 'SYN-0004');

    expect(complaint).toBeDefined();
    expect(complaint.assignedOfficerId).toBeNull();
    expect(complaint.sla).toMatchObject({
      state: 'not_started',
      startedAt: null,
      dueAt: null,
    });
    expect(await api.sla.get('SYN-0004', { token: supervisor.token })).toMatchObject({
      state: 'not_started',
      startedAt: null,
      dueAt: null,
    });
  });
});
