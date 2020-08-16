// Warnable 2.0.0 - Config
module.exports = {
    token: "", // Discord Bot Token - Obtained from the Discord Developer Portal.

    prefix: ".", // Prefix for commands.

    guilds: { // Guilds must be added in here for the bot to work in.
        "guild-id": {
            points: { // Actions for if a user reaches above any point values. 0 to disable.
                mute: 3, // Applies the mute role to the user.
                kick: 5, // Kicks the user from the guild.
                ban: 10 // Bans the user from the guild.
            },
            pointMessages: { // Messages to be sent via DM to the user who has reached a warning point action. Leave blank ("") to disable.
                // "%guild" = The server name / "%points" = Their total points value when the action took place.
                mute: "You have been muted in %guild for reaching %points warning points.",
                kick: "You have been kicked in %guild for reaching %points warning points.",
                ban: "You have been banned in %guild for reaching %points warning points.\nhttps://youtu.be/fC7oUOUEEi4"
            },
            roles: { // Role ID's for the guild.
                mute: "", // Used for the mute function.
                immune: [], // Auto mod ignores anyone with the role applied.
                admin: [] // Admins can apply, remove warnings and adjust guild settings.
            },
            channels: { // Channel ID's to send logs. "" to disable > Note: Logs will still display in the console if disabled.
                warnings: "", // New warnings and actions from points (mute, kick & banning).
                messages: "", // Edits or deletions to messages.
                users: "" // Users join or leaving.
            }
        }
    },

    msg: { // Bot message settings.
        // Colors used for embeds (https://zachary.fun/i/0vk7L.png)
        colorSuccess: 0x2ecc71,
        colorError: 0xe74c3c
    }
}