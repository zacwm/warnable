// # warnable v3-dev

/*
  ,-.       _,---._ __  / \
 /  )    .-'       `./ /   \
(  (   ,'            `/    /|
 \  `-"             \'\   / |
  `.              ,  \ \ /  |
   /`.          ,'-`----Y   |
  (            ;   yo,  |   '
  |  ,-.    ,-'  almost |  /
  |  | (   |    done!!! | /
  )  |  \  `.___________|/
  `--'   `--'
*/

console.log('    / \\--------------------, \n     \\_,|      warnable   * | \n        |  *    v3-dev      |\n        |  ,------------------\n        \\_/_________________/ \n');
console.warn('Hey!!!\nThis is some kinda rewrite testing with some new features.\nTEST AT UR OWN RISK. No support provied.\n\nHave fun lol...\n\n');

const fs = require('fs');
const path = require('path');
const config = require(path.join(__dirname, '../configs/config.json'));
const { database } = require('./database');
const { Client, Intents } = require('discord.js');
require('./configManager');

exports.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS] });
exports.modules = {};

// # Load modules
fs.readdirSync(path.join(__dirname, './modules')).forEach(file => {
  try {
    if (!file.endsWith('.js')) return;
    this.modules[file] = require(path.join(__dirname, './modules', file));
  }
  catch(err) {
    console.error(err);
  }
});

// # Init
(async () => {
  await database.sync();
  await this.client.login(config.token);
  require('./common/events');
})();