// # warnable v3-dev | Command

const { MessageEmbed } = require('discord.js');
const WarningsDB = require('../database/Warnings');

exports.meta = {
  warnable: {
    type: 'guild',
    requirements: ['admin', 'moderator', 'viewer'],
  },
  name: 'list',
  description: 'Displays a list of the members warnings.',
  options: [
    {
      name: 'user',
      type: 'STRING',
      description: 'The member to list. | @mention or ID',
      required: true,
    },
    {
      name: 'page',
      type: 'INTEGER',
      description: 'View another page of the members warnings.',
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
  // Check if author has permission to use command.
  const member = await interaction.member.fetch();
  if (!member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator, serverConfig.roles.viewer].includes(role.id))) {
    return interaction.reply({ embeds: [
      new MessageEmbed()
      .setDescription('You don\'t have permission to use this command.'),
    ], ephemeral: true });
  }
  // Check if command has a valid user ID to lookup.
  if (!interaction.options.get('user').value.match(/\d+/g)) {
    return interaction.reply({ embeds: [
      new MessageEmbed()
      .setDescription('An invalid mention or ID was provided.'),
    ], ephemeral: true });
  }
  // Run list warning query.
  const userID = interaction.options.get('user').value.match(/\d+/g)[0];
  const userData = await WarningsDB.findAll({ where: { userID: userID } });
  if (!userData || userData.length == 0) {
    return interaction.reply({ embeds: [
      new MessageEmbed()
      .setDescription('Member has no warnings.'),
    ], ephemeral: true });
  }
  const v = userData;
  v.sort((a, b) => { return parseInt(b.unixTime) - parseInt(a.unixTime); });
  const arrayChunks = Array(Math.ceil(v.length / 5)).fill().map((_, index) => index * 5).map(begin => v.slice(begin, begin + 5));
  const page = interaction.options.get('page') ? interaction.options.get('page').value - 1 : 0;
  if (page > -1 && arrayChunks.length > page) {
    interaction.reply({ embeds: [
      new MessageEmbed()
      .setTitle(`Warnings for ${v[0].user} | Total points: ${v.reduce((prev, val) => prev + val.points, 0)}`)
      .setDescription(`${arrayChunks[page].map((warning) => `**${warning.reason}**\n└ *ID: ${warning.id} | Points: ${warning.points}‎ | By: <@${warning.issuerID}> | Time: ${(warning.unixTime && warning.unixTime !== 0) ? `<t:${warning.unixTime}:f>` : 'Unknown'}*`).join('\n\n')}`)
      .setFooter(arrayChunks.length > 1 ? `Viewing page ${page + 1} of ${arrayChunks.length}` : ''),
    ], ephemeral: true });
  }
  else {
    interaction.reply({ embeds: [
      new MessageEmbed()
      .setDescription('Invalid page number.'),
    ], ephemeral: true });
  }
};