[**< Back**](./README.md)

# Warnable v3 | Setup

**Note:** Node.js 14.0.0 or newer is required before installation.

## Install steps:
1. Clone the package and navigate to the directory in the terminal.
2. Install the required packages by using `npm install`
3. Rename the `template.env` to `.env`, then open the file and paste your bots token. 
4. Open the `/src` folder and rename the `template.servers.json` to `servers.json`, then open the file and edit to your settings.
5. Open the `/database_types` folder and copy your perfered database type to the `/src` folder and rename it to `database.js`, then open and edit any required options towards the top of the file.
6. Run the bot using `npm start`
7. Done! 😄

## Toubleshooting

**If you are using Windows and using the SQLite DB**
- You may need to follow this [troubleshooting guide](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/troubleshooting.md)

## Having issues?
**Check out our [previous issues](https://github.com/zacimac/warnable/issues?q=is%3Aissue+is%3Aclosed) if you are still having issues, we may have already assisted with it...**

**But still feel free to [create a new issue](https://github.com/zacimac/warnable/issues/new) and we'll assist you ASAP!** *Just try to include some terminal errors or provide some configs so we know how to help!*