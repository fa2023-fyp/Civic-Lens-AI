const URGENCY_HOURS = { Critical: 4, High: 24, Medium: 72, Low: 120 };
async function deadlineFrom(urgency, category, now = new Date()) {
  const { query } = require('../config/db');
  const policy = await query('SELECT hours FROM sla_policies WHERE category=$1 AND urgency=$2', [category, urgency]);
  const deadline = new Date(now);
  deadline.setHours(deadline.getHours() + (policy.rows[0]?.hours || URGENCY_HOURS[urgency] || 72));
  return deadline;
}
module.exports = { deadlineFrom };
