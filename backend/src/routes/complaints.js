const express = require('express');
const { query, pool } = require('../config/db');
const { authenticate, allow } = require('../middleware/auth');
const { analyze } = require('../services/aiClient');
const { deadlineFrom } = require('../services/slaService');
const upload = require('../middleware/upload');
const router = express.Router();
router.use(authenticate);

router.post('/', allow('citizen'), upload.array('images', 5), async (req, res, next) => {
  let client;
  let transactionStarted = false;
  try {
    const text = req.body.text;
    if (typeof text !== 'string' || text.trim().length < 3 || text.length > 10000) return res.status(400).json({ error: 'Complaint text must contain 3 to 10000 characters' });
    const latitude = req.body.latitude === undefined || req.body.latitude === '' ? null : Number(req.body.latitude);
    const longitude = req.body.longitude === undefined || req.body.longitude === '' ? null : Number(req.body.longitude);
    if ((latitude === null) !== (longitude === null) ||
        (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
        (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))) {
      return res.status(400).json({ error: 'Provide both valid latitude and longitude coordinates or neither' });
    }
    const existing = await query("SELECT id,normalized_text AS text FROM complaints WHERE is_synthetic=false AND status <> 'Resolved' ORDER BY created_at DESC LIMIT 100");
    const ai = await analyze(text, existing.rows);
    const department = await query('SELECT id FROM departments WHERE category=$1 OR name=$2 LIMIT 1', [ai.category.label, ai.department.label]);
    const departmentId = department.rows[0] && department.rows[0].id;
    const deadline = await deadlineFrom(ai.urgency.label, ai.category.label);
    client = await pool.connect();
    await client.query('BEGIN');
    transactionStarted = true;
    const complaint = await client.query(
      `INSERT INTO complaints(citizen_id,original_text,normalized_text,detected_language,category,department_id,urgency,status,needs_human_review,area,location,deadline_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CASE WHEN $11::float IS NULL OR $12::float IS NULL THEN NULL ELSE ST_SetSRID(ST_MakePoint($12,$11),4326)::geography END,$13)
       RETURNING id,original_text,normalized_text,detected_language,category,urgency,status,needs_human_review,created_at,deadline_at`,
      [req.user.id, text, ai.normalized_text, ai.language, ai.category.label, departmentId, ai.urgency.label,
       ai.needs_human_review ? 'Human Review' : 'Created', ai.needs_human_review, ai.extraction.area || null,
       latitude, longitude, deadline]
    );
    const item = complaint.rows[0];
    await client.query('INSERT INTO ai_decisions(complaint_id,original_text,detected_language,normalized_text,predicted_category,predicted_department,predicted_urgency,category_confidence,department_confidence,urgency_confidence,explanation,model_version) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
      [item.id, text, ai.language, ai.normalized_text, ai.category.label, ai.department.label, ai.urgency.label,
       ai.category.confidence, ai.department.confidence, ai.urgency.confidence, JSON.stringify(ai), ai.model_versions.classifier]);
    await client.query('INSERT INTO complaint_status_history(complaint_id,status,actor_id,note) VALUES($1,$2,$3,$4)',
      [item.id, item.status, req.user.id, ai.needs_human_review ? 'AI confidence below threshold. Send to human verification queue.' : 'Complaint received']);
    await client.query('INSERT INTO sla_tracking(complaint_id,deadline_at) VALUES($1,$2)', [item.id, deadline]);
    for (const file of req.files || []) await client.query('INSERT INTO complaint_media(complaint_id,media_path,media_type) VALUES($1,$2,$3)', [item.id, file.filename, file.mimetype]);
    await client.query('COMMIT');
    transactionStarted = false;
    res.status(201).json({ ...item, ai });
  } catch (err) {
    if (client && transactionStarted) await client.query('ROLLBACK');
    next(err);
  } finally { if (client) client.release(); }
});

