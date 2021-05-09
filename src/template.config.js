// Warnable 2.0.0 - Config
module.exports = {
    token: "", // Discord Bot Token - Obtained from the Discord Developer Portal.

    prefix: ".", // Prefix for commands.

    guilds: { // Guilds must be added in here for the bot to work in.
        "guild-id": {
            points: [ // Actions for if a user reaches above any point values.
                // Range: The range of points for the action to trigger; Points must be lower number then higher number. 
                // Message: "%guild" = The server name / "%points" = Their total points value when the action took place.
                // Leave message blank ("") to disable.
                {
                    range: "5-7",
                    action: "mute-1d",
                    message: "You have been temporarily muted for one day in %guild"
                },
                {
                    range: "8-11",
                    action: "mute-7d",
                    message: "You have been temporarily muted for seven days in %guild"
                },
                {
                    range: "12-14",
                    action: "ban-7d",
                    message: "You have been temporarily banned for seven days in %guild"
                },
                {
                    range: "15-100",
                    action: "ban",
                    message: "You have been permanently banned in %guild for reaching %points"
                }
            ],
		
	     directmessage: "⚠ **You have been warned!** ⚠\n> You recieved %points point(s) for `%reason`.\n> You now have a total of %total point(s).", // Direct message the user whenever warned. "" to disable. 
            // "\n" = next line. "%points" = points warned, "%total" = their total points, "%reason" = the reason they were warned.
            roles: { // Role ID's for the guild.
                mute: "", // Used for the mute function.
                immune: [], // Auto mod ignores anyone with the role applied.
                moderator: [], // Moderators can only view warnings.
                admin: [] // Admins can apply, remove warnings and adjust guild settings.
            },
            channels: { // Channel ID's to send logs. "" to disable > Note: Logs will still display in the console if disabled.
                important: "", // Actions (mute, kick or ban) on a user from points or manual commands.
                warnings: "", // New warnings that were added to a user.
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
