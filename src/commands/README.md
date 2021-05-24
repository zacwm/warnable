# warnable | v3-dev | Commands

### !! Commands run through Discord slash commands. No prefix. (except some bot admin commands) !!
### !! this is the plan... may not work, may not be done... good luck :) !!
<br/>

## Main commands
Name | Description | Example Usage | Role Reqs
--- |--- |--- |---
hi | Hello! :)<br /> Used to check if the bot works. | `/hi` | None/Anyone
warn | Applies warning points to the user (Mentioned user or ID) | `/warn @mentioned_user 5 Farting too loud.`<br />`/warn User_ID -5 Said I was cool.` | Moderator
unwarn | Removes warings from user. | `/warn @mentioned_user 5 Farting too loud.`<br />`/warn User_ID -5 Said I was cool.` | Moderator
list | List all warnings for the user. | `/list @mentioned_user`<br />`/list User_ID` | Viewer
punish | Punish a user via perm/temp ban/mute. Doesn't apply to the warn logs but will log to the set log channel. No time will default to perm mute/ban. | `/punish @mentioned_user ban 1d` = temp-banned 1 day.<br />`/punish User_ID mute 1w` = temp-muted 1 week. | Moderator
unpunish | Will remove the punishment and unban/unmute the user. This works for manual punishments and auto-applied punishments by warnings. | `/unpunish @mentioned_user`<br />`/unpunish User_ID` | Moderator

<br />

## Bot admin commands
**READ THIS** --> Bot admin commands are mainly used to prepare the bot... Bot admins must be set in the `.env` as user ID's. All bot admin commands start with `!admin [command name here] ...` 
<br/>

Name | Description | Example Usage
--- |--- |---
setAdmin | Sets a admin role in the current server. **SERVER ADMINS ARE NOT BOT ADMINS ->** Server admins have access to everything in the server only as well as configuring server settings.  | `!admin setAdmin 123`