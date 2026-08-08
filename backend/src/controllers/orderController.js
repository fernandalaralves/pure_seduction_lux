const { sequelize, Product, Order, OrderItem, Address } = require('../models');
const { asyncHandler } = require('../middlewares/errorHandler');
const { isAddressInDeliveryZone, getStoreSettings } = require('../services/deliveryZoneService');
const paymentService = require('../services/paymentService');
const generateOrderNumber = require('../utils/generateOrderNumber');

// No payment method is processed online right now - the customer pays in
// person (card machine brought by whoever delivers, or at pickup) for every
// order, so nothing here should trigger the Mercado Pago preference flow.
// Add a method back here (e.g. 'pix') if online payment is reintroduced later.
const ONLINE_PAYMENT_METHODS = new Set([]);

// POST /api/orders - creates an order (guest or logged-in customer), validates
// stock and the delivery zone, and (for online payment methods) creates a
// Mercado Pago preference the frontend redirects the customer to.
const VALID_PAYMENT_METHODS = new Set(['pix', 'dinheiro', 'cartao']);

const create = asyncHandler(async (req, res) => {
  const {
    items,
    fulfillmentType,
    customerName,
    customerEmail,
    customerPhone,
    address,
    paymentMethod,
    changeFor,
    notes,
  } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'O carrinho está vazio.' });
  }
  if (!['delivery', 'pickup'].includes(fulfillmentType)) {
    return res.status(400).json({ error: 'Escolha entrega ou retirada na loja.' });
  }
  if (!customerName || !customerPhone) {
    return res.status(400).json({ error: 'Nome e WhatsApp são obrigatórios.' });
  }
  if (!paymentMethod || !VALID_PAYMENT_METHODS.has(paymentMethod)) {
    return res.status(400).json({ error: 'Escolha uma forma de pagamento válida.' });
  }
  let normalizedChangeFor = null;
  if (paymentMethod === 'dinheiro' && changeFor !== null && changeFor !== undefined && changeFor !== '') {
    const changeValue = parseFloat(changeFor);
    if (Number.isNaN(changeValue) || changeValue <= 0) {
      return res.status(400).json({ error: 'Valor de troco inválido.' });
    }
    normalizedChangeFor = changeValue;
  }

  let normalizedAddress = null;
  if (fulfillmentType === 'delivery') {
    if (!address || !address.street || !address.number || !address.neighborhood || !address.city || !address.state) {
      return res.status(400).json({ error: 'Preencha o endereço completo para entrega.' });
    }

    const inZone = await isAddressInDeliveryZone(address);
    if (!inZone) {
      const settings = await getStoreSettings();
      return res.status(422).json({
        error: `Só entregamos em ${settings.municipality_city} - ${settings.municipality_state}. Fora dessa área, escolha retirada na loja.`,
        code: 'OUT_OF_DELIVERY_ZONE',
      });
    }
    normalizedAddress = address;
  }

  const result = await sequelize.transaction(async (t) => {
    const settings = await getStoreSettings();

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!product || product.status !== 'active') {
        throw Object.assign(new Error(`Produto indisponível.`), { status: 409 });
      }
      const quantity = parseInt(item.quantity, 10) || 0;
      if (quantity < 1) {
        throw Object.assign(new Error('Quantidade inválida.'), { status: 400 });
      }
      if (product.stock < quantity) {
        throw Object.assign(
          new Error(`Estoque insuficiente para "${product.name}" (disponível: ${product.stock}).`),
          { status: 409 }
        );
      }

      const lineTotal = parseFloat(product.price) * quantity;
      subtotal += lineTotal;

      orderItemsData.push({
        product_id: product.id,
        product_name_snapshot: product.name,
        unit_price_snapshot: product.price,
        selected_size: item.selectedSize || null,
        selected_color: item.selectedColor || product.color || null,
        quantity,
        line_total: lineTotal,
      });

      product.stock -= quantity;
      await product.save({ transaction: t });
    }

    const deliveryFee = fulfillmentType === 'delivery' ? parseFloat(settings.delivery_fee) : 0;
    const total = subtotal + deliveryFee;

    if (normalizedChangeFor !== null && normalizedChangeFor <= total) {
      throw Object.assign(new Error('O valor do troco deve ser maior que o total do pedido.'), { status: 400 });
    }

    let deliveryAddressId = null;
    if (normalizedAddress) {
      const addressRecord = await Address.create(
        {
          customer_id: req.customer?.id || null,
          recipient_name: customerName,
          recipient_phone: customerPhone,
          street: normalizedAddress.street,
          number: normalizedAddress.number,
          complement: normalizedAddress.complement || null,
          neighborhood: normalizedAddress.neighborhood,
          city: normalizedAddress.city,
          state: normalizedAddress.state,
          zip_code: normalizedAddress.zip_code || null,
          reference_point: normalizedAddress.reference_point || null,
        },
        { transaction: t }
      );
      deliveryAddressId = addressRecord.id;
    }

    let orderNumber = generateOrderNumber();
    // Extremely unlikely collision guard.
    // eslint-disable-next-line no-await-in-loop
    while (await Order.findOne({ where: { order_number: orderNumber }, transaction: t })) {
      orderNumber = generateOrderNumber();
    }

    const order = await Order.create(
      {
        order_number: orderNumber,
        customer_id: req.customer?.id || null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        fulfillment_type: fulfillmentType,
        delivery_address_id: deliveryAddressId,
        status: ONLINE_PAYMENT_METHODS.has(paymentMethod) ? 'pending_payment' : 'preparing',
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentMethod,
        payment_status: 'pending',
        change_for: normalizedChangeFor,
        customer_notes: notes || null,
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      orderItemsData.map((i) => ({ ...i, order_id: order.id })),
      { transaction: t }
    );

    return order;
  });

  let paymentInfo = null;
  if (ONLINE_PAYMENT_METHODS.has(paymentMethod)) {
    try {
      const items = await OrderItem.findAll({ where: { order_id: result.id } });
      const preference = await paymentService.createPreference(result, items);
      result.mp_preference_id = preference.preferenceId;
      await result.save();
      paymentInfo = preference;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Falha ao criar preferência de pagamento no Mercado Pago:', err.message);
      // Order still exists (as pending_payment); customer can retry payment later.
    }
  }

  const full = await Order.findByPk(result.id, { include: [{ model: OrderItem, as: 'items' }] });
  res.status(201).json({ order: full, payment: paymentInfo });
});

// GET /api/orders/:id - order status lookup (used by the confirmation page)
const getById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem, as: 'items' }, { model: Address, as: 'deliveryAddress' }],
  });
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado.' });

  // Guests can view their own order by id (used right after checkout); logged-in
  // customers can only view their own orders.
  if (req.customer && order.customer_id && order.customer_id !== req.customer.id) {
    return res.status(403).json({ error: 'Acesso negado.' });
  }
  res.json({ order });
});

// GET /api/orders - order history for the logged-in customer
const listMine = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { customer_id: req.customer.id },
    include: [{ model: OrderItem, as: 'items' }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ orders });
});

module.exports = { create, getById, listMine };
