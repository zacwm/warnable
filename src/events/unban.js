// Warnable 2.0.0 - Event
const warnable = require(`${__dirname}/../warnable`);
const config = require(`${__dirname}/../config`);

warnable.client.on("guildBanAdd", (guild, user) => {
    if (config.guilds.hasOwnProperty(guild.id)) {
        var cg = config.guilds[guild.id];
        if (cg.channels && cg.channels.users) {
            if (guild.channels.cache.get(cg.channels.users)) {
                warnable.db.getWarnings(guild.id, user.id)
                .then(warnings => {
                    guild.channels.cache.get(cg.channels.users).send("", { embed: {
                        color: 0xc0392b,
                        author: {
                            name: `User Banned`
                        },
                        thumbnail: {
                            url: user.displayAvatarURL()
                        },
                        title: `${user.tag}`,
                        description: `ID: ${user.id} | Type: ${"Unknown"}\nWarning points: ${warnings.reduce((prev, val) => prev + val.points, 0)}`
                    }});
                });
            }
            else {
                console.log(`* Failed to log users event in ${guild.name} (${guild.id})`);
            }
        }
        else {
            console.log('2');
        }
    }
    else {
        console.log('1')
    }
});