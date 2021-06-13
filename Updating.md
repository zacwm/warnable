[**< Back**](./README.md)

# Warnable v3 | Updating

**[Before updating, make sure you have the bot running once after setup!](./Setup.md)**

**Note:** This only works if you used the JSON DB type from v2

## Steps to update
1. If you already have warnings in your new v3 database, make a backup!
2. Copy the JSON Database file from v2 to the v3 main folder (Where the `package.json` file is located).
3. Open the folder in the terminal, and run `npm run update ./YOUR-DB-FILE-NAME.json`
4. It will read all warnings and merge them to your new database!