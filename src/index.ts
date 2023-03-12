import 'dotenv/config';
import path from 'path';
import { Client as DiscordClient, Events, GatewayIntentBits } from 'discord.js';
import { Sequelize } from 'sequelize';
import ModuleManager from './ModuleManager';
import WebDashboard from './WebDashboard';

// Todo: Have this be a configurable option on what dialect to use along with the connection string.
declare global {
  var database: Sequelize;
  var models: any;
  var client: DiscordClient;
}
global.database = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../warnable.db'),
});
global.models = {};

global.client = new DiscordClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
  ],
});

const modules = new ModuleManager(global.client);

global.client.on(Events.ClientReady, (c: DiscordClient) => {
  console.info(`Logged in to Discord as '${c.user?.tag}'`);
});

(async () => {
  await global.database.authenticate();
  await modules.load();
  await global.database.sync();
  await global.client.login(process.env.DISCORD_TOKEN);
  modules.registerSlashCommands();

  
  if (process.env.ENABLE_WEB_UI?.toLowerCase() === 'true') {
    const web = new WebDashboard(modules);
  }
})();