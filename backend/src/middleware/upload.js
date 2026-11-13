const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, done) => done(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`)
});
module.exports = multer({
  storage, limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, done) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
    ? done(null, true) : done(new Error('Only JPEG, PNG, and WebP images are accepted'))
});
