// Warnable 2.0.0 - Event
const warnable = require(`${__dirname}/../warnable`);
const config = require(`${__dirname}/../config`);

warnable.client.on("message", msg => {
    if (!msg.author.bot && msg.guild) {
        if (config.guilds.hasOwnProperty(msg.guild.id)) {
            if (msg.content.startsWith(config.prefix)) {
                if (config.guilds[msg.guild.id].roles.admin.some(r => msg.member.roles.cache.has(r))) {
                    let command = msg.content.toLowerCase().split(" ")[0].substr(config.prefix.length);
                    if (warnable.commands.hasOwnProperty(command)) warnable.commands[command](msg);
                }
                else {
                    msg.channel.send("", { embed: {
                        color: 0xe74c3c,
                        description: "You do not have permission to use that command."
                    }});
                }
            }
        }
    }
});