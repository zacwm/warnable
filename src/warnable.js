// Warnable 2.0.0 - Bot
const config = require("./config");
const fs = require("fs");
const Discord = require("discord.js");
const client = new Discord.Client();
const Database = require("./db");
const db = new Database();

var commands = {};
var temps = {};

module.exports = { client, config, db, commands, pointsActions, makeLog, command: (n, c) => { commands[n] = c; } };

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

async function pointsActions(guildid, user, points) {
    let guildConfig = config.guilds[guildid];
    let guild = client.guilds.cache.get(guildid);
    let member = guild.members.cache.get(user);
    // Ban
    if (guildConfig.points.ban !== 0 && guildConfig.points.ban <= points) {
        if (guildConfig.pointMessages.ban) await member.user.send(guildConfig.pointMessages.ban)
        .catch(err => { // Log an issue in warning log channel that DM failed.
            makeLog(guildid, "warnings", `⚠️ There was an issue trying to send a DM to ${member.tag}`);
        });
        member.ban({ days: 7, reason: `[warnable] Reaching ${guildConfig.points.ban}+ warning points` })
        .then(() => { // Log that the user was banned.
            makeLog(guildid, "warnings", `🔨 ${member.tag} was **banned** for reaching ${points}/${guildConfig.points.ban} warning points.`);
        })
        .catch(err => { // Log there was an issue banning.
            makeLog(guildid, "warnings", `⚠️ ${member.tag} was attempted to be **banned** for ${points}/${guildConfig.points.ban} warning points, **but there was an issue.**`);
        });
    }
    // Kick
    else if (guildConfig.points.kick !== 0 && guildConfig.points.kick <= points) {
        if (guildConfig.pointMessages.kick) await member.user.send(guildConfig.pointMessages.kick)
        .catch(err => { // Log an issue in warning log channel that DM failed.
            makeLog(guildid, "warnings", `⚠️ There was an issue trying to send a DM to ${member.tag}`);
        });
        member.kick(`[warnable] Reaching ${guildConfig.points.ban}+ warning points`)
        .then(() => { // Log that the user was kicked.
            makeLog(guildid, "warnings", `👞 ${member.tag} was **kicked** for reaching ${points}/${guildConfig.points.kick} warning points.`);
        })
        .catch(err => { // Log there was an issue kicking.
            makeLog(guildid, "warnings", `⚠️ ${member.tag} was attempted to be **kicked** for ${points}/${guildConfig.points.kick} warning points, **but there was an issue.**`);
        });
    }
    // Mute
    else if (guildConfig.points.mute !== 0 && guildConfig.points.mute <= points) {
        if (guildConfig.pointMessages.mute) await member.user.send(guildConfig.pointMessages.mute)
        .catch(err => { // Log an issue in warning log channel that DM failed.
            makeLog(guildid, "warnings", `⚠️ There was an issue trying to send a DM to ${member.tag}`);
        });
        member.roles.add(guildConfig.roles.mute)
        .then(() => { // Log that the user was muted.
            makeLog(guildid, "warnings", `🤫 ${member.tag} was **muted** for reaching ${points}/${guildConfig.points.mute} warning points.`);
        })
        .catch(err => { // Log there was an issue applying the role.
            makeLog(guildid, "warnings", `⚠️ ${member.tag} was attempted to be **muted** for ${points}/${guildConfig.points.mute} warning points, **but there was an issue.**`);
        });
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