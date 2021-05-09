// Warnable 2.0.0 - Command
const warnable = require("../warnable");

warnable.command("unwarn", async (msg) => {
    let msgArgs = msg.content.split(" ");

if (/^<[@][!&]?[0-9]+>$/.test(msgArgs[1]) || /[0-9]+/.test(msgArgs[1]) && /^[-]?[0-9]+$/.test(msgArgs[2])) {
        let userId = (msg.mentions.members.first()) ? msg.mentions.members.first().user.id : msgArgs[1].match(/[0-9]+/)[0];
        let warningNum = (msgArgs[2]) ? parseInt(msgArgs[2]) : 1;
        let reason = (msgArgs[3]) ? msg.content.substring(msgArgs.slice(0, 3).join(" ").length + 1) : "No reason provided";
        let issuer = msg.author.id;
        
            warnable.makeLog(msg.guild.id, "warnings", `**Warning removed**\nWarning **${warningNum}** from <@${userId}> was removed by <@${issuer}>. Reason: \`${reason}\``);
            msg.channel.send({ embed: {
                color: warnable.config.msg.colorSuccess,
                description: `Warning **${warningNum}** from <@${userId}> was removed by <@${issuer}>. Reason: \`${reason}\``
            }})
            warnable.db.removeWarning(msg.guild.id, userId, warningNum)
            
        
        .catch(() => {
            msg.channel.send({ embed: {
                color: warnable.config.msg.colorError,
                description: "Failed to remove warning... Double check the user and warning number."
            }});
        });
    }});
