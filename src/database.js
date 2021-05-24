// # warnable v3-dev | Database

const DatabaseOptions = {
  fileName: 'warnable',
};

// Don't touch below... Unless you know what you're doing :)

const better_sqlite3 = require('better-sqlite3');

module.exports = class db {
  constructor() {
    this.db = new better_sqlite3(`${__dirname}/${DatabaseOptions.fileName}.db`, { verbose: console.log });
    // # Tables
    // warnings - guild, user, points, issuer, reason, unixTime
    this.db.prepare('CREATE TABLE IF NOT EXISTS warnings (guild TEXT NOT NULL, user TEXT NOT NULL, points INTEGER, issuer TEXT NOT NULL, reason TEXT NOT NULL, unixTime TEXT NOT NULL)').run();
    // guilds - *guild, rAdmin, rMod, rViewer, cWarnings, cMsg, cUsers
    this.db.prepare('CREATE TABLE IF NOT EXISTS guilds (guild TEXT NOT NULL, rAdmin TEXT, rMod TEXT, rViewer TEXT, rImmune TEXT, cWarnings TEXT, cMsg TEXT, cUsers TEXT)').run();
    this.guildCache = [];
  }

  // # Warnings
  addWarning(guild, user, points, issuer, reason) {
    return new Promise((resolve, reject) => {
      try {
        const warningPrep = this.db.prepare('INSERT INTO warnings (guild, user, points, issuer, reason, unixTime) VALUES (?, ?, ?, ?, ?, ?)');
        const warningExec = warningPrep.run(guild, user, parseInt(points), issuer, (reason || 'No reason provided.'), (new Date(new Date().toUTCString()).getTime() / 1000).toString());
        resolve(warningExec.changes);
      }
      catch(err) {
        reject(err);
      }
    });
  }

  listWarnings(guild, user) {
    return new Promise((resolve, reject) => {
      try {
        const warningPrep = this.db.prepare('SELECT * FROM warnings WHERE guild = ? AND user = ?').all(guild, user);
        resolve(warningPrep);
      }
      catch(err) {
        reject(err);
      }
    });
  }

  // # Guild
  getGuild(guild) {
    return new Promise((resolve, reject) => {
      try {
        const guildData = this.db.prepare('SELECT * FROM guilds WHERE guild = ?').get(guild);
        resolve(guildData);
      }
      catch(err) {
        reject(err);
      }
    });
  }

  setGuildSetting(guild, type, value) {
    return new Promise((resolve, reject) => {
      this.getGuild(guild)
      .then(data => {
        console.dir(data);
        try {
          if (data === undefined && type === 'rAdmin') {
            const guildPrep = this.db.prepare('INSERT INTO guilds (guild, rAdmin) VALUES (?, ?)');
            const guildRun = guildPrep.run(guild, value);
            resolve(guildRun.changes);
          }
          else {
            const guildPrep = this.db.prepare(`UPDATE guilds SET ${type} = ? WHERE guild = ?`);
            const guildRun = guildPrep.run(value, guild);
            resolve(guildRun.changes);
          }
        }
        catch(err) {
          reject(err);
        }
      })
      .catch(reject);
    });
  }
};