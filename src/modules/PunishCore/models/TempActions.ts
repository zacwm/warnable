const { DataTypes, Model } = require('sequelize');
const sequelize = global.database;

class TempActions extends Model {}

TempActions.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guildId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  finishUnix: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  value: {
    type: DataTypes.STRING,
  },
  finished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'PunishCoreTempActions',
  tableName: 'PunishCore_TempActions',
});

export default TempActions;