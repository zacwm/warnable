# Warnable
Warnable is a bot to be easy for any Discord server admin to be able to setup and use on their own system.

### Features
- Warn System
- Simple warning commands
- Easy to edit

### Commands
The commands are pretty simple. Any new warnings will be saved under a 'warning ID'. Warning ID's can be used to remove warnings from users and probbaly more stuff as I keep updating this.
Commands can only be accessed if the user ID is added or a guild role is added in the 'config.json'.
Note: All commands must start with the prefix that is set in 'config.json'.

#### `warn {user} {reason}`
The warn command will add a warning to the user along with the reason.
The `{user}` can either be a mentioned user **OR** the username and discriminator surrounded by double quotes (e.g: "Zachary#0001")

#### `remove {warning ID}`
The remove command will delete the warning from the user and in the database.
Warning ID's can be found after warning a user or listing warnings for a user with the 'list' command

#### `list {user}`
The list command will list all warnings that a user has recieved. (As a heads up, I plan on introducing pages for the lists in the future, so it won't encounter any character limits for lots of warnings)
The `{user}` can either be a mentioned user **OR** the username and discriminator surrounded by double quotes (e.g: "Zachary#0001")

### Setup
Note: You can find most ID's by making sure you have developer mode enabled in your Discord settings and then doing [this](https://zachary.fun/i/ITp6y.png)
1. Rename "config.templete.json" to "config.json"
2. Enter in your bot token provided from the [Dicord Developer Portal](https://discordapp.com/developers/applications/) into the token field. 
3. Add the bot to your server by following this link, making sure you replace the "{BOTS-CLIENT-ID-HERE}" with the Client ID provided in the Developer Portal. (NOTE!!! 2FA Must be enabled on the bot owners account for permissions to work)
Link: https://discordapp.com/oauth2/authorize?client_id={BOTS-CLIENT-ID-HERE}&scope=bot&permissions=268443654
4. Add user ID's or role ID's into the admin arrays. 
5. Add the guild ID's and channel ID's.
6. Run `npm install` in ternimal
7. Start by running `npm start` or `node index.js`