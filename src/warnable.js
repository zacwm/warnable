// Warnable 2.0.0 - Bot
const config = require(`./config`);
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const Database = require(`./db`);
const db = new Database(config.database);

var commands = {};

module.exports = { client, config, db, commands, pointsActions, command: (n, c) => { commands[n] = c; } };

// Load commands and events.
(() => {
    fs.readdirSync(`${__dirname}/commands`)
    .forEach(command => {
        require(`${__dirname}/commands/${command}`);
    });
    fs.readdirSync(`${__dirname}/events`)
    .forEach(events => {
        require(`${__dirname}/events/${events}`);
    });
})();

function pointsActions(guild, user, points) {
    return new Promise((resolve, reject) => {
        //client.guilds.cache.get(guild).members.get()
    });
}