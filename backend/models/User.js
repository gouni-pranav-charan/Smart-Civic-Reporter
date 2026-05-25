const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('citizen', 'authority'),
    defaultValue: 'citizen'
  },
  phone: {
    type: DataTypes.STRING
  },
  city: {
    type: DataTypes.STRING
  },
  area: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true
});

module.exports = User;
