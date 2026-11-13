const express = require('express');
const { query } = require('../config/db');
const { authenticate, allow } = require('../middleware/auth');
const { reviewThreshold } = require('../config/env');
const router = express.Router();
router.use(authenticate);

router.get('/audit', allow('admin'), async (req, res, next) => {
  try {
    const result = await query(`SELECT a.*, c.status FROM ai_decisions a JOIN complaints c ON c.id=a.complaint_id ORDER BY a.created_at DESC LIMIT 1000`);
    if (req.query.format === 'csv') {
      const columns = ['complaint_id','original_text','detected_language','normalized_text','predicted_category','predicted_department','predicted_urgency','category_confidence','department_confidence','urgency_confidence','officer_reason','final_decision','created_at'];
      const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
      res.type('text/csv').attachment('civic-lens-ai-audit.csv').send([columns.join(','), ...result.rows.map(row => columns.map(col => quote(row[col])).join(','))].join('\n'));
      return;
    }
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/analytics', allow('admin','supervisor'), async (_req, res, next) => {
  try {
    const [categories, ai] = await Promise.all([
      query('SELECT category,count(*)::int AS count FROM complaints GROUP BY category ORDER BY count DESC'),
      query(`SELECT count(*) FILTER(WHERE human_correction IS NULL)::int AS decisions,
        count(*) FILTER(WHERE human_correction IS NOT NULL)::int AS overrides,
        count(*) FILTER(WHERE human_correction IS NULL AND LEAST(category_confidence,department_confidence,urgency_confidence) < $1)::int AS low_confidence
        FROM ai_decisions`, [reviewThreshold])
    ]);
    const totals = ai.rows[0];
    res.json({
      category_distribution: categories.rows,
      ai_decisions: totals.decisions,
      override_rate: totals.decisions ? totals.overrides / totals.decisions : null,
      low_confidence_routing_rate: totals.decisions ? totals.low_confidence / totals.decisions : null,
      synthetic_records_included: true
    });
  } catch (err) { next(err); }
});

router.get('/users', allow('admin'), async (_req, res, next) => {
  try {
    const result = await query('SELECT id,name,email,role,department_id,created_at FROM users ORDER BY created_at DESC LIMIT 500');
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/heatmap', allow('admin','supervisor'), async (_req, res, next) => {
  try {
    const result = await query(`SELECT round(ST_Y(cell)::numeric,2)::float AS latitude,
      round(ST_X(cell)::numeric,2)::float AS longitude, count(*)::int AS complaint_count
      FROM (SELECT ST_SnapToGrid(location::geometry,0.02) AS cell FROM complaints WHERE location IS NOT NULL AND is_synthetic=false) cells
      GROUP BY cell HAVING count(*) >= 3`);
    res.json(result.rows);
  } catch (err) { next(err); }
});
module.exports = router;
