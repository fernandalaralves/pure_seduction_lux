const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Product extends Model {
  get isInStock() {
    return this.stock > 0;
  }
}

Product.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    // e.g. "Renda Vinho" shown as the subtitle under the product name in the admin list
    variant_description: { type: DataTypes.STRING, allowNull: true },
    // e.g. "Vinho" - shown to the customer as "Cor: Vinho" at checkout
    color: { type: DataTypes.STRING, allowNull: true },
    // e.g. ["P", "M", "G"] - shown as a size selector on the product page.
    // DataTypes.JSON (rather than ARRAY) so this works on both PostgreSQL and
    // SQLite - Sequelize serializes/deserializes the JS array transparently.
    available_sizes: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    description: { type: DataTypes.TEXT, allowNull: true },
    category_id: { type: DataTypes.UUID, allowNull: true },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
    sku: { type: DataTypes.STRING, allowNull: true, unique: true },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
    cover_image_url: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    indexes: [{ fields: ['status'] }, { fields: ['category_id'] }],
  }
);

module.exports = Product;
