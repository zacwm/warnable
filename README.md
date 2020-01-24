# Warnable
Warnable is a bot to be easy for any Discord server admin to be able to setup and use on their own system.

### Features
- Warn System
- Simple warning commands
- Easy to edit

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