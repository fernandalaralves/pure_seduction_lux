const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configura o Cloudinary com as credenciais (que virão das variáveis de ambiente)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Função que cria o storage do Cloudinary para uma pasta específica
function createCloudinaryStorage(folderName) {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `pure_seduction/${folderName}`, // Ex: pure_seduction/products
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit' }], // Redimensiona imagens muito grandes
    },
  });
}

// Cria as instâncias do Multer
const uploadProducts = multer({
  storage: createCloudinaryStorage('products'),
  limits: { fileSize: 20 * 1024 * 1024, files: 6 }, // 20MB e até 6 arquivos
});

const uploadCategories = multer({
  storage: createCloudinaryStorage('categories'),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 }, // 20MB e 1 arquivo
});

module.exports = {
  products: uploadProducts,
  categories: uploadCategories,
};