router.get('/', async (req, res, next) => {
  try {
    const result = req.user.role === 'admin'
      ? await query('SELECT id,original_text,category,urgency,status,needs_human_review,area,created_at,deadline_at FROM complaints ORDER BY created_at DESC LIMIT 200')
      : ['officer','supervisor'].includes(req.user.role)
        ? await query('SELECT id,original_text,category,urgency,status,needs_human_review,area,created_at,deadline_at FROM complaints WHERE department_id=$1 ORDER BY created_at DESC LIMIT 200', [req.user.departmentId])
        : await query('SELECT id,original_text,category,urgency,status,needs_human_review,area,created_at,deadline_at FROM complaints WHERE citizen_id=$1 ORDER BY created_at DESC LIMIT 200', [req.user.id]);
    res.json(result.rows);
  } catch (err) { next(err); }
});
router.get('/:id', async (req, res, next) => {
  try {
    const result = await query("SELECT c.*, (SELECT json_agg(h ORDER BY h.created_at) FROM complaint_status_history h WHERE h.complaint_id=c.id) AS timeline, (SELECT row_to_json(a) FROM ai_decisions a WHERE a.complaint_id=c.id ORDER BY a.created_at DESC LIMIT 1) AS ai_decision FROM complaints c WHERE c.id=$1 AND ($2='admin' OR ($2='citizen' AND c.citizen_id=$3) OR ($2 IN ('officer','supervisor') AND c.department_id=$4))", [req.params.id, req.user.role, req.user.id, req.user.departmentId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Complaint not found' });
    res.json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/:id/review', allow('officer','supervisor','admin'), async (req, res, next) => {
  const { category, department, urgency, reason } = req.body;
  if (typeof reason !== 'string' || !reason.trim()) return res.status(400).json({ error: 'A reason is required for officer review or override' });
  if (category && !['sanitation','garbage/waste','sewerage','drainage','water supply','electricity','street lighting','roads','traffic','public infrastructure','parks','municipal services','public safety','other'].includes(category)) {
    return res.status(400).json({ error: 'Unknown complaint category' });
  }
  if (urgency && !['Low','Medium','High','Critical'].includes(urgency)) return res.status(400).json({ error: 'Unknown urgency level' });
  let client;
  let transactionStarted = false;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    transactionStarted = true;
    const previous = await client.query('SELECT * FROM ai_decisions WHERE complaint_id=$1 ORDER BY created_at DESC LIMIT 1', [req.params.id]);
    if (!previous.rows[0]) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(404).json({ error: 'Complaint or AI decision not found' });
    }
    const departmentRow = department ? await client.query('SELECT id FROM departments WHERE name=$1', [department]) : null;
    if (department && !departmentRow.rows[0]) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(400).json({ error: 'Unknown department' });
    }
    const update = await client.query("UPDATE complaints SET category=COALESCE($2,category),urgency=COALESCE($3,urgency),department_id=COALESCE($4,department_id),status='Assigned',needs_human_review=false WHERE id=$1 AND ($5='admin' OR department_id=$6) RETURNING *", [req.params.id, category || null, urgency || null, departmentRow && departmentRow.rows[0].id, req.user.role, req.user.departmentId]);
    if (!update.rows[0]) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(404).json({ error: 'Complaint not found' });
    }
    const audit = previous.rows[0];
    await client.query('INSERT INTO ai_decisions(complaint_id,original_text,detected_language,normalized_text,predicted_category,predicted_department,predicted_urgency,category_confidence,department_confidence,urgency_confidence,explanation,model_name,model_version,human_correction,officer_reason,final_decision,decided_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)',
      [req.params.id, audit.original_text, audit.detected_language, audit.normalized_text, audit.predicted_category, audit.predicted_department, audit.predicted_urgency, audit.category_confidence, audit.department_confidence, audit.urgency_confidence, audit.explanation, audit.model_name, audit.model_version, JSON.stringify({ category, department, urgency }), reason.trim(), JSON.stringify({ category: category || update.rows[0].category, urgency: urgency || update.rows[0].urgency, department: department || audit.predicted_department }), req.user.id]);
    await client.query("INSERT INTO complaint_status_history(complaint_id,status,actor_id,note) VALUES($1,'Assigned',$2,$3)", [req.params.id, req.user.id, reason]);
    await client.query('UPDATE sla_tracking SET assigned_at=COALESCE(assigned_at,now()) WHERE complaint_id=$1', [req.params.id]);
    await client.query('COMMIT');
    transactionStarted = false;
    res.json(update.rows[0]);
  } catch (err) {
    if (client && transactionStarted) await client.query('ROLLBACK');
    next(err);
  } finally { if (client) client.release(); }
});
module.exports = router;
