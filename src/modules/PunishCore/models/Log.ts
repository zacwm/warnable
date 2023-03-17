const { DataTypes, Model } = require('sequelize');
const sequelize = global.database;

class Log extends Model {}

Log.init({
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
  actionsRun: {
    type: DataTypes.STRING,
  },
  reason: {
    type: DataTypes.STRING,
  }
}, {
  sequelize,
  modelName: 'PunishCoreLog',
  tableName: 'PunishCore_log',
});

export default Log;