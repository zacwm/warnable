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
const chokidar = require('chokidar');
const configTest = require('./common/configTest');
const { Client, Intents } = require('discord.js');
exports.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS] });
exports.config = require('../configs/config.json');
exports.modules = {};
exports.logs = require('./common/logs');
require('./common/events');

this.client.login(this.config.token);

// # Load warnable modules
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

// # Watch server config files.
const configFiles = chokidar.watch(path.join(__dirname, '../configs/servers'));
configFiles.on('add', (dir) => {
  const FileDirArray = dir.split('\\');
  const FileName = FileDirArray[FileDirArray.length - 1];
  const ServerID = FileName.replace('.json', '');
  if (ServerID == 'template') { return; }
  else if (!/\d+\.json/.test(FileName)) {
    this.logs.console('config', `FAILED to load server config file '${FileName}'. Reason: Invalid server ID for file name.`);
    return;
  }
  const FileData = JSON.parse(fs.readFileSync(dir));
  configTest(FileData)
  .then(() => {
    if (!process.servers) process.servers = {};
    process.servers[ServerID] = FileData;
    this.logs.console('config', `Updated server config for '${ServerID}'`);
  })
  .catch((errReason) => {
    this.logs.console('config', `FAILED to load server config for '${ServerID}'. Reason: ${errReason}`);
  });
});

configFiles.on('change', (dir) => {
  const FileDirArray = dir.split('\\');
  const FileName = FileDirArray[FileDirArray.length - 1];
  const ServerID = FileName.replace('.json', '');
  if (ServerID == 'template') { return; }
  else if (!/\d+\.json/.test(FileName)) {
    this.logs.console('config', `FAILED to load server config file '${FileName}'. Reason: Invalid server ID for file name.`);
    return;
  }
  const FileData = JSON.parse(fs.readFileSync(dir));
  configTest(FileData)
  .then(() => {
    if (!process.servers) process.servers = {};
    process.servers[ServerID] = FileData;
    this.logs.console('config', `Updated server config for '${ServerID}'`);
  })
  .catch((errReason) => {
    this.logs.console('config', `FAILED to load server config for '${ServerID}'. Reason: ${errReason}`);
  });
});

configFiles.on('unlink', (dir) => {
  if (!process.servers) return;
  const FileDirArray = dir.split('\\');
  const ServerID = FileDirArray[FileDirArray.length - 1].replace('.json', '');
  if (process.servers[ServerID]) {
    delete process.servers[ServerID];
    this.logs.console('config', `Config for server '${ServerID}' was deleted.`);
  }
});