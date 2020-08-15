// Warnable 2.0.0 - Command
const warnable = require(`${__dirname}/../warnable`);
const config = require(`${__dirname}/../config`);

warnable.command("warn", (msg) => {
    var msgArgs = msg.content.split(" ");
    if (/^<[@][!&]?[0-9]+>$/.test(msgArgs[1]) && /^[-]?[0-9]+$/.test(msgArgs[2])) {
        var userid = (msg.mentions.members.first()) ?  msg.mentions.members.first().user.id : msgArgs[1].match(/[0-9]+/)[0];
        var points = parseInt(msgArgs[2]);
        var reason = (msgArgs[3]) ? msg.content.substring(msgArgs.slice(0, 3).join(" ").length + 1) : "No reason provided";
        var issuer = msg.author.id;
        if ((msg.mentions.members.first()) ? !config.guilds[msg.guild.id].roles.admin.some(r => msg.mentions.members.first().roles.cache.has(r)) : true) {
            warnable.db.addWarning(msg.guild.id, userid, points, reason, issuer)
            .then(data => {
                warnable.pointsActions(msg.guild.id, userid, data);
                msg.channel.send("", { embed: {
                    color: 0x2ecc71,
                    description: `**${points} warning point${(!(points == 1 || points == -1)) ? "s" : ""}** (Total: ${data}) applied to <@${userid}> for \`${reason}\``
                }});
            });
        }
        else {
            msg.channel.send("", { embed: {
                color: 0xe74c3c,
                description: "Unable to warn admins."
            }});
        }
    }
    else {
        msg.channel.send("", { embed: {
            color: 0xe74c3c,
            description: "Missing user and/or points"
        }});
    }
});