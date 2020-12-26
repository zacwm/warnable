// Warnable 2.0.0 - Command
const warnable = require(`${__dirname}/../warnable`);
const config = warnable.config;

warnable.command("list", (msg) => {
    var msgArgs = msg.content.split(" ");
    if (/^<[@][!&]?[0-9]+>$/.test(msgArgs[1]) || /[0-9]+/.test(msgArgs[1])) {
        var userid = (msg.mentions.members.first()) ? msg.mentions.members.first().user.id : msgArgs[1].match(/[0-9]+/)[0];
        var page = (msgArgs[2]) ? msgArgs[2] : "1";
        if (!isNaN(page)) {
            page = parseInt(page) - 1;
            warnable.db.getWarnings(msg.guild.id, userid)
            .then(warnings => {
                if (warnings.length == 0) return msg.channel.send("", { embed: {
                    color: config.msg.colorSuccess,
                    description: `No warnings found for <@${userid}>`
                }});
                var array_chunks = Array(Math.ceil(warnings.length / 5)).fill().map((_, index) => index * 5).map(begin => warnings.slice(begin, begin + 5));
                if (page > -1 && array_chunks.length > page) {
                    let memberTitle = msg.guild.members.cache.get(userid) ? `${msg.guild.members.cache.get(userid).user.tag} (${userid})` : userid
                    msg.channel.send({ embed: {
                        color: config.msg.colorSuccess,
                        author: {
                            name: `Warnings for ${memberTitle}`
                        },
                        title: `Total: ${warnings.length} (${warnings.reduce((prev, val) => prev + val.points, 0)}) | Page: ${page + 1}/${array_chunks.length}`,
                        description: array_chunks[page].map((warning, index) => `**${index + 1}) ${warning.reason}**\n└  ‎Points: ${warning.points}‎ | By: <@${warning.issuer}> | Time: ${(warning.time) ? warning.time : "Unknown"}`).join("\n")
                    }});
                }
                else {
                    msg.channel.send({ embed: {
                        color: config.msg.colorError,
                        description: "Page out of range."
                    }});
                }
            });
        }
        else {
            msg.channel.send({ embed: {
                color: config.msg.colorError,
                description: "Page argument must be a number"
            }});
        }
    }
    else {
        msg.channel.send({ embed: {
            color: config.msg.colorError,
            description: "A user must be specified."
        }});
    }
});
