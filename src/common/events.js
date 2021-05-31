// # Warnable v3 | Common - Events
// Handles events recieved from Discord.

const { client, commands, logs } = require('../warnable');
const punishments = require('./punishments');

client.on('ready', async () => {
  if (!client.application.owner) await client.application.fetch();
  logs.console('event', `Logged in and ready as '${client.user.tag}'`);
  const cmdData = [];

  for(const command in commands) {
    try {
      if (commands[command]['ready']) commands[command].ready();
      if (commands[command]['meta']) {
        cmdData.push(commands[command].meta);
      }
    }
    catch(e) {
      logs.console('error', `Event error on 'ready' by '${command}'`);
    }
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
});

client.on('message', (msg) => {
  cmdEvent('message', (msg));
});

client.on('guildMemberAdd', (member) => {
  punishments.rejoin(member.guild.id, member.user.id);
  cmdEvent('guildMemberAdd', (member));
});

client.on('interaction', async interaction => {
  cmdEvent('interaction', (interaction));
  logs.console('event', `Interaction ${interaction.isCommand() ? `'${interaction.commandName}'` : ''} run by ${interaction.user.tag} (${interaction.user.id})`);
});

function cmdEvent(event, vals) {
  for(const command in commands) {
    try {
      if (commands[command][event]) commands[command][event](vals);
    }
    catch(e) {
      logs.console('error', `Event error on '${event}' by '${command}'`);
    }
  }
}