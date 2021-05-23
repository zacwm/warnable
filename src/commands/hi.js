// # warnable v3-dev | Command

exports.meta = {
  name: 'hi',
  description: 'Replies with hello back!',
};

exports.interaction = async (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) await interaction.reply('Hello!', { ephemeral: true });
};