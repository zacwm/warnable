// # warnable v3-dev | Command

const { MessageEmbed } = require('discord.js');
const package = require('../../package.json');

exports.meta = {
  warnable: {
    type: 'global',
  },
  name: 'config',
  description: 'Updates the servers configuration settings.',
};

exports.interaction = (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    const embedMessage = new MessageEmbed()
      .setTitle('Hey!')
      .setDescription('📃 [Click here](https://github.com/zacimac/warnable/commands/README.md) if you need help with our commands!\n' +
      '❗ [Click here](https://github.com/zacimac/warnable/issues) to report an issue.\n' +
      '❤ [Give this project a star on GitHub](https://github.com/zacimac/warnable)')
      .setFooter(`Running warnable@${package.version}`);
    interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
  }
};