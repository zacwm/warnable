// # warnable v3-dev | Command

const { MessageEmbed } = require('discord.js');

exports.meta = {
  warnable: {
    type: 'global',
  },
  name: 'config',
  description: 'Updates the servers configuration settings.',
};

exports.interactionCreate = (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName !== this.meta.name) return;
  interaction.reply({ embeds: [
    new MessageEmbed()
      .setTitle('Not ready :('),
  ], ephemeral: true });
};