const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class OrderItem extends Model {}

OrderItem.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID, allowNull: true }, // kept nullable in case a product is later deleted
    // Snapshots so historical orders remain accurate even if the product changes later
    product_name_snapshot: { type: DataTypes.STRING, allowNull: false },
    unit_price_snapshot: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    selected_size: { type: DataTypes.STRING, allowNull: true },
    selected_color: { type: DataTypes.STRING, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    line_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  {
    sequelize,
    modelName: 'OrderItem',
    tableName: 'order_items',
  }
);

module.exports = OrderItem;
