// # warnable v3-dev | Database

const DatabaseOptions = {
  fileName: 'warnable',
};

// Don't touch below... Unless you know what you're doing :)

const better_sqlite3 = require('better-sqlite3');

module.exports = class db {
  constructor() {
    this.db = new better_sqlite3(`${__dirname}/${DatabaseOptions.fileName}.db`, { verbose: console.log });
    this.db.prepare('CREATE TABLE IF NOT EXISTS warnings (guild TEXT NOT NULL, user TEXT NOT NULL, points INTEGER, issuer TEXT NOT NULL, reason TEXT NOT NULL, unixTime TEXT NOT NULL)').run();
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

  /* settingThings(key, set) {
    return new Promise((resolve, reject) => {

    });
  } */
};