// # warnable v3-dev | Command

exports.meta = {
  name: 'hi',
  description: 'Replies with hello back!',
};

const { db } = require('../warnable');

exports.interaction = (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    db.getGuild(interaction.guildID)
    .then(v => {
      console.dir(v);
      interaction.reply('Hello!', { ephemeral: true });
    })
    .catch(err => {
      console.error(err);
      interaction.reply('Something failed.', { ephemeral: true });
    });
  }
};