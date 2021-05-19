# warnable | v3-dev | Commands

### !! Commands run through Discord slash commands. No prefix. !!
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

## Admin commands
**READ THIS** --> Admin commands can only be used in one config set guild and will work with the config set admin role. 
<br/>

Name | Description | Example Usage
--- |--- |---
status | Returns an overview of useful things(?) | `/status`
guild | Add or remove the guild to the guilds to work for.  | `/guild add Guild_ID`<br />`/guild remove Guild_ID`  