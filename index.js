// Warnable
// Version 1.0.0 - By www.zachary.fun

const Discord = require("discord.js");
const jsonDB = require('node-json-db');
const client = new Discord.Client();
const jsonDB = new jsonDB("botData", true, true);

client.login(config.properties);

// Bot Listening
client.on("ready", () => {
    console.log(`${client.user.username} is now ready!`);
    if (client.guilds.size > 1) {
        console.warn("!!! WARNING !!! Warnable is not supported for more than one Discord server.\nWarnings do NOT save for each server, all warnings sync across servers for users.\nThis may be supported in the future, but do not make an issue if you are using it in more than one server please :(");
    }
});

//- Commands
const commands = {
    "warn": (msg) => {
        if (msg.mentions.users) {
            var warningUser = msg.mentions.users.first.id;
            var warningReason = msg.content.replace(/[|&;$%@"<>()+,] /g , "").split(" ")[2];
            warningAdd(warningUser, warningReason, msg.author);
        }
        else {
            var warningUsername = extractUsername(msg.content);
            if (warningUsername.match(/.*#\d{4}\b/g)) {
                var warningUser = findUsernameUser(warningUsername);
                if (warningUser) {
                    var warningReason = msg.content.replace('"' + warningUsername + '" ', "");
                    warningAdd(warningUser, warningReason, msg.author);
                } 
                else {
                    msg.channel.send("Unable to find user.");
                }
            }
        }
    },
    "remove": (msg) => {

    },
    "list": (msg) => {

    },
    "info": (msg) => {

    },
    "settings": (msg) => {

    }
};

client.on("message", msg => {
    if (msg.guild) {
        if (!msg.content.startsWith(config.prefix)) return;
        if (commands.hasOwnProperty(msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0])) {
            if (config.admin.roles.some(r=> msg.member.roles.array.indexOf(r) >= 0) || config.admin.users.includes(msg.author.id)) {
                commands[msg.content.toLowerCase().slice(config.prefix.length).split(' ')[0]](msg);
            }
            else {
                msg.channel.send("You don't have permission to use this command.");
            }
        }
    }
});

// Warning Functions
function warningAdd(uid, reason, issuer) {

}

function warningRemove(wid) {

}

// Additional Functions
function extractUsername(str){
    const matches = str.match(/"(.*?)"/);
    return matches ? matches[1] : str;
}

function findUsernameUser(username) {

}