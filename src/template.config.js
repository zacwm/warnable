// Warnable 2.0.0 - Config
module.exports = {
    token: "", // Discord Bot Token - Obtainable from the Discord Developer Portal.

    prefix: ".", // Prefix for commands.

    guilds: { // Guilds must be added in here for the bot to work in.
        "guild-id": {
            points: { // Actions for if a user reaches above any point values. "null" to disable.
                mute: 3, // Applies the mute role to the user.
                kick: 5, // Kicks the user from the guild.
                ban: 10, // Bans the user from the guild.
            },
            roles: { // Role ID's for the guild.
                mute: "", // Used for the mute function.
                immune: [], // Auto mod ignores anyone with the role applied.
                admin: [], // Admins can apply, remove warnings and adjust guild settings.
            },
            channels: { // Channel ID's to send logs. "null" to disable
                warnings: "", // New warnings and actions from points (mute, kick & banning).
                messages: "", // Edits or deletions to messages.
                users: "", // Users join, leaving, kicked & banned.
            }
        }
    },

    msg: { // Bot message settings.
        // Colors used for embeds (https://zachary.fun/i/0vk7L.png)
        colorSuccess: 0x2ecc71,
        colorError: 0xe74c3c
    },

    database: { // The Database options.
        fileName: ""
    }
}