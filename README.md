<p align="center">
  <img src="./assets/logo.png" alt="Warnable Logo" style="max-width: 400px;">
</p>
<p align="center">
  Version 3.0.0
</p>
<p align="center">
  A point-based warning, moderation and logging Discord bot that's simple and quick to use.
</p>
<hr/>

## Table of Contents

- [Features](#features)
- [Installation](#installation)
  - [Requirements](#requirements)
  - [Setup](#setup)
- [Commands](#commands)
  - [General](#general)
  - [Moderation](#moderation)
  - [Logging](#logging)
  - [Points](#points)
  - [Settings](#settings)
- [Automod](#automod)
- [Web Dashboard](#web-dashboard)
- [FAQ](#frequently-asked-questions-faq)
- [Contributing](#contributing)
- [License](#license)
- [Credits & Supporters](#credits)

## Features

- **Simple and easy to use.** Warnable is designed to be simple and easy to use. It's not bloated with features that you don't need.
- **Point-based system.** Warnable uses a point-based system to store warnings. This allows you to set actions to be taken when a user reaches a certain amount of points.
- **Logging.** Warnable can log all moderation actions to a channel of your choice. This allows you to keep track of all moderation actions, and be notified when a user is warned or warnable's automod takes action.
- **Automod.** Warnable has an automod system that can do multiple sorts of filtering. It can also integrate with Discord's built-in automod to apply warnable warnings. See more in the [automod](#automod) section.
- **[NEW] Customizable.** Warnable is customizable. You can set the points required for each action, the channel to log to, and more. What's new is that you can do it all from the web dashboard or by Discord commands instead of needing to manually edit the config file and restart the bot.
- **[NEW] Supports multiple servers.** Warnable supports multiple servers. You can even link servers together to share warnings and point actions.
- **[NEW] Supports multiple languages.** Warnable supports multiple languages. You can set the language for each server, and even set the language for each channel.
- **[NEW] Web dashboard.** Warnable has an optional web dashboard that allows you to manage your server from a web browser. You can also use the dashboard to edit settings, view warnings, and more! See more in the [web dashboard](#web-dashboard) section. The core of Warnable is still all in the bot, so you don't need to use the dashboard if you don't want to.

## Installation

### Requirements

- [Node.js](https://nodejs.org/en/) v12 or higher
- (Optional) SQL database (MySQL, MariaDB, PostgreSQL, SQLite, etc.)
- (Required if using web dashboard) Proxy server (Nginx, Apache, etc.)

Note: If you dont have a SQL database, Warnable will use SQLite by default to store data to a file.

### Setup

1. Download the latest release from the [releases page](https://github.com/zacimac/warnable/releases).
2. Extract the files to a folder.
3. Open a terminal in the folder and run `npm install` to install the dependencies.
4. Rename `template.env` to `.env` and edit the settings.
5. Run `npm start` to start the bot.

## Frequently Asked Questions (FAQ)

**Q: What happened to the original v3 branch?**
  - A: The original v3 branch was never finished. I was never happy with it and wanted features that I couldn't add to it. So I decided to start over from scratch. The original v3 branch has been archived.

<hr />

**Note: Because this branch is still in developement, the README is not yet finished or possibly outdated.**