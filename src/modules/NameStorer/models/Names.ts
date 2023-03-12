const { DataTypes, Model } = require('sequelize');
const sequelize = global.database;

class Names extends Model {}

Names.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  discriminator: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstSeenUnix: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lastSeenUnix: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Names',
  tableName: 'namestore',
});

export default Names;