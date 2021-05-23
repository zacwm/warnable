// # warnable v3-dev | Database

const DatabaseOptions = {
  fileName: 'warnable-db',
};

// Don't touch below... Unless you know what you're doing :)

const better_sqlite3 = require('better-sqlite3');

module.exports = class db {
  constructor() {
    this.db = better_sqlite3(`${__dirname}/${DatabaseOptions}.db`);
  }

  // # Warnings
  addWarning(guild, user, points, issuer, reason) {
    return new Promise((resolve, reject) => {
      try {
        console.dir({ guild: guild, user: user, points: points, issuer: issuer, reason: reason });
        resolve(true);
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