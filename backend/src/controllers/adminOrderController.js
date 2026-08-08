const { Op } = require('sequelize');
const { Order, OrderItem, Address, Customer } = require('../models');
const { asyncHandler } = require('../middlewares/errorHandler');

const INCLUDE = [
  { model: OrderItem, as: 'items' },
  { model: Address, as: 'deliveryAddress' },
  { model: Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
];

// GET /api/admin/orders - every order placed by customers, newest first
const list = asyncHandler(async (req, res) => {
  const { status, fulfillmentType, search } = req.query;
  const where = {};
  if (status && status !== 'todos') where.status = status;
  if (fulfillmentType && fulfillmentType !== 'todos') where.fulfillment_type = fulfillmentType;
  if (search) {
    where[Op.or] = [
      { order_number: { [Op.iLike]: `%${search}%` } },
      { customer_name: { [Op.iLike]: `%${search}%` } },
      { customer_email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const orders = await Order.findAll({ where, include: INCLUDE, order: [['createdAt', 'DESC']] });
  res.json({ orders });
});

const getById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, { include: INCLUDE });
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
  res.json({ order });
});

// PATCH /api/admin/orders/:id/status - move the order through its lifecycle
const updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

  const { status } = req.body;
  if (!Order.STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Status inválido.' });
  }

  order.status = status;
  await order.save();
  res.json({ order });
});

// PATCH /api/admin/orders/:id/payment-status - e.g. mark a cash order as paid
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

  const { paymentStatus } = req.body;
  if (!Order.PAYMENT_STATUSES.includes(paymentStatus)) {
    return res.status(400).json({ error: 'Status de pagamento inválido.' });
  }

  order.payment_status = paymentStatus;
  await order.save();
  res.json({ order });
});

module.exports = { list, getById, updateStatus, updatePaymentStatus };
