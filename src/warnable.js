// Warnable 2.0.0 - Bot
const config = require("./config");
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const Database = require("./db");
const db = new Database();

var commands = {};
var temps = {};

module.exports = { client, config, db, commands, checkPoints, makeLog, command: (n, c) => { commands[n] = c; } };

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

function checkPoints(guildid, user, points) {
    let guildConfig = config.guilds[guildid];
    guildConfig.points.forEach(async item => {
        let itemPoints = item.range.split("-");
        let guild = client.guilds.cache.get(guildid);
        let member = guild.members.cache.get(user);
        if (parseInt(itemPoints[0]) <= points && parseInt(itemPoints[1]) >= points) {
            if (item.message) await member.user.send(item.message.replace("%guild", guild.name).replace("%points", points))
            .catch(() => { makeLog(guildid, "warnings", `⚠️ There was an issue trying to send a DM to ${member.user.tag}`); });
            pointsActions(guildid, item, { member, points });
        }
    });
}

function pointsActions(guildid, action, user) {
    let actionType = action.action.split("-");
    // Ban
    if (actionType[0] == "ban") {
        user.member.ban({ reason: `[warnable] Reaching ${user.points} warning points` })
        .then(() => { makeLog(guildid, "warnings", `🔨 ${member.user.tag} was **banned** for reaching ${user.points} warning points.`); })
        .catch(() => { makeLog(guildid, "warnings", `⚠️ ${member.user.tag} was attempted to be **banned** for ${user.points} warning points, **but there was an issue.**`); });
    }

    // Kick
    if (actionType[0] == "kick") {
        user.member.kick(`[warnable] Reaching ${user.points} warning points`)
        .then(() => { makeLog(guildid, "warnings", `👞 ${user.member.user.tag} was **kicked** for reaching ${user.points} warning points.`); })
        .catch(() => { makeLog(guildid, "warnings", `⚠️ ${user.member.user.tag} was attempted to be **kicked** for ${user.points} warning points, **but there was an issue.**`); });
    }

    // Mute
    if (actionType[0] == "mute") {
        user.member.roles.add(config.guilds[guildid].roles.mute)
        .then(() => { makeLog(guildid, "warnings", `🤫 ${user.member.user.tag} was **muted** for reaching ${user.points} warning points.`); })
        .catch(() => { makeLog(guildid, "warnings", `⚠️ ${user.member.user.tag} was attempted to be **muted** for ${user.points} warning points, **but there was an issue.**`); });
    }
}

function makeLog(guild, type, message) {
    let configChannels = config.guilds[guild].channels;
    if (configChannels[type]) {
        try {
            let channel = client.guilds.cache.get(guild).channels.cache.get(configChannels[type]);
            channel.send(message);
        }
        catch (err) {
            console.info("[ error ]", `Failed to log for ${type} channel in ${guild}.`);
        }
    }
    console.info("[  log  ]", `Type: ${type}, Guild: ${guild} > ${message}`);
}