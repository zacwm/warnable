// Warnable 2.0.0 - Command
const warnable = require("../warnable");

warnable.command("remove", async (msg) => {
    let msgArgs = msg.content.split(" ");

    // Remove last warning made in the guild.
    if (msgArgs[1] == "last") {
        warnable.db.removeWarning(msg.guild.id)
        .then(user => {
            msg.channel.send({ embed: {
                color: warnable.config.msg.colorSuccess,
                description: `Warning was removed for <@${user}>`
            }});
        })
        .catch(() => {
            msg.channel.send({ embed: {
                color: warnable.config.msg.colorError,
                description: "Failed to remove warning..."
            }});
        });
    }
    // Remove a specific warning from a user
    else if (/^<[@][!&]?[0-9]+>$/.test(msgArgs[1])) {
        let userId = (msg.mentions.members.first()) ? msg.mentions.members.first().user.id : msgArgs[1].match(/[0-9]+/)[0];
        let warningNum = (msgArgs[2]) ? parseInt(msgArgs[2]) : 1;
        warnable.db.removeWarning(msg.guild.id, userId, warningNum)
        .then(user => {
            msg.channel.send({ embed: {
                color: warnable.config.msg.colorSuccess,
                description: `Warning was removed for <@${user}>`
            }});
        })
        .catch(() => {
            msg.channel.send({ embed: {
                color: warnable.config.msg.colorError,
                description: "Failed to remove warning... Double check the user and warning number."
            }});
        });
    }
});
