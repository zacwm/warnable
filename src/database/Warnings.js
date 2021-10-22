// # Warnable v3 | Database Model

const sequelize = require('sequelize');
const { database, cache } = require('../database');
const { Model, DataTypes } = sequelize;

class WarningsDB extends Model {}

WarningsDB.init(
  {
    guildID: { type: DataTypes.STRING },
    userID: { type: DataTypes.STRING },
    points: { type: DataTypes.INTEGER },
    issuerID: { type: DataTypes.STRING },
    reason: { type: DataTypes.STRING },
    unixTime: { type: DataTypes.STRING },
  },
  {
    sequelize: database,
    modelName: 'Warnings',
  },
);

module.exports = cache.init(WarningsDB);