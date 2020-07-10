// Warnable 2.0.0 - Command
const warnable = require("../warnable");

warnable.command("ping", async (msg) => {
    let pingingMsg = await msg.channel.send("Pinging..");
    let diff = pingingMsg.createdTimestamp - msg.createdTimestamp // Calculate the response time
    pingingMsg.edit(`Pong!\n${diff}ms`);
});
