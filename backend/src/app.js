const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const lifecycleRoutes = require('./routes/lifecycle');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');
const { query } = require('./config/db');
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
const openapi = { openapi: '3.0.0', info: { title: 'Civic-Lens API', version: '0.1.0' }, paths: {
  '/api/auth/login': { post: { summary: 'Authenticate a user' } },
  '/api/complaints': { get: { summary: 'List complaints by role' }, post: { summary: 'Submit and analyze a complaint' } },
  '/api/complaints/{id}/review': { post: { summary: 'Officer review with mandatory reason' } },
  '/api/complaints/{id}/resolutions': { post: { summary: 'Submit resolution for citizen verification' } },
  '/api/complaints/{id}/verify': { post: { summary: 'Citizen accepts or rejects a resolution' } }
  ,'/api/admin/audit': { get: { summary: 'Admin-only append-only AI decision audit and CSV export' } }
} };
app.get('/health', async (_req, res, next) => {
  try { await query('SELECT 1'); res.json({ status: 'ok' }); } catch (err) { next(err); }
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.use('/api/auth', authRoutes);
app.use('/api/complaints', lifecycleRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use(errorHandler);
module.exports = app;
