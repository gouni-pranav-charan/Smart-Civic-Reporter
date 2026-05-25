const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  citizenId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  aiEnhancedDescription: {
    type: DataTypes.TEXT
  },
  // Flattened Location Fields
  lat: {
    type: DataTypes.DECIMAL(10, 8)
  },
  lng: {
    type: DataTypes.DECIMAL(11, 8)
  },
  address: {
    type: DataTypes.STRING
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'In Progress', 'Resolved', 'Rejected', 'Verification Pending'),
    defaultValue: 'Pending'
  },
  priorityScore: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reminders: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  resolvedImageUrl: {
    type: DataTypes.TEXT
  },
  resolutionNote: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true
});

// Associations
Complaint.belongsTo(User, { as: 'citizen', foreignKey: 'citizenId' });
Complaint.belongsTo(User, { as: 'assignedOfficer', foreignKey: 'assignedTo' });

module.exports = Complaint;
