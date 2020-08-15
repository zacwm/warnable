// Warnable 2.0.0 - Event
const warnable = require("../warnable.js");
const client = warnable.client;

client.on("ready", () => {
    console.info("[ ready ]", `Signed in to Discord as ${client.user.tag}`);
});

client.login(warnable.config.token);