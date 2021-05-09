// Warnable 2.0.0 - Command
const warnable = require(`${__dirname}/../warnable`);
const config = warnable.config;

warnable.command("warn", (msg) => {
    let msgArgs = msg.content.split(" ");
    if ((/^<[@][!&]?[0-9]+>$/.test(msgArgs[1]) || /[0-9]+/.test(msgArgs[1])) && /^[-]?[0-9]+$/.test(msgArgs[2])) {
        let userid = (msg.mentions.members.first()) ? msg.mentions.members.first().user.id : msgArgs[1].match(/[0-9]+/)[0];
        let points = parseInt(msgArgs[2]);
        let reason = (msgArgs[3]) ? msg.content.substring(msgArgs.slice(0, 3).join(" ").length + 1) : "No reason provided";
        let issuer = msg.author.id;
        if ((msg.mentions.members.first()) ? !config.guilds[msg.guild.id].roles.admin.some(r => msg.mentions.members.first().roles.cache.has(r)) : true) {
            warnable.db.addWarning(msg.guild.id, userid, points, reason, issuer)
            .then(data => {
                warnable.makeLog(msg.guild.id, "warnings", `**New warning**\n<@${userid}> (Points: ${data}) was warned by <@${issuer}>\nReason: \`${reason}\` Penalty: **${points} point${(!(points == 1 || points == -1)) ? "s" : ""}**`);
                if (points > 0) {
                    warnable.checkPoints(msg.guild.id, userid, data);
                    if (config.guilds[msg.guild.id].directmessage) {
                        let dm = config.guilds[msg.guild.id].directmessage
                        dm = dm.replace("%points", points);
                        dm = dm.replace("%total", data);
                        dm = dm.replace("%reason", reason);
                        msg.guild.members.cache.get(userid).user.send(dm);
                    }
                }
                if (msg.channel.id !== config.guilds[msg.guild.id].channels.warnings) msg.channel.send({ embed: {
                    color: config.msg.colorSuccess,
                    description: `**${points} warning point${(!(points == 1 || points == -1)) ? "s" : ""}** applied to <@${userid}> for \`${reason}\``
                }});
            });
        }
        else {
            msg.channel.send({ embed: {
                color: config.msg.colorError,
                description: "Unable to warn admins."
            }});
        }
    }
    else {
        msg.channel.send({ embed: {
            color: config.msg.colorError,
            description: "Missing user and/or points"
        }});
    }
});
