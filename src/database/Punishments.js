// # Warnable v3 | Database Model

const sequelize = require('sequelize');
const { database, cache } = require('../database');
const { Model, DataTypes } = sequelize;

class PunishmentsDB extends Model {}

PunishmentsDB.init(
  {
    guildID: { type: DataTypes.STRING },
    userID: { type: DataTypes.STRING, unique: true },
    // Type: 0 - Mute, 1 - Ban (Kicks are not stored)
    type: { type: DataTypes.INTEGER },
    issuerID: { type: DataTypes.STRING },
    unixFinish: { type: DataTypes.STRING },
  },
  {
    sequelize: database,
    modelName: 'Punishments',
  },
);

module.exports = cache.init(PunishmentsDB);