// Warnable
// Version 1.0.0 - By www.zachary.fun

const Discord = require("discord.js");
const jsonDB = require("node-json-db");
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
                var warningReason = msg.content.replace("!warn <@" + warningUser + "> " , "");
                warningAdd(warningUser, warningReason, msg.author, function(res) {
                    msg.channel.send(res);
                });
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
                    var warningReason = msg.content.replace('!warn "' + warningUsername + '" ', "");
                    warningAdd(warningUser, warningReason, msg.author, function(res) {
                        msg.channel.send(res);
                    });
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

    },
    "info": (msg) => {

    },
    "settings": (msg) => {
        var msgArg = msg.content.toLowerCase().split(" ");
    }
};

client.on("message", msg => {
    if (msg.guild) {
        if (!msg.content.startsWith(config.prefix)) return;
        if (commands.hasOwnProperty(msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0])) {
            if (config.admins.roles.some(r=> msg.member.roles.array.indexOf(r) >= 0) || config.admins.users.includes(msg.author.id)) {
                commands[msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0]](msg);
            }
            else {
                msg.channel.reply("You don't have permission to use this command.");
            }
        }
    }
});

// Warning Functions
function warningAdd(uid, reason, issuer, callback) {
    var warningID = Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);
    botDB.push("/warnings/" + warningID, { user: uid, reason: reason, issuer: issuer.id, time: new Date() });
    if (dbRequest("/users/" + uid) !== undefined) {
        var warnings = dbRequest("/users/" + uid);
        warnings.push(warningID);
        botDB.push("/users/" + uid, warnings);
    }
    else {
        botDB.push("/users/" + uid, [warningID]);
    }
    callback("Warning has been added to <@" + uid + ">");
}

function warningRemove(wid, callback) {
    
}

function warningCheck(uid) {

}

// Additional Functions
function extractUsername(str){
    const matches = str.match(/"(.*?)"/);
    return matches ? matches[1] : str;
}

function findUsernameUser(username) {
    
}

function dbRequest(path) {
    try { return botDB.getData(path); }
    catch (err) { return undefined; }
}