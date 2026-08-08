const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Address extends Model {}

Address.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    customer_id: { type: DataTypes.UUID, allowNull: true },
    label: { type: DataTypes.STRING, allowNull: true }, // e.g. "Casa", "Trabalho"
    recipient_name: { type: DataTypes.STRING, allowNull: false },
    recipient_phone: { type: DataTypes.STRING, allowNull: false },
    street: { type: DataTypes.STRING, allowNull: false },
    number: { type: DataTypes.STRING, allowNull: false },
    complement: { type: DataTypes.STRING, allowNull: true },
    neighborhood: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING(2), allowNull: false },
    // Optional: the storefront checkout (matching the Figma design) does not
    // collect a CEP, only street/number/neighborhood/complement + city/state.
    zip_code: { type: DataTypes.STRING, allowNull: true },
    reference_point: { type: DataTypes.STRING, allowNull: true },
  },
  {
    sequelize,
    modelName: 'Address',
    tableName: 'addresses',
  }
);

module.exports = Address;
