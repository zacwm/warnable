const { MessageEmbed } = require('discord.js');
const Warnings = require('../database/Warnings');

exports.meta = {
  warnable: {
    type: 'guild',
    requirements: ['admin', 'moderator'],
  },
  name: 'unwarn',
  description: 'Removes a warning from a member.',
  options: [
    {
      name: 'last',
      description: 'Removes any last warning by time in the server.',
      type: 'SUB_COMMAND',
    },
    {
      name: 'id',
      description: 'Removes a warning based on the warning ID',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'id',
          type: 'INTEGER',
          description: 'The warning ID to remove',
          required: true,
        },
      ],
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

  // # sub-cmd = last
  if (interaction.options.getSubcommand() === 'last') {
    // Fetch the latest warning made.
    const latestWarning = await Warnings.max('id', { where: { guildID: interaction.guildId } });
    if (!latestWarning) {
      return interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('No more warnings to remove'),
      ], ephemeral: true });
    }
    // Fetch the warning data for a preview after deleted.
    const warningData = await Warnings.findOne({ where: { id: latestWarning } });
    await Warnings.destroy({
      where: {
        id: latestWarning,
      },
    });
    // Reply successfully deleted data.
    interaction.reply({ embeds: [
      new MessageEmbed()
      .setTitle('Removed last warning.')
      .setDescription(`**User:** <@${warningData.userID}> | **Points:** ${warningData.points}`
      + `\n**Issuer:** <@${warningData.issuerID}> | **Time:** ${(warningData.unixTime && warningData.unixTime !== 0) ? `<t:${warningData.unixTime}:f>` : 'Unknown'}`
      + `\n**Reason:** \`${warningData.reason}\``),
    ], ephemeral: true });
  }

  // # sub-cmd = id
  else if (interaction.options.getSubcommand() === 'id') {
    const warningData = await Warnings.findOne({ where: { id: interaction.options.get('id').value } });
    if (!warningData) {
      return interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('Warning ID not found.'),
      ], ephemeral: true });
    }
    if (warningData.guildID !== interaction.guildId) {
      return interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('Warning is not for this guild.'),
      ], ephemeral: true });
    }
    await Warnings.destroy({
      where: {
        id: warningData.id,
      },
    });

    interaction.reply({ embeds: [
      new MessageEmbed()
      .setTitle('Removed warning.')
      .setDescription(`**User:** <@${warningData.userID}> | **Points:** ${warningData.points}`
      + `\n**Issuer:** <@${warningData.issuerID}> | **Time:** ${(warningData.unixTime && warningData.unixTime !== 0) ? `<t:${warningData.unixTime}:f>` : 'Unknown'}`
      + `\n**Reason:** \`${warningData.reason}\``),
    ], ephemeral: true });
  }
};