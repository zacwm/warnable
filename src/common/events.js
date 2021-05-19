// # Warnable v3 | Common - Events
// Handles events recieved from Discord.

const { client, commands, logs } = require('../warnable');

client.on('ready', async () => {
  if (!client.application?.owner) await client.application?.fetch();
  logs('event', `Logged in and ready as '${client.user.tag}'`);
  
  let cmdData = [];

  for(let command in commands) {
    try {
      if (commands[command].hasOwnProperty('ready')) commands[command].ready();
      if (commands[command].hasOwnProperty('meta')) {
        cmdData.push(commands[command].meta);
      }
    } catch(e) {
      logs('error', `Event error on 'ready' by '${command}'`);
    };
  }

  let appCommands = await client.application?.commands.set(cmdData);
  logs('command', `${appCommands.size} application commands applied! `)
  appCommands.forEach((cmd) => {
    logs('command', `Intention ID: ${cmd.id} | Name: ${cmd.name} (${cmd.description})`)
  });
});

client.on('message', (msg) => {
  for(let command in commands) {
    try {
      if (commands[command].hasOwnProperty('message')) commands[command].message(message);
    } catch(e) {
      logs('error', `Event error on 'message' by '${command}'`);
    };
  }
});

client.on('interaction', async interaction => {
  for(let command in commands) {
    try {
      if (commands[command].hasOwnProperty('interaction')) commands[command].interaction(interaction);
    } catch(e) {
      logs('error', `Event error on 'interaction' by '${command}'`);
    };
  }
});