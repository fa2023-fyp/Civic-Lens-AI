require('dotenv').config();
module.exports = {
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://civic_lens:change-me-locally@localhost:5432/civic_lens',
  jwtSecret: process.env.JWT_SECRET || 'development-only-change-this-secret',
  aiUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  webhookSecret: process.env.N8N_WEBHOOK_SECRET || 'development-webhook-secret',
  reviewThreshold: Number(process.env.AI_REVIEW_THRESHOLD || 0.55)
};
