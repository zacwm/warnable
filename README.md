<p align="center">
  <img src="https://zachary.fun/assets/images/work/warnable.png"/>
</p>

Version 2.0.0<br/>
I'm happy to call v2.0.0 ready! 🎉

## Changes in 2.0.0
- (+) Updated to Discord.js v12.
- (+) Warning points.
- (+) Prune messages.
- (+) Listing warnings now has pages.
- (+) Extra logging - Message & user updates.
- (+) Multiple Discord server support.
- (+) Mute and temp ban timer - Also supports leave/join bypass.
- (-) Commands & events no longer in one file.
- (-) User tags (eg: Zachary#0001) support.
- (-) Warning ID's

## Commands
All commands start with the prefix & can only be used by admins that are both set in the config | () = Required, [] = Optional
### `warn (@user) (points) [reason]`
Adds warning points to the user. 
User must be mentioned (Still possible to mention with ID if user is not in the guild/server). If no reason is provided, it will set the reason to "No reason provided".

### `remove (@user) [number]` | `remove last`
User: Removes a warning from the user. If no number is specified, it will remove the users last warning, otherwise it will remove the warning from the position in their warning list. *If you wish to remove a certain amount of points, I suggest warning them with negative points*.
Last: Removes the last warning given to any user within the guild/server.

### `list (@user) [page number]`
Gets a list of warnings issued to the mentioned user. A maximum of 5 warnings will display on a page. If there are more than 5 warnings, use the page number to navigate through other pages (defaults to first page if none is specified).

### `prune (number)`
Bulk deletes the number of messages in the channel used in.
Discord only allows up to 100 bulk deleting messages. Be careful repeating this command in a short period of time.

### `ping`
🏓 Table tennis and timers.

More moderation commands may be added in the future.

## Setup
**Note 1:** For the bot to make use of all permisions, 2FA is required on the bot owners account.<br />
**Note 2:** [Check out this to setup your own bot and get a token for it...](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
**Note 3:** [Here is a link on how to find IDs in Discord](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)<br />
1. Navigate to the directory in terminal
2. Ensure Node.js 12.0.0 or newer is installed by using `node -v`
3. Install required packages by using `npm i`
4. Rename `template.config.js` to `config.js`, then open and follow steps inside.
5. Copy a DB type that you wish to use from the `/databases` folder and paste it in the `/src` folder with the name `db.js`
6. To start bot, run `npm start`
7. Done! :)

## Updating from v1.0.0
Included is a script to convert the Warnable v1.0.0 JSON database for Warnable v2.0.0. **(( Make sure to complete the setup first and run the bot once! ))**<br />
The update script will use the database you configured in the setup. 👍

Steps to run the updater:
1. Open /src/update.js and edit the setting values for your configuration.
2. Run `npm run update [v1 db path]` in terminal.
3. Read and follow instructions.
4. Done!
