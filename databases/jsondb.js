// Warnable 2.0.0 - Database (node-json-db)
var options = {
    // db_name: The name of the file that will save in the folder to hold all user warning data.
    db_name: "warnableDB",
    // timezone: The timezone to be used to save and list warnings in... Example format: "Australia/Brisbane"
    timezone: "Australia/Brisbane"
}

const nodejsondb = require("node-json-db").JsonDB;
const moment = require("moment-timezone");

module.exports = class db {
    constructor() {
        this.db = new nodejsondb(options.db_name, true, true);
    }

    addWarning(guild, user, points, reason, issuer) { // Returns: Number (The users new total warning point value)
        return new Promise((resolve, reject) => {
            try {
                let time = moment().tz(options.timezone).format("MMM Do YYYY, h:mm a");
                this.db.push(`/guilds/${guild}/users/${user}/warnings[]`, { points, reason, issuer, time }, true);
                this.db.push(`/guilds/${guild}/last`, user);
                // Return data
                resolve(this.db.getData(`/guilds/${guild}/users/${user}/warnings`).reduce((prev, val) => prev + val.points, 0));
            }
            catch (err) {
                reject(err);
            }
        });
    }

    getWarnings(guild, user, pos) { // Returns: Depends: Check below...
        return new Promise((resolve, reject) => {
            try {
                if (pos) { // If requesting single warning.
                    pos = (pos - 1) * -1;
                    // Return warning object
                    resolve(this.db.getData(`/guilds/${guild}/users/${user}/warnings[${pos}]`));
                }
                else { // If requesting all warnings.
                    // Return array of warning objects. newest to oldest.
                    resolve(this.db.getData(`/guilds/${guild}/users/${user}/warnings`).reverse());
                }
            }
            catch (err) { // If no warnings: Returns empty array.
                resolve([]);
            }
        });
    }

    removeWarning(guild, user, pos) { // Returns: User ID (no clue why, could be anything i think lol...)
        return new Promise((resolve, reject) => {
            try {
                pos = (!user) ? -1 : (pos - 1) * -1;
                user = (!user) ? this.db.getData(`/guilds/${guild}/last`) : user; 
                if (!user) this.db.delete(`/guilds/${guild}/last`);
                this.db.delete(`/guilds/${guild}/users/${user}/warnings[${pos}]`);
                resolve(user);
            }
            catch (err) {
                reject(err);
            }
        });
    }
}