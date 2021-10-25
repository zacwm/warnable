// # Warnable v3 | Common - Events
// Handles events recieved from Discord.

const { client, modules, logs } = require('../warnable');
const punishments = require('./punishments');

const events = ['ready', 'messageCreate', 'messageUpdate', 'interactionCreate', 'guildMemberAdd', 'guildMemberRemove'];
events.forEach((event) => {
  client.on(event, (...args) => {
    runEvent(event, args);
  });
});

// Event Handler
async function runEvent(event, args) {
  // First event stuff...
  if (event === 'ready') {
    if (!client.application.owner) await client.application.fetch();
    logs.console('event', `Logged in and ready as '${client.user.tag}'`);

    // Set Global Commands
    const GlobalCommandData = [];
    for (const module in modules) {
      if (modules[module]['meta']) {
        const moduleMeta = modules[module].meta;
        if (moduleMeta.warnable.type == 'global') {
          delete moduleMeta.warnable;
          GlobalCommandData.push(moduleMeta);
        }
      }
    }
    client.application.commands.set(GlobalCommandData)
    .then(() => { logs.console('command', `Set ${GlobalCommandData.length} global command${GlobalCommandData.length == 1 ? 's' : ''}.`); })
    .catch(console.error);

    // Set Guild Commands
    Object.keys(process.servers).forEach((serverID) => {
      client.guilds.fetch(serverID)
      .then(Guild => {
        const GuildCommandData = [];
        const roleData = process.servers[serverID].roles;
        for (const module in modules) {
          try {
            if (modules[module]['meta']) {
              const ServerModuleMeta = modules[module].meta;
              ServerModuleMeta.permissions = [];
              if (modules[module].meta.warnable) {
                if (modules[module].meta.warnable.type === 'guild' && modules[module].meta.warnable.requirements) {
                  modules[module].meta.warnable.requirements.forEach((reqType) => {
                    if (roleData[reqType]) {
                      ServerModuleMeta.permissions.push({
                        id: roleData[reqType],
                        type: 'ROLE',
                        permission: true,
                      });
                    }
                  });

                  delete ServerModuleMeta.warnable;
                  GuildCommandData.push(ServerModuleMeta);
                }
              }
            }
          }
          catch (ModuleMetaError) {
            logs.console('error', `Failed at module '${module}'`);
            console.error(ModuleMetaError);
          }
        }
        Guild.commands.set(GuildCommandData)
        .then(() => { logs.console('command', `Set ${GuildCommandData.length} command${GuildCommandData.length == 1 ? 's' : ''} for server: ${serverID}`); })
        .catch(console.error);
      })
      .catch((GuildFetchError) => {
        console.error(GuildFetchError);
        logs.console('error', `Failed to find configured server '${serverID}', make sure the bot is invited to that server.`);
      });
    });

    // Punishment interval check
    setInterval(() => {
      Object.keys(process.servers).map((server) => { punishments.check(server); });
    }, 10000);
  }

  if (event === 'interactionCreate') {
    logs.console('interaction', `Interaction${args[0].isCommand() ? ` '${args[0].commandName}'` : ''} run by ${args[0].user.tag} (${args[0].user.id})`);
  }
  
  // Nickname change interval check
  setInterval(() => {
    if (isMidnight) {
      changeNick();
    }
  }, 60000);
  
  // Command file events...
  for(const module in modules) {
    if (modules[module][event]) modules[module][event](...args);
  }
}
