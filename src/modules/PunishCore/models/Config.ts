const { DataTypes, Model } = require('sequelize');
const sequelize = global.database;

class Config extends Model {}

Config.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  immuneRoles: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: 'PunishCoreConfig',
  tableName: 'PunishCore_config',
});

export default Config;