// Warnable 2.0.0 - Command
const warnable = require("../warnable");

warnable.command("ping", (msg) => {
    msg.reply("Pong!");
});