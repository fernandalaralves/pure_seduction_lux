const { Router } = require('express');
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');
const settingsController = require('../controllers/settingsController');
const { requireCustomerAuth, optionalCustomerAuth } = require('../middlewares/auth');

const router = Router();

// Auth (customer)
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', requireCustomerAuth, authController.me);

// Catalog
router.get('/products', productController.list);
router.get('/products/featured', productController.featured);
router.get('/products/:slug', productController.getBySlug);
router.get('/categories', categoryController.list);

// Store settings (public subset)
router.get('/settings', settingsController.getPublic);

// Orders (guest checkout allowed; optionalCustomerAuth links the order to an
// account when the customer happens to be logged in)
router.post('/orders', optionalCustomerAuth, orderController.create);
router.get('/orders/mine', requireCustomerAuth, orderController.listMine);
router.get('/orders/:id', optionalCustomerAuth, orderController.getById);

// Payments
router.post('/payments/:orderId/retry', paymentController.retry);
router.post('/payments/webhook', paymentController.webhook);

module.exports = router;
