const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ProductImage extends Model {}

ProductImage.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    product_id: { type: DataTypes.UUID, allowNull: false },
    url: { type: DataTypes.STRING, allowNull: false },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: 'ProductImage',
    tableName: 'product_images',
  }
);

module.exports = ProductImage;
