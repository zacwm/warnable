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
    .then(async v => {
      console.dir(v);
      await interaction.reply('Hello!', { ephemeral: true });
    })
    .catch(async (vErr) => {
      console.error(vErr);
      await interaction.reply('Something failed.', { ephemeral: true });
    });
  }
};