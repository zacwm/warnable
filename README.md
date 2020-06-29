# Warnable
Version 2.0.0 (June 2020 - WIP)

## !! THIS VERSION IS NOT FINISHED !!
This version is still in development! It is likely features are still missing. Please don't make an issue for this branch until it's released out of development. Contact me for suggestions or help: Zachary#0001

### Changes in 2.0.0
- (+) Updated to Discord.js v12.
- (+) Warning points.
- (+) Prune messages.
- (+) ~~Multiple DB type support.~~ (Sticking to node-json-db)
- (+) Listing warnings now has pages.
- (+) Extra logging - Message & user updates.
- (+) Multiple Discord server support.
- (+) Mute timer - With warnings or manually.
- (-) Commands & events no longer in one file.
- (-) User tags (eg: Zachary#0001) support.
- (-) Warning ID's

### Commands
All commands start with the prefix & can only be used by admins that are both set in the config | () = Required, [] = Optional
#### `warn (@user) (points) [reason]`
Adds warning points to the user. 
User must be mentioned (Still possible to mention with ID if user is not in the guild/server). If no reason is provided, it will set the reason to "No reason provided".

#### `remove (@user) [number]` | `remove last`
User: Removes a warning from the user. If no number is specified, it will remove the users last warning, otherwise it will remove the warning from the position in their warning list. *If you wish to remove a certain amount of points, I suggest warning them with negative points*.
Last: Removes the last warning given to any user within the guild/server.

#### `list (@user) [page number]`
Gets a list of warnings issued to the mentioned user. A maximum of 5 warnings will display on a page. If there are more than 5 warnings, use the page number to navigate through other pages (defaults to first page if none is specified).

#### `purge (number)`
Bulk deletes the number of messages in the channel used in.

#### `ping`
🏓🏓🏓🏓🏓🏓🏓

More moderation commands may be added in the future.

### Setup
This version isn't quite finished yet, so I'll leave it up to you. The config should help you out quite a bit though. ¯\\\_(ツ)\_/¯