const { DataTypes, Model } = require('sequelize');
const sequelize = global.database;

class Actions extends Model {}

Actions.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'PunishCoreActions',
  tableName: 'PunishCore_actions',
});

export default Actions;