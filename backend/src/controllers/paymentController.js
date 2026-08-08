const { Order, OrderItem } = require('../models');
const { asyncHandler } = require('../middlewares/errorHandler');
const paymentService = require('../services/paymentService');

// POST /api/payments/:orderId/retry - regenerate a Mercado Pago preference,
// e.g. if the customer abandoned the first checkout attempt.
const retry = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.orderId, {
    include: [{ model: OrderItem, as: 'items' }],
  });
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });
  if (order.payment_status === 'approved') {
    return res.status(409).json({ error: 'Este pedido já foi pago.' });
  }

  const preference = await paymentService.createPreference(order, order.items);
  order.mp_preference_id = preference.preferenceId;
  await order.save();

  res.json({ payment: preference });
});

// POST /api/payments/webhook - Mercado Pago sends notifications here whenever
// a payment's status changes. We re-fetch the payment from Mercado Pago's API
// (never trust the webhook body alone) before updating our own order.
const webhook = asyncHandler(async (req, res) => {
  // Acknowledge immediately; Mercado Pago retries aggressively on non-2xx.
  res.sendStatus(200);

  try {
    const paymentId = req.query['data.id'] || req.body?.data?.id || req.body?.id;
    const type = req.query.type || req.body?.type;
    if (type !== 'payment' || !paymentId) return;

    const payment = await paymentService.getPayment(paymentId);
    const orderNumber = payment.external_reference;
    if (!orderNumber) return;

    const order = await Order.findOne({ where: { order_number: orderNumber } });
    if (!order) return;

    order.mp_payment_id = String(payment.id);

    const statusMap = {
      approved: 'approved',
      pending: 'pending',
      in_process: 'pending',
      rejected: 'rejected',
      refunded: 'refunded',
      cancelled: 'cancelled',
    };
    order.payment_status = statusMap[payment.status] || order.payment_status;

    if (payment.status === 'approved' && order.status === 'pending_payment') {
      order.status = 'paid';
    }
    if (payment.status === 'rejected' && order.status === 'pending_payment') {
      order.status = 'cancelled';
    }

    await order.save();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Erro ao processar webhook do Mercado Pago:', err.message);
  }
});

module.exports = { retry, webhook };
