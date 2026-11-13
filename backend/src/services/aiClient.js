const { aiUrl } = require('../config/env');

async function analyze(text, candidates = []) {
  const response = await fetch(`${aiUrl}/analyze`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, candidates })
  });
  if (!response.ok) throw new Error(`AI analysis failed (${response.status})`);
  return response.json();
}
module.exports = { analyze };
