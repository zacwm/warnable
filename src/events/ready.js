// Warnable 2.0.0 - Event
const warnable = require("../warnable.js");
const client = warnable.client;

client.on("ready", () => {
    console.log(`Now ready!\nSigned in as ${client.user.username}#${client.user.discriminator}`)
});

client.login(warnable.config.token);