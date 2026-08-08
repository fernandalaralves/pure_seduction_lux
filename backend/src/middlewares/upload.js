const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const MAX_FILE_SIZE_MB = 20;

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


function createImageUpload(subdir, { maxFiles = 1 } = {}) {
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', subdir);
  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });

  const instance = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: maxFiles },
    fileFilter: (req, file, cb) => {
      
      if (!ALLOWED_TYPES.has(file.mimetype)) {
        return cb(new Error('Formato de imagem inválido. Use JPG, PNG ou WEBP.'));
      }
      cb(null, true);
    },
  });

  instance.MAX_FILE_SIZE_MB = MAX_FILE_SIZE_MB;
  instance.validateUploadedImages = validateUploadedImages;
  return instance;
}

module.exports = {
  products: createImageUpload('products', { maxFiles: 6 }),
  categories: createImageUpload('categories', { maxFiles: 1 }),
};
