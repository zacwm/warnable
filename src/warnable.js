// Warnable 2.0.0 - Bot
const config = require("./config");
const fs = require("fs");
const Discord = require("discord.js");
const moment = require("moment");
const client = new Discord.Client();
const Database = require("./db");
const db = new Database();

var commands = {};
var temp = {};

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
            .catch(() => { makeLog(guildid, "important", `⚠️ There was an issue trying to send a DM to ${member.user.tag}`); });
            pointsActions(guildid, item, { member, points });
        }
    });
}

function pointsActions(guildid, action, user) {
    let actionSplit = action.action.split("-");
    action = { type: actionSplit[0], timer: actionSplit[1] };
    // Ban
    if (action.type == "ban") {
        if (action.timer) { // Temp ban
            user.member.ban({ reason: `[warnable] Temp > Reaching ${user.points} warning points` })
            .then(() => { 
                temp[user.member.id] = {
                    type: "ban",
                    timeout: setTimeout(() => { 
                        user.member.guild.members.unban(user.member.id)
                        .then(() => {
                            delete temp[user.member.id];
                            makeLog(guildid, "important", `🙌 ${user.member.user.tag} was **unbaned** because their temp timer is up.`);
                        })
                        .catch(unbanerr => {
                            console.error(unbanerr);
                            makeLog(guildid, "important", `⚠️ ${user.member.user.tag} was attempted to be **unbaned** because timer was up, **but there was an issue.**`);
                        });
                    }, moment(0).add(parseInt(action.timer.replace(/[^\d]/g, "")), action.timer.replace(/\d/g, "")).valueOf())
                }
                makeLog(guildid, "important", `🔨 ${user.member.user.tag} was **temp-banned** for reaching ${user.points} warning points.`); 
            })
            .catch(err => {
                console.error(err);
                makeLog(guildid, "important", `⚠️ ${user.member.user.tag} was attempted to be **temp-banned** for ${user.points} warning points, **but there was an issue.**`);
            });
        }
        else { // Perm ban
            user.member.ban({ reason: `[warnable] Reaching ${user.points} warning points` })
            .then(() => { 
                makeLog(guildid, "important", `🔨 ${user.member.user.tag} was **banned** for reaching ${user.points} warning points.`); 
            })
            .catch(err => {
                console.error(err);
                makeLog(guildid, "important", `⚠️ ${user.member.user.tag} was attempted to be **banned** for ${user.points} warning points, **but there was an issue.**`);
            });
        }
    }

    // Kick
    if (action.type == "kick") {
        user.member.kick(`[warnable] Reaching ${user.points} warning points`)
        .then(() => { makeLog(guildid, "important", `👞 ${user.member.user.tag} was **kicked** for reaching ${user.points} warning points.`); })
        .catch(err => {
            console.error(err);
            makeLog(guildid, "important", `⚠️ ${user.member.user.tag} was attempted to be **kicked** for ${user.points} warning points, **but there was an issue.**`);
        });
    }

    // Mute
    if (action.type == "mute") {
        if (action.timer) { // Temp mute
            user.member.roles.add(config.guilds[guildid].roles.mute, `[warnable] Reaching ${user.points} warning points. Time: ${action.timer}`)
            .then(() => { 
                temp[user.member.id] = {
                    type: "mute",
                    timeout: setTimeout(() => { 
                        user.member.roles.remove(config.guilds[guildid].roles.mute, `[warnable] Temp timer of ${action.timer} is up.`)
                        .then(() => {
                            delete temp[user.member.id];
                            makeLog(guildid, "important", `🙌 ${user.member.user.tag} was **unmuted** because their temp timer is up.`);
                        })
                        .catch(unmuteerr => {
                            console.error(unmuteerr);
                            makeLog(guildid, "important", `⚠️ ${user.member.user.tag} was attempted to be **unmuted** because timer was up, **but there was an issue.**`); 
                        });
                    }, moment(0).add(parseInt(action.timer.replace(/[^\d]/g, "")), action.timer.replace(/\d/g, "")).valueOf())
                }
                makeLog(guildid, "important", `🤫 ${user.member.user.tag} was **temp-muted** for reaching ${user.points} warning points.`); 
            })
            .catch(err => {
                console.error(err);
                makeLog(guildid, "important", `⚠️ ${user.member.user.tag} was attempted to be **temp-muted** for ${user.points} warning points, **but there was an issue.**`); });
        }
        else { // Perm mute
            user.member.roles.add(config.guilds[guildid].roles.mute, `[warnable] Reaching ${user.points} warning points. Time: ∞`)
            .then(() => {
                makeLog(guildid, "important", `🤫 ${user.member.user.tag} was **muted** for reaching ${user.points} warning points.`); 
            })
            .catch(err => {
                console.error(err);
                makeLog(guildid, "important", `⚠️ ${user.member.user.tag} was attempted to be **muted** for ${user.points} warning points, **but there was an issue.**`);
            });
        }
    }
}

function makeLog(guild, type, message) {
    let configChannels = config.guilds[guild].channels;
    if (configChannels[type]) {
        try {
            let channel = client.guilds.cache.get(guild).channels.cache.get(configChannels[type]);
            channel.send("", { embed: {
                color: config.msg.colorSuccess,
                description: message
            }});
        }
        catch (err) {
            console.info("[ error ]", `Failed to log for ${type} channel in ${guild}.`);
        }
    }
    console.info("[  log  ]", `Type: ${type}, Guild: ${guild} > ${message}`);
}