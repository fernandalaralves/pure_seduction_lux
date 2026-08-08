const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'products');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// 20MB comfortably covers a photo straight off a phone camera (even
// high-resolution ones) without the store owner needing to compress it
// first - the server is the one that should deal with large files, not her.
const MAX_FILE_SIZE_MB = 20;

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    // This only checks the Content-Type header the client sent, which is
    // trivial to spoof - it's a cheap first filter, not the real guard.
    // validateUploadedImages() below is what actually verifies the bytes.
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return cb(new Error('Formato de imagem inválido. Use JPG, PNG ou WEBP.'));
    }
    cb(null, true);
  },
});

upload.MAX_FILE_SIZE_MB = MAX_FILE_SIZE_MB;

// Sniffs the first bytes of a file on disk against known image magic numbers.
// A spoofed Content-Type (e.g. a script renamed to look like a PNG) passes
// multer's fileFilter above but fails this, since the actual file bytes
// don't match any real image format signature.
function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

/** Run this *after* upload.array()/upload.single() in the route chain.
 * Verifies each saved file's real content matches an allowed image type,
 * and deletes the whole batch (so nothing is left orphaned on disk) if any
 * file fails the check. */
function validateUploadedImages(req, res, next) {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files.length) return next();

  const cleanup = () => {
    for (const f of files) {
      fs.unlink(f.path, () => {});
    }
  };

  try {
    for (const file of files) {
      const fd = fs.openSync(file.path, 'r');
      const header = Buffer.alloc(12);
      fs.readSync(fd, header, 0, 12, 0);
      fs.closeSync(fd);

      const detected = detectImageType(header);
      if (!detected || !ALLOWED_TYPES.has(detected)) {
        cleanup();
        return res.status(400).json({ error: 'Arquivo enviado não é uma imagem válida (JPG, PNG ou WEBP).' });
      }
    }
    next();
  } catch (err) {
    cleanup();
    next(err);
  }
}

upload.validateUploadedImages = validateUploadedImages;

module.exports = upload;
