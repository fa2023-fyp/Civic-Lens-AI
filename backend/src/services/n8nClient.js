const { webhookSecret } = require('../config/env');
async function dispatch(event, payload) {
  const url = process.env.N8N_WEBHOOK_URL;
  if (!url) return { delivered: false, reason: 'N8N_WEBHOOK_URL is not configured' };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-civic-webhook-secret': webhookSecret },
    body: JSON.stringify({ event, ...payload })
  });
  if (!response.ok) throw new Error(`n8n webhook returned ${response.status}`);
  return { delivered: true };
}
module.exports = { dispatch };
