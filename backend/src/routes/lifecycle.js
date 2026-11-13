const express = require('express');
const { query, pool } = require('../config/db');
const { authenticate, allow } = require('../middleware/auth');
const { escalate } = require('../services/escalationService');
const upload = require('../middleware/upload');
const router = express.Router();

router.post('/webhooks/sla-breach', async (req, res, next) => {
  const { webhookSecret } = require('../config/env');
  if (req.headers['x-civic-webhook-secret'] !== webhookSecret) return res.status(401).json({ error: 'Invalid webhook secret' });
  try {
    const overdue = await query("SELECT c.id FROM complaints c LEFT JOIN sla_tracking s ON s.complaint_id=c.id WHERE c.deadline_at < now() AND c.status <> 'Resolved' AND COALESCE(s.escalation_state,'none') <> 'escalated' LIMIT 500");
    for (const item of overdue.rows) await escalate(item.id, 'SLA deadline passed; automated reminder escalation');
    res.json({ escalated: overdue.rowCount });
  } catch (err) { next(err); }
});

router.post('/webhooks/sla-reminder', async (req, res, next) => {
  const { webhookSecret } = require('../config/env');
  if (req.headers['x-civic-webhook-secret'] !== webhookSecret) return res.status(401).json({ error: 'Invalid webhook secret' });
  try {
    const due = await query("SELECT id,citizen_id FROM complaints WHERE deadline_at BETWEEN now() AND now() + interval '4 hours' AND status <> 'Resolved' LIMIT 500");
    let created = 0;
    for (const complaint of due.rows) {
      if (!complaint.citizen_id) continue;
      const result = await query(`INSERT INTO notifications(user_id,complaint_id,message)
        SELECT $1,$2,'A civic complaint is approaching its SLA deadline.'
        WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE complaint_id=$2 AND message='A civic complaint is approaching its SLA deadline.')`,
      [complaint.citizen_id, complaint.id]);
      created += result.rowCount;
    }
    res.json({ reminders_recorded: created });
  } catch (err) { next(err); }
});

router.use(authenticate);
router.post('/:id/start', allow('officer'), async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query("UPDATE complaints SET status='In Progress' WHERE id=$1 AND department_id=$2 AND status='Assigned' RETURNING id", [req.params.id, req.user.departmentId]);
    if (!result.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Complaint must be assigned to your department before work begins' });
    }
    await client.query("UPDATE sla_tracking SET started_at=COALESCE(started_at,now()) WHERE complaint_id=$1", [req.params.id]);
    await client.query("INSERT INTO complaint_status_history(complaint_id,status,actor_id,note) VALUES($1,'In Progress',$2,'Officer started work')", [req.params.id, req.user.id]);
    await client.query('COMMIT');
    res.json({ id: req.params.id, status: 'In Progress' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally { client.release(); }
});

router.post('/:id/resolutions', allow('officer'), upload.fields([{ name: 'before_image', maxCount: 1 }, { name: 'after_image', maxCount: 1 }]), async (req, res, next) => {
  const { description, action_taken } = req.body;
  if (typeof description !== 'string' || !description.trim() || typeof action_taken !== 'string' || !action_taken.trim()) return res.status(400).json({ error: 'Description and action_taken are required' });
  const client = await pool.connect();
  let transactionStarted = false;
  try {
    await client.query('BEGIN');
    transactionStarted = true;
    const complaint = await client.query('SELECT id,citizen_id,status FROM complaints WHERE id=$1 AND department_id=$2 FOR UPDATE', [req.params.id, req.user.departmentId]);
    if (!complaint.rows[0]) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(404).json({ error: 'Complaint not found' });
    }
    if (!['Assigned','In Progress','Reopened'].includes(complaint.rows[0].status)) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(409).json({ error: 'Complaint is not ready for a resolution submission' });
    }
    const latitude = req.body.latitude ? Number(req.body.latitude) : null;
    const longitude = req.body.longitude ? Number(req.body.longitude) : null;
    if ((latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
        (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(400).json({ error: 'Resolution coordinates are invalid' });
    }
    const beforeImage = req.files?.before_image?.[0]?.filename || null;
    const afterImage = req.files?.after_image?.[0]?.filename || null;
    const result = await client.query(`INSERT INTO resolutions(complaint_id,officer_id,description,action_taken,before_media_path,after_media_path,location)
      VALUES($1,$2,$3,$4,$5,$6,CASE WHEN $7::float IS NULL OR $8::float IS NULL THEN NULL ELSE ST_SetSRID(ST_MakePoint($8,$7),4326)::geography END) RETURNING *`,
    [req.params.id, req.user.id, description.trim(), action_taken.trim(), beforeImage, afterImage, latitude, longitude]);
    await client.query("UPDATE complaints SET status='Citizen Verification' WHERE id=$1", [req.params.id]);
    await client.query("INSERT INTO verifications(complaint_id,citizen_id) VALUES($1,$2)", [req.params.id, complaint.rows[0].citizen_id]);
    await client.query("INSERT INTO complaint_status_history(complaint_id,status,actor_id,note) VALUES($1,'Citizen Verification',$2,'Citizen confirmation requested; officer submission does not close the case')", [req.params.id, req.user.id]);
    await client.query('COMMIT');
    transactionStarted = false;
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (transactionStarted) await client.query('ROLLBACK');
    next(err);
  } finally { client.release(); }
});

router.post('/:id/verify', allow('citizen'), async (req, res, next) => {
  const accepted = req.body.accepted;
  if (typeof accepted !== 'boolean') return res.status(400).json({ error: 'accepted must be a boolean' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query("SELECT id FROM complaints WHERE id=$1 AND citizen_id=$2 AND status='Citizen Verification' FOR UPDATE", [req.params.id, req.user.id]);
    if (!found.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Complaint not found' }); }
    await client.query('INSERT INTO verifications(complaint_id,citizen_id,accepted,feedback) VALUES($1,$2,$3,$4)', [req.params.id, req.user.id, accepted, req.body.feedback || null]);
    const status = accepted ? 'Resolved' : 'Reopened';
    await client.query('UPDATE complaints SET status=$2 WHERE id=$1', [req.params.id, status]);
    await client.query('INSERT INTO complaint_status_history(complaint_id,status,actor_id,note) VALUES($1,$2,$3,$4)', [req.params.id, status, req.user.id, req.body.feedback || null]);
    if (!accepted) {
      await client.query('INSERT INTO escalations(complaint_id,reason) VALUES($1,$2)', [req.params.id, 'Citizen rejected submitted resolution']);
      await client.query("UPDATE sla_tracking SET escalation_state='escalated' WHERE complaint_id=$1", [req.params.id]);
    }
    await client.query('COMMIT');
    res.json({ id: req.params.id, status });
  } catch (err) { await client.query('ROLLBACK'); next(err); }
  finally { client.release(); }
});

module.exports = router;
