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
  warningsChannel: {
    type: DataTypes.STRING,
  },
  punishmentsChannel: {
    type: DataTypes.STRING,
  },
  messagesChannel: {
    type: DataTypes.STRING,
  },
  usersChannel: {
    type: DataTypes.STRING,
  }
}, {
  sequelize,
  modelName: 'LogCoreConfig',
  tableName: 'logcore_config',
});

export default Config;