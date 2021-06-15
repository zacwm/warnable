// # warnable v3-dev | Database - MongoDB

const DatabaseOptions = {
  // https://mongoosejs.com/docs/connections.html
  uri: 'mongodb://localhost:27017/warnable',
};

// Don't touch below... Unless you know what you're doing :)

const mongoose = require('mongoose');
mongoose.connect(DatabaseOptions.uri, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = class db {
  constructor() {
    // # Schemas
    this.model = {
      // warnings - guild, user, points, issuer, reason, unixTime
      warnings: mongoose.model('warnings', new mongoose.Schema({
        guild: String,
        user: String,
        points: Number,
        issuer: String,
        reason: String,
        unixTime: String,
      })),
      // punishments = guild, user, type, issuer, unixFinish
      punishments: mongoose.model('punishments', new mongoose.Schema({
        guild: String,
        user: String,
        type: String,
        issuer: String,
        unixFinish: String,
      })),
    };
  }

  // # Warnings
  addWarning(guild, user, points, issuer, reason, time) {
    return new Promise((resolve) => {
      const Warning = new this.model.warnings({ guild: guild, user: user, points: points, issuer: issuer, reason: reason, unixTime: time });
      Warning.save();
      resolve(true);
    });
  }

  listWarnings(guild, user) {
    return new Promise((resolve, reject) => {
      this.model.warnings.find({ guild: guild, user: user }, (err, res) => {
        if (err) return reject(err);
        const warnings = [];
        res.forEach((doc) => {
          warnings.push(doc._doc);
        });
        resolve(warnings);
      });
    });
  }

  removeWarning(guild, user, unix) {
    return new Promise((resolve, reject) => {
      this.model.warnings.deleteOne({ guild: guild, user: user, unixTime: unix }, function(err) {
        if (err) return reject(err);
        resolve(true);
      });
    });
  }

  // # Punishments
  listPunishments(guild) {
    return new Promise((resolve, reject) => {
      this.model.punishments.find({ guild: guild }, (err, res) => {
        if (err) return reject(err);
        const punishments = [];
        res.forEach((doc) => {
          punishments.push(doc._doc);
        });
        resolve(punishments);
      });
    });
  }

  addPunishment(guild, user, type, issuer, unixFinish) {
    return new Promise((resolve) => {
      const Punishment = new this.model.punishments({ guild: guild, user: user, type: type, issuer: issuer, unixFinish: unixFinish });
      Punishment.save();
      resolve(true);
    });
  }

  stopPunishment(guild, user) {
    return new Promise((resolve, reject) => {
      this.model.punishments.deleteMany({ guild: guild, user: user }, function(err) {
        if (err) return reject(err);
        resolve(true);
      });
    });
  }
};