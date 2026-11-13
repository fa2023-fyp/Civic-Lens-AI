const fs = require('fs');
const { parse } = require('csv-parse/sync');
const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');

const departments = [
  ['Municipal Sanitation Department','sanitation'], ['Waste Management Department','garbage/waste'],
  ['Municipal Sewerage Department','sewerage'], ['Drainage Department','drainage'],
  ['Water Supply Department','water supply'], ['Electricity Department','electricity'],
  ['Street Lighting Department','street lighting'], ['Roads Department','roads'],
  ['Traffic Department','traffic'], ['Municipal Services Department','public infrastructure'],
  ['Parks Department','parks'], ['Municipal Services Department','municipal services'],
  ['Municipal Services Department','public safety'], ['Municipal Services Department','other']
];
const categories = [...new Set(departments.map(row => row[1]))];
const userSeeds = [
  ['Demo Citizen','citizen@example.local','citizen',null],
  ['Demo Officer','officer@example.local','officer','Municipal Sewerage Department'],
  ['Demo Supervisor','supervisor@example.local','supervisor','Municipal Sewerage Department'],
  ['Demo Administrator','admin@example.local','admin',null]
];

async function seed() {
  for (const [name, category] of departments) {
    await query('INSERT INTO departments(name,category) VALUES($1,$2) ON CONFLICT(name) DO NOTHING', [name, category]);
  }
  for (const category of categories) {
    for (const [urgency, hours] of Object.entries({ Critical: 4, High: 24, Medium: 72, Low: 120 })) {
      await query('INSERT INTO sla_policies(category,urgency,hours) VALUES($1,$2,$3) ON CONFLICT(category,urgency) DO UPDATE SET hours=EXCLUDED.hours', [category, urgency, hours]);
    }
  }
  for (const [name, email, role, departmentName] of userSeeds) {
    const hash = await bcrypt.hash('LocalDemo-Only-ChangeMe!', 12);
    const department = departmentName ? await query('SELECT id FROM departments WHERE name=$1', [departmentName]) : { rows: [] };
    await query('INSERT INTO users(name,email,password_hash,role,department_id) VALUES($1,$2,$3,$4,$5) ON CONFLICT(email) DO NOTHING', [name, email, hash, role, department.rows[0]?.id || null]);
  }
  const dataset = process.env.SYNTHETIC_DATA_PATH || '/data/synthetic/SYNTHETIC_complaints.csv';
  if (fs.existsSync(dataset)) {
    const rows = parse(fs.readFileSync(dataset), { columns: true, skip_empty_lines: true });
    for (const row of rows) {
      if (row.is_synthetic !== 'true') throw new Error('Refusing to seed a row not labeled SYNTHETIC');
      const department = await query('SELECT id FROM departments WHERE category=$1 LIMIT 1', [row.category]);
      await query(`INSERT INTO complaints(source_ref,is_synthetic,original_text,normalized_text,detected_language,category,department_id,urgency,status,area,location)
        VALUES($1,true,$2,$2,$3,$4,$5,$6,$7,$8,ST_SetSRID(ST_MakePoint($9,$10),4326)::geography)
        ON CONFLICT(source_ref) DO NOTHING`,
      [row.complaint_id, row.complaint_text, row.language, row.category, department.rows[0]?.id || null, row.urgency, row.status, row.location, row.longitude, row.latitude]);
    }
    console.log(`Loaded ${rows.length} labeled SYNTHETIC rows (existing rows are left unchanged).`);
  } else {
    console.log(`Synthetic CSV not found at ${dataset}; seeded departments, SLA policies and local demo users only.`);
  }
  console.log('Demo credentials: citizen@example.local, officer@example.local, supervisor@example.local, admin@example.local; password LocalDemo-Only-ChangeMe! (local demonstration only).');
}

seed().catch(error => { console.error('Seed failed', error); process.exitCode = 1; }).finally(() => pool.end());
