const { query } = require('../config/db');

async function escalate(complaintId, reason) {
  await query('INSERT INTO escalations (complaint_id, reason) VALUES ($1, $2)', [complaintId, reason]);
  await query("UPDATE sla_tracking SET escalation_state='escalated' WHERE complaint_id=$1", [complaintId]);
}
module.exports = { escalate };
