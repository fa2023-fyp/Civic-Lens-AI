const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { jwtSecret } = require('../config/env');
const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 10) return res.status(400).json({ error: 'Name, email, and password (10+ characters) are required' });
    const hash = await bcrypt.hash(password, 12);
    const result = await query("INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'citizen') RETURNING id,name,email,role", [name, email.toLowerCase(), hash]);
    res.status(201).json(result.rows[0]);
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const result = await query('SELECT id,name,email,role,password_hash,department_id FROM users WHERE email=$1', [(req.body.email || '').toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, role: user.role, departmentId: user.department_id }, jwtSecret, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
});
module.exports = router;
