// Warnable 2.0.0 - Command
const warnable = require("../warnable");

warnable.command("prune", (msg) => {
    var msgArgs = msg.content.split(" ");
    if (/^[-]?[0-9]+$/.test(msgArgs[1]) && parseInt(msgArgs[1] > 0)) {
        msg.channel.bulkDelete(parseInt(msgArgs[1]))
        .then(messages => {
            msg.channel.send("", { embed: {
                color: 0x2ecc71,
                description: `${messages.size} message${(messages.size > 1) ? "s were" : " was"} deleted.`
            }});
        })
        .catch((error) => {
            console.error(error);
            msg.channel.send("", { embed: {
                color: 0xe74c3c,
                title: "Problem trying to prune.",
                description: "Error was logged to console."
            }});
        });
    }
    else {
        msg.channel.send("", { embed: {
            color: 0xe74c3c,
            description: "Must include a number greater than 0."
        }});
    }
});