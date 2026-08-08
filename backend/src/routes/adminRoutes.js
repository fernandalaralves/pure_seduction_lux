const { Router } = require('express');
const adminAuthController = require('../controllers/adminAuthController');
const adminProductController = require('../controllers/adminProductController');
const categoryController = require('../controllers/categoryController');
const adminOrderController = require('../controllers/adminOrderController');
const settingsController = require('../controllers/settingsController');
const { requireAdminAuth } = require('../middlewares/auth');
const { products: productUpload, categories: categoryUpload } = require('../middlewares/upload');

const router = Router();

// Auth
router.post('/auth/login', adminAuthController.login);
router.get('/auth/me', requireAdminAuth, adminAuthController.me);
router.post('/auth/change-password', requireAdminAuth, adminAuthController.changePassword);

// Everything below requires a valid admin session.
router.use(requireAdminAuth);

// Products (add / edit / remove, exactly as requested)
router.get('/products', adminProductController.list);
router.get('/products/:id', adminProductController.getById);
router.post('/products', productUpload.array('images', 6), productUpload.validateUploadedImages, adminProductController.create);
router.put('/products/:id', productUpload.array('images', 6), productUpload.validateUploadedImages, adminProductController.update);
router.patch('/products/:id/status', adminProductController.updateStatus);
router.delete('/products/:id', adminProductController.remove);
router.delete('/products/:id/images/:imageId', adminProductController.removeImage);

// Categories ("coleções" na vitrine)
router.get('/categories', categoryController.list);
router.post(
  '/categories',
  categoryUpload.single('image'),
  categoryUpload.validateUploadedImages,
  categoryController.create
);
router.put(
  '/categories/:id',
  categoryUpload.single('image'),
  categoryUpload.validateUploadedImages,
  categoryController.update
);
router.delete('/categories/:id', categoryController.remove);

// Orders placed by customers - visible to the admin, as required
router.get('/orders', adminOrderController.list);
router.get('/orders/:id', adminOrderController.getById);
router.patch('/orders/:id/status', adminOrderController.updateStatus);
router.patch('/orders/:id/payment-status', adminOrderController.updatePaymentStatus);

// Store settings (incl. the delivery municipality)
router.get('/settings', settingsController.getAdmin);
router.put('/settings', settingsController.update);

module.exports = router;
