// # warnable v3-dev | Command

const { MessageEmbed } = require('discord.js');
const Warnings = require('../common/warnings');

exports.meta = {
  warnable: {
    type: 'guild',
    requirements: ['admin', 'moderator'],
  },
  name: 'warn',
  description: 'Applies a warning to a member',
  options: [
    {
      name: 'user',
      type: 'STRING',
      description: 'The user to warn | @mention or ID',
      required: true,
    },
    {
      name: 'points',
      type: 'INTEGER',
      description: 'The amount of points to add',
      required: true,
    },
    {
      name: 'reason',
      type: 'STRING',
      description: 'The reason they were warned',
      required: false,
    },
  ],
};

exports.interactionCreate = async (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName !== this.meta.name) return;
  const serverConfig = process.servers[interaction.guildId];
  // Check if server is configued.
  if (!serverConfig) {
    return interaction.reply({ embeds: [
      new MessageEmbed()
      .setDescription('This server isn\'t configured by the bot admin.'),
    ], ephemeral: true });
  }
  const member = await interaction.member.fetch();
  if (!member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator].includes(role.id))) {
    return interaction.reply({ embeds: [
      new MessageEmbed()
      .setDescription('You don\'t have permission to use this command.'),
    ], ephemeral: true });
  }
  if (!interaction.options.get('user').value.match(/\d+/g)) {
    return interaction.reply({ embeds: [
      new MessageEmbed()
      .setDescription('An invalid mention or ID was provided.'),
    ], ephemeral: true });
  }
  const data = {
    guildID: interaction.guildId,
    userID: interaction.options.get('user').value.match(/\d+/g)[0],
    points: parseInt(interaction.options.get('points').value),
    issuerID: interaction.user.id,
    reason: interaction.options.get('reason') ? interaction.options.get('reason').value : 'No reason provied.',
    unixTime: (new Date(new Date().toUTCString()).getTime() / 1000).toString(),
  };

  Warnings.newWarning(data)
  .then((descString) => {
    interaction.reply({ embeds: [
      new MessageEmbed()
      .setTitle('Warning added!')
      .setDescription(descString)
      .setColor(0xf39c12),
    ], ephemeral: true });
  })
  .catch((err) => {
    console.error(err);
    interaction.reply({ embeds: [
      new MessageEmbed()
      .setDescription('Something failed...'),
    ], ephemeral: true });
  });
};