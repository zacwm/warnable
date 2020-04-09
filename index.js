// Warnable
// Version 1.0.0 - By www.zachary.fun

const Discord = require("discord.js");
const jsonDB = require("node-json-db").JsonDB;
const moment = require('moment-timezone');
const Filter = require('bad-words');
const badWords = new Filter();
const client = new Discord.Client();
const botDB = new jsonDB("botData", true, true);
const config = require("./config.json");
client.login(config.token);

// Bot Listening
client.on("ready", () => {
    console.log(`${client.user.username} is now ready!`);
    if (client.guilds.size > 1) console.warn("!!! WARNING !!! Warnable is not supported for more than one Discord server.\nWarnings do NOT save for each server, all warnings sync across servers for users.\nThis may be supported in the future, but do not make an issue if you are using it in more than one server please :("); 
});

//- Commands
const commands = {
    "warn": (msg) => {
        if (msg.content.split(" ")[1].startsWith("<")) {
            if (msg.mentions.members.first()) {
                var warningUser = msg.mentions.members.first().id;
                var warningReason = msg.content.replace(/<[@#][!&]?[0-9]+>/g, "").substring(config.prefix.length + 6);
                if (warningReason !== "") {
                    warningAdd(warningUser, warningReason, msg.author, msg.guild, function(res) {
                        msg.channel.send(res);
                    });
                }
                else {
                    msg.reply("A reason must be included.");
                }
            }
            else {
                msg.reply("The mention is invalid.");
            }
        }
        else if (msg.content.split(" ")[1].startsWith('"')) {
            var warningUsername = extractUsername(msg.content);
            if (warningUsername.match(/.*#\d{4}\b/g)) {
                var warningUser = findUsernameUser(warningUsername);
                if (warningUser) {
                    var warningReason = msg.content.replace(config.prefix + 'warn "' + warningUsername + '" ', "");
                    if (warningReason !== "") {
                        warningAdd(warningUser, warningReason, msg.author, msg.guild, function(res) {
                            msg.channel.send(res);
                        });
                    }
                    else {
                        msg.reply("A reason must be included.");
                    }
                } 
                else {
                    msg.reply("Unable to find user.");
                }
            }
        }
        else {
            msg.reply("Command used incorrectly.");
        }
    },
    "remove": (msg) => {
        var warnID = msg.content.split(" ")[1]
        if (warnID) {
            warningRemove(warnID, function(res) {
                msg.reply(res);
            });
        }
        else {
            msg.channel.send("A warning ID must be specified.");
        }
    },
    "list": (msg) => {
        if (msg.content.split(" ")[1].startsWith("<")) {
            if (msg.mentions.members.first()) {
                var warningUser = msg.mentions.members.first();
                var warnList = dbRequest("/users/" + warningUser.id);
                if (warnList !== undefined) {
                    var warnEmbed = [];
                    var warnText = "";
                    for (i=0; i < warnList.length; i++) {
                        var warnInfo = dbRequest("/warnings/" + warnList[i]);
                        if (warnInfo) {
                            warnEmbed.push({ name: `Warning '${warnList[i]}'`, value: `By: <@${warnInfo.issuer}> | Time: ${moment(warnInfo.time).tz("UTC").format("MMM Do YY, h:mm:ss a")} (UTC)\nReason: '${warnInfo.reason}'`});
                            warnText = warnText + `\n**- Warning '${warnList[i]}**'\nBy: <@${warnInfo.issuer}> | Time: ${moment(warnInfo.time).tz("UTC").format("MMM Do YY, h:mm:ss a")} (UTC)\nReason: '${warnInfo.reason}'`;
                        }
                        if (warnList.length == i + 1) { 
                            if (msg.channel.permissionsFor(client.user.id).has("EMBED_LINKS")) {
                                msg.channel.send("", {embed: {
                                    color: 0x9b59b6,
                                    title: "List warnings",
                                    description: "Listing warnings for " + warningUser,
                                    fields: warnEmbed
                                }});
                            }
                            else {
                                msg.channel.send(`**__Listing warnings for ${warningUser}__**${warnText}`);
                            }
                        }
                    }
                }
                else {
                    msg.reply("User has no warnings.");
                }
            }
            else {
                msg.reply("The mention is invalid.");
            }
        }
        else if (msg.content.split(" ")[1].startsWith('"')) {
            var warningUsername = extractUsername(msg.content);
            if (warningUsername.match(/.*#\d{4}\b/g)) {
                var warningUser = findUsernameUser(warningUsername);
                var warnList = dbRequest("/users/" + warningUser);
                if (warnList !== undefined) {
                    var warnEmbed = [];
                    var warnText = "";
                    for (i=0; i < warnList.length; i++) {
                        var warnInfo = dbRequest("/warnings/" + warnList[i]);
                        if (warnInfo) {
                            warnEmbed.push({ name: `Warning '${warnList[i]}'`, value: `By: <@${warnInfo.issuer}> | Time: ${moment(warnInfo.time).tz("UTC").format("MMM Do YY, h:mm:ss a")} (UTC)\nReason: '${warnInfo.reason}'`});
                            warnText = warnText + `\n**- Warning '${warnList[i]}**'\nBy: <@${warnInfo.issuer}> | Time: ${moment(warnInfo.time).tz("UTC").format("MMM Do YY, h:mm:ss a")} (UTC)\nReason: '${warnInfo.reason}'`;
                        }
                        if (warnList.length == i + 1) { 
                            if (msg.channel.permissionsFor(client.user.id).has("EMBED_LINKS")) {
                                msg.channel.send("", {embed: {
                                    color: 0x9b59b6,
                                    title: "List warnings",
                                    description: "Listing warnings for " + warningUser,
                                    fields: warnEmbed
                                }});
                            }
                            else {
                                msg.channel.send(`**__Listing warnings for ${warningUser}__**${warnText}`);
                            }
                        }
                    }
                }
                else {
                    msg.reply("User has no warnings.");
                }
            }
        }
        else {
            msg.reply("Command used incorrectly.");
        }
    }
};

client.on("message", msg => {
    if (msg.guild) {
        if (msg.content.startsWith(config.prefix)) {
            if (commands.hasOwnProperty(msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0])) {
                if (msg.member.roles.array().some(r => config.admins.roles.indexOf(r.id) >= 0) || config.admins.users.includes(msg.author.id)) {
                    commands[msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0]](msg);
                }
                else {
                    msg.reply("You don't have permission to use this command.");
                }
            }
        }
        // Rules
        if (!msg.author.bot && msg.guild.id == config.channels.guild) {
            if (!config.channels.ignore.includes(msg.channel.id)) {
                if (msg.content.match(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/gm)) {
                    console.log("WOW, dont do that!")
                    if (config.automation.discordInvites.deleteMessage) {
                        msg.delete();
                        msg.channel.send("", {embed: {
                            color: 0x9b59b6,
                            title: `${msg.author.username}, you are not allowed to send Discord invite links in this server.`
                        }});
                    } 
                    if (config.automation.discordInvites.giveWarning) warningAdd(msg.author.id, "Automatic: Discord Invite", client.user, msg.guild, function() {});
                }
                else if (badWords.isProfane(msg.content)) {
                    if (config.automation.swearing.deleteMessage) msg.delete();
                    if (config.automation.swearing.giveWarning) warningAdd(msg.author.id, "Automatic: Swearing", client.user, msg.guild, function() {});
                }
                else if (msg.content.match(/^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/gm)) {
                    if (config.automation.externalLinks.deleteMessage) msg.delete();
                    if (config.automation.externalLinks.giveWarning) warningAdd(msg.author.id, "Automatic: Links", client.user, msg.guild, function() {});
                }
            }
        }
    }
});

// Warning Functions
function warningAdd(uid, reason, issuer, guild, callback) {
    try {
        if (config.admins.users.includes(uid) || guild.members.get(uid).roles.array().some(r => config.admins.roles.indexOf(r.id) >= 0) || guild.members.get(uid).roles.get(config.roles.immuneRole)) {
            callback("This user is unable to be warned due to immunity.");
        }
        else {
            var warningID = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
            botDB.push("/warnings/" + warningID, { user: uid, reason: reason, issuer: issuer.id, time: new Date() });
            var totalWarnings;
            if (dbRequest("/users/" + uid) !== undefined) {
                var warnings = dbRequest("/users/" + uid);
                warnings.push(warningID);
                botDB.push("/users/" + uid, warnings);
                totalWarnings = warnings.length.toString();
            }
            else {
                botDB.push("/users/" + uid, [warningID]);
                totalWarnings = "1";
            }
            warningCheck(uid, guild);
            callback("Warning has been added to <@" + uid + ">\nWarning ID: ``" + warningID + "``");
            var warnLogChannel = client.guilds.get(config.channels.guild).channels.get(config.channels.log.warnings);
            if (warnLogChannel.permissionsFor(client.user.id).has("EMBED_LINKS")) {
                warnLogChannel.send("", {embed: {
                    color: 0x9b59b6,
                    title: "New warning (" + warningID + ")",
                    description: "<@" + uid + "> was warned for:\n```" + reason + "```",
                    fields: [
                        {
                            name: "Issuer",
                            value: "<@" + issuer.id + ">",
                            inline: true
                        },
                        {
                            name: "Time",
                            value: moment().tz("UTC").format("MMM Do YY, h:mm:ss a") + " (UTC)",
                            inline: true
                        },
                        {
                            name: "Total warns",
                            value: totalWarnings,
                            inline: true
                        }
                    ]
                }});
            }
            else {
                warnLogChannel.send("**__New warning (" + warningID + ")__**\nUser warned: <@" + uid + ">\nReason: `" + reason + "`\nIssuer: <@" + issuer.id + "> | Time: " + moment().tz("UTC").format("MMM Do YY, h:mm:ss a") + " (UTC) | Total warns: " + totalWarnings);
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

function warningRemove(wid, callback) {
    var warningInfo = dbRequest("/warnings/" + wid);
    if (warningInfo !== undefined) {
        var userWarns = dbRequest("/users/" + warningInfo.user);
        var warnPosition = userWarns.indexOf(wid);
        botDB.delete("/warnings/" + wid);
        if (warnPosition > -1) {
            userWarns.splice(warnPosition, 1);
            botDB.push("/users/" + warningInfo.user, userWarns);
            callback("Warning has been removed.");
        }
        else {
            callback("This warning has already been removed from the user.");
        }
    }
    else {
        callback("Warning ID does not exist.");
    }
}

function warningCheck(uid, guild) {
    var userWarns = dbRequest("/users/" + uid);
    try {
        if (userWarns !== undefined) {
            var warnedUser = guild.members.get(uid);
            if (userWarns.length == config.rules.RmuteAfter) {
                warnedUser.addRole(config.roles.muteRole)
                .then(function() {
                    client.guilds.get(config.channels.guild).channels.get(config.channels.log.alerts).send(`:boot: The user <@${warnedUser.id}> (${warnedUser.user.username}#${warnedUser.user.discriminator}) has had the mute role added to them for reaching **${config.rules.RmuteAfter}** warnings.`);
                });
            }
            if (userWarns.length == config.rules.kickAfter) {
                warnedUser.kick(`User has reached ${config.rules.kickAfter} warnings`)
                .then(function() {
                    client.guilds.get(config.channels.guild).channels.get(config.channels.log.alerts).send(`:boot: The user <@${warnedUser.id}> (${warnedUser.user.username}#${warnedUser.user.discriminator}) has been kicked from the server for raching **${config.rules.kickAfter}** warnings.`);
                });
            }
            if (userWarns.length == config.rules.banAfter) {
                warnedUser.ban({reason: `User has reached ${config.rules.banAfter} warnings`})
                .then(function() {
                    client.guilds.get(config.channels.guild).channels.get(config.channels.log.alerts).send(`:hammer: The user <@${warnedUser.id}> (${warnedUser.user.username}#${warnedUser.user.discriminator}) has been banned from the server for raching **${config.rules.banAfter}** warnings.`);
                });
            }
        }
    }
    catch (err) {
        console.log(err);
    }
}

// Additional Functions
function extractUsername(str){
    const matches = str.match(/"(.*?)"/);
    return matches ? matches[1] : str;
}

function findUsernameUser(username) {
    var usernameSplit = username.split("#");
    var findUsers = client.users.findAll("username", usernameSplit[0]);
    for (i=0; i < findUsers.length; i++) {
        if (findUsers[i].discriminator == usernameSplit[1]) {
            return findUsers[i].id;
        }
    }
}

function dbRequest(path) {
    try { return botDB.getData(path); }
    catch (err) { return undefined; }
}