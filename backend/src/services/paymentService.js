const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const config = require('../config/env');

let client = null;
function getClient() {
  if (!client) {
    if (!config.mercadoPago.accessToken) {
      throw new Error(
        'Mercado Pago access token is not configured. Set MP_ACCESS_TOKEN in your .env file.'
      );
    }
    client = new MercadoPagoConfig({ accessToken: config.mercadoPago.accessToken });
  }
  return client;
}

/**
 * Creates a Mercado Pago Checkout Pro preference for an order and returns
 * the URL the customer should be redirected to in order to pay.
 * Using hosted Checkout Pro (rather than handling card data ourselves) keeps
 * PCI-DSS compliance and card security entirely on Mercado Pago's side.
 */
async function createPreference(order, items) {
  const preferenceClient = new Preference(getClient());

  const preference = await preferenceClient.create({
    body: {
      items: items.map((item) => ({
        id: item.product_id || undefined,
        title: item.product_name_snapshot,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price_snapshot),
        currency_id: 'BRL',
      })),
      shipments: {
        cost: parseFloat(order.delivery_fee) || 0,
        mode: 'not_specified',
      },
      // `payer` is optional - Mercado Pago's hosted checkout collects the
      // payer's email itself when we don't have one on file.
      payer: order.customer_email
        ? { name: order.customer_name, email: order.customer_email }
        : { name: order.customer_name },
      back_urls: {
        success: `${config.frontendUrl}/pedido/${order.id}?status=success`,
        pending: `${config.frontendUrl}/pedido/${order.id}?status=pending`,
        failure: `${config.frontendUrl}/pedido/${order.id}?status=failure`,
      },
      auto_return: 'approved',
      external_reference: order.order_number,
      notification_url: process.env.MP_NOTIFICATION_URL || undefined,
    },
  });

  return {
    preferenceId: preference.id,
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point,
  };
}

/**
 * Fetches a payment's current status from Mercado Pago. Used both by the
 * webhook handler and as a defensive re-check before trusting webhook data.
 */
async function getPayment(paymentId) {
  const paymentClient = new Payment(getClient());
  return paymentClient.get({ id: paymentId });
}

module.exports = { createPreference, getPayment };
