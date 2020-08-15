// Warnable 2.0.0 - Database (node-json-db)
const nodejsondb = require("node-json-db").JsonDB;

var options = {
    // db_name: The name of the file that will save in the folder to hold all user warning data.
    db_name: "warnableDB"
}

module.exports = class db {
    constructor() {
        this.db = new nodejsondb(options.db_name, true, true);
    }

    addWarning(guild, user, points, reason, issuer) {
        return new Promise((resolve, reject) => {
            try {
                this.db.push(`/guilds/${guild}/users/${user}/warnings[]`, { points, reason, issuer }, true);
                resolve(this.db.getData(`/guilds/${guild}/users/${user}/warnings`).reduce((prev, val) => prev + val.points, 0));
            }
            catch (err) {
                reject(err);
            }
        });
    }

    getWarnings(guild, user, pos) {
        return new Promise((resolve, reject) => {
            try {
                if (pos) {
                    pos = (pos - 1) * -1;
                    resolve(this.db.getData(`/guilds/${guild}/users/${user}/warnings[${pos}]`));
                }
                else {
                    resolve(this.db.getData(`/guilds/${guild}/users/${user}/warnings`).reverse());
                }
            }
            catch (err) {
                resolve([]);
            }
        });
    }

    removeWarning(guild, user, pos) {
        return new Promise((resolve, reject) => {
            try {
                pos = (pos - 1) * -1;
                this.db.delete(`/guilds/${guild}/users/${user}/warnings[${pos}]`);
                resolve(true);
            }
            catch (err) {
                reject(err);
            }
        });
    }

    getExtra(guild, user) {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.db.getData(`/guilds/${guild}/extras/${user}`));
            }
            catch (err) {
                reject(err);
            }
        });
    }
}