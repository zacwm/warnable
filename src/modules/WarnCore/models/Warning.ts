const { DataTypes, Model } = require('sequelize');
const sequelize = global.database;

class Warning extends Model {}

Warning.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issuerId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reason: {
    type: DataTypes.STRING,
  },
  unixTimestamp: {
    type: DataTypes.INTEGER,
  },
  deleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  deletedBy: {
    type: DataTypes.STRING,
  },
  deletedAt: {
    type: DataTypes.INTEGER,
  },
}, {
  sequelize,
  modelName: 'Warning',
  tableName: 'warnings',
});

export default Warning;