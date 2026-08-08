const sequelize = require('../config/database');

const Admin = require('./Admin');
const Customer = require('./Customer');
const Address = require('./Address');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const StoreSettings = require('./StoreSettings');

// ----- Associations -----

Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Customer.hasMany(Address, { foreignKey: 'customer_id', as: 'addresses', onDelete: 'CASCADE' });
Address.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

Address.hasMany(Order, { foreignKey: 'delivery_address_id', as: 'orders' });
Order.belongsTo(Address, { foreignKey: 'delivery_address_id', as: 'deliveryAddress' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

module.exports = {
  sequelize,
  Admin,
  Customer,
  Address,
  Category,
  Product,
  ProductImage,
  Order,
  OrderItem,
  StoreSettings,
};
