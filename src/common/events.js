// # Warnable v3 | Common - Events
// Handles events recieved from Discord.

const { client, modules, logs } = require('../warnable');
const punishments = require('./punishments');

const events = ['ready', 'message', 'messageUpdate', 'interaction', 'guildMemberAdd', 'guildMemberRemove'];
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
    const cmdData = [];

    for(const module in modules) {
      if (modules[module]['meta']) cmdData.push(modules[module].meta);
    }

    const appCommands = await client.application.commands.set(cmdData);
    logs.console('command', `${appCommands.size} application commands applied! `);
    appCommands.forEach((cmd) => {
      logs.console('command', `Intention ID: ${cmd.id} | Name: ${cmd.name} (${cmd.description})`);
    });

    // Punishment interval check
    setInterval(() => {
      Object.keys(process.servers).map((server) => { punishments.check(server); });
    }, 10000);
  }

  if (event === 'interaction') {
    logs.console('command', `Interaction${args[0].isCommand() ? ` '${args[0].commandName}'` : ''} run by ${args[0].user.tag} (${args[0].user.id})`);
  }

  // Command file events...
  for(const module in modules) {
    if (modules[module][event]) modules[module][event](...args);
  }
}