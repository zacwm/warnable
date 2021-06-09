// # warnable v3-dev

/*
  ,-.       _,---._ __  / \
 /  )    .-'       `./ /   \
(  (   ,'            `/    /|
 \  `-"             \'\   / |
  `.              ,  \ \ /  |
   /`.          ,'-`----Y   |
  (            ;   hi,  |   '
  |  ,-.    ,-' this is |  /
  |  | (   | unfinished | /
  )  |  \  `.___________|/
  `--'   `--'
*/

console.log('    / \\--------------------, \n     \\_,|      warnable   * | \n        |  *    v3-dev      |\n        |  ,------------------\n        \\_/_________________/ \n');
console.warn('Hey!!!\nThis is some kinda rewrite testing with some new features.\nTEST AT UR OWN RISK. No support provied.\n\nHave fun lol...\n\n');

try {
  const Database = require('./database');
  exports.db = new Database();
}
catch(err) {
  if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('./database')) {
    console.error('No database file was found.\n- Check the SETUP.md file for a guide to setup warnable.');
  }
  else {
    console.error(err);
    console.error('Database file failed to load. You should report the error above as a GitHub issue.');
  }
  process.exit(0);
}

const path = require('path');
const fs = require('fs');
const { Client, Intents } = require('discord.js');
exports.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS] });
exports.modules = {};
exports.logs = require('./common/logs');
process.servers = JSON.parse(fs.readFileSync(path.join(__dirname, './servers.json'))).servers;
require('./common/events');
require('dotenv').config();

// # Load warnable modules
(() => {
  fs.readdirSync(path.join(__dirname, './modules')).forEach(file => {
    try {
      if (!file.endsWith('.js')) return;
      this.modules[file] = require(path.join(__dirname, './modules', file));
    }
    catch(err) {
      this.logs.console('error', `Error thrown trying to load module '${file}'`);
      console.error(err);
    }
  });
})();

// # Servers Config File Changes
fs.watchFile(path.join(__dirname, './servers.json'), () => {
  try {
    const newFile = JSON.parse(fs.readFileSync(path.join(__dirname, './servers.json')));
    process.servers = newFile.servers;
    this.logs.console('servers', 'Server config updated from servers.json');
  }
  catch(err) {
    console.error(err);
    this.logs.console('error', 'Failed to load the updated server.json config! Using previous changes...');
  }
});

this.client.login(process.env.TOKEN);