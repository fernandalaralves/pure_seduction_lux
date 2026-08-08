const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const { verifyPassword } = require('../utils/password');

class Admin extends Model {
  async checkPassword(plainPassword) {
    return verifyPassword(this.password_hash, plainPassword);
  }

  toSafeJSON() {
    const { id, name, email, created_at } = this;
    return { id, name, email, created_at };
  }
}

Admin.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Admin',
    tableName: 'admins',
  }
);

module.exports = Admin;
