// # Warnable v3 | Common - Events
// Handles events recieved from Discord.

const { client, commands, logs } = require('../warnable');
const punishments = require('./punishments');

const events = ['ready', 'message', 'interaction', 'guildMemberAdd'];
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
    for(const command in commands) {
      if (commands[command]['meta']) cmdData.push(commands[command].meta);
    }

    const appCommands = await client.application.commands.set(cmdData);
    logs.console('command', `${appCommands.size} application commands applied! `);
    appCommands.forEach((cmd) => {
      logs.console('command', `Intention ID: ${cmd.id} | Name: ${cmd.name} (${cmd.description})`);
    });

    setInterval(() => {
      Object.keys(process.servers).map((server) => {
        punishments.check(server);
      });
    }, 10000);
  }

  if (event === 'interaction') {
    logs.console('command', `Interaction ${args[0].isCommand() ? `'${args[0].commandName}'` : ''} run by ${args[0].user.tag} (${args[0].user.id})`);
  }

  // Command file events...
  for(const command in commands) {
    if (commands[command][event]) commands[command][event](...args);
  }
}