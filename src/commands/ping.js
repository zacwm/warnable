// Warnable 2.0.0 - Command
const warnable = require("../warnable");

warnable.command("ping", async (msg) => {
    let pingingMsg = await msg.channel.send("", { embed: {
        color: warnable.config.msg.colorSuccess,
        description: "Pinging..."
    }});
    pingingMsg.edit({ embed: {
        color: warnable.config.msg.colorSuccess,
        description: `**Pong!** Response time was ${pingingMsg.createdTimestamp - msg.createdTimestamp}ms`
    }});
});
