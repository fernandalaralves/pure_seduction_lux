const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Order lifecycle:
// pending_payment -> paid -> preparing -> ready_for_pickup | out_for_delivery -> completed
// any state -> cancelled
const STATUSES = [
  'pending_payment',
  'paid',
  'preparing',
  'ready_for_pickup',
  'out_for_delivery',
  'completed',
  'cancelled',
];

const FULFILLMENT_TYPES = ['delivery', 'pickup'];
const PAYMENT_STATUSES = ['pending', 'approved', 'rejected', 'refunded', 'cancelled'];

class Order extends Model {}

Order.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_number: { type: DataTypes.STRING, allowNull: false, unique: true },
    customer_id: { type: DataTypes.UUID, allowNull: true }, // nullable to allow guest checkout
    customer_name: { type: DataTypes.STRING, allowNull: false },
    // Optional: the storefront checkout (matching the Figma design) only
    // collects name + WhatsApp; email is only known for logged-in customers.
    customer_email: { type: DataTypes.STRING, allowNull: true },
    customer_phone: { type: DataTypes.STRING, allowNull: false },

    fulfillment_type: { type: DataTypes.ENUM(...FULFILLMENT_TYPES), allowNull: false },
    delivery_address_id: { type: DataTypes.UUID, allowNull: true },

    status: { type: DataTypes.ENUM(...STATUSES), allowNull: false, defaultValue: 'pending_payment' },

    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    delivery_fee: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

    payment_method: { type: DataTypes.STRING, allowNull: true }, // 'pix' | 'dinheiro' | 'cartao' - always paid in person
    payment_status: { type: DataTypes.ENUM(...PAYMENT_STATUSES), allowNull: false, defaultValue: 'pending' },
    mp_preference_id: { type: DataTypes.STRING, allowNull: true },
    mp_payment_id: { type: DataTypes.STRING, allowNull: true },
    // Only set when payment_method is "dinheiro" and the customer needs change -
    // the amount they'll pay with, so whoever delivers knows how much to bring.
    change_for: { type: DataTypes.DECIMAL(10, 2), allowNull: true },

    customer_notes: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    indexes: [{ fields: ['status'] }, { fields: ['customer_id'] }],
  }
);

Order.STATUSES = STATUSES;
Order.FULFILLMENT_TYPES = FULFILLMENT_TYPES;
Order.PAYMENT_STATUSES = PAYMENT_STATUSES;

module.exports = Order;
