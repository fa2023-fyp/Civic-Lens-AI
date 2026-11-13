const app = require('./app');
const { port } = require('./config/env');
const { pool, query } = require('./config/db');

async function start() {
  const categories = [
    ['Municipal Sewerage Department','sewerage'],['Drainage Department','drainage'],
    ['Waste Management Department','garbage/waste'],['Water Supply Department','water supply'],
    ['Electricity Department','electricity'],['Street Lighting Department','street lighting'],
    ['Roads Department','roads'],['Traffic Department','traffic'],['Municipal Services Department','other']
  ];
  for (const [name, category] of categories) {
    await query('INSERT INTO departments(name,category) VALUES($1,$2) ON CONFLICT(name) DO NOTHING', [name, category]);
  }
  app.listen(port, () => console.log(`Civic-Lens backend listening on ${port}`));
}
start().catch(async error => { console.error('Backend startup failed', error); await pool.end(); process.exit(1); });
