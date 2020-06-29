// Warnable 2.0.0 - Database
const nodejsondb = require("node-json-db").JsonDB;

module.exports = class db {
    constructor(options) {
        if (!options) options = {};
        this.db = new nodejsondb(options.fileName || "jsondb", true, true);
    }

    addWarning(guild, user, points, reason, issuer) {
        return new Promise((resolve, reject) => {
            try {
                this.db.push(`/guilds/${guild}/users/${user}[]`, { points, reason, issuer }, true);
                resolve(this.db.getData(`/guilds/${guild}/users/${user}`).reduce((prev, val) => prev + val.points, 0));
            }
            catch (err) {
                reject(err);
            };
        });
    }

    getWarnings(guild, user, pos) {
        return new Promise((resolve, reject) => {
            try {
                if (pos) {
                    pos = (pos - 1) * -1;
                    resolve(this.db.getData(`/guilds/${guild}/users/${user}[${pos}]`));
                }
                else {
                    resolve(this.db.getData(`/guilds/${guild}/users/${user}`).reverse());
                }
            }
            catch (err) {
                resolve([]);
            };
        });
    }

    removeWarning(guild, user, pos) {
        return new Promise((resolve, reject) => {
            try {
                pos = (pos - 1) * -1;
                this.db.delete(`/guilds/${guild}/users/${user}[${pos}]`);
                resolve(true);
            }
            catch (err) {
                reject(err);
            };
        });
    }
}