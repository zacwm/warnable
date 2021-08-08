// # warnable v3-dev | Command

const { MessageEmbed } = require('discord.js');
const { db } = require('../warnable');
const moment = require('moment-timezone');

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
	if (interaction.commandName === this.meta.name) {
    const serverConfig = process.servers[interaction.guildId];
    if (serverConfig) {
      const member = await interaction.member.fetch();
      if (member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator, serverConfig.roles.viewer].includes(role.id)) !== undefined) {
        if (interaction.options.get('user').value.match(/\d+/g)) {
          db.listWarnings(
            interaction.guildId,
            interaction.options.get('user').value.match(/\d+/g)[0],
          )
          .then((v) => {
            if (v.length > 0) {
              v.sort((a, b) => { return parseInt(b.unixTime) - parseInt(a.unixTime); });
              const arrayChunks = Array(Math.ceil(v.length / 5)).fill().map((_, index) => index * 5).map(begin => v.slice(begin, begin + 5));
              const page = interaction.options.get('page') ? interaction.options.get('page').value - 1 : 0;
              if (page > -1 && arrayChunks.length > page) {
                interaction.reply({ embeds: [
                  new MessageEmbed()
                  .setTitle(`Warnings for ${v[0].user} | Total points: ${v.reduce((prev, val) => prev + val.points, 0)}`)
                  .setDescription(`${arrayChunks[page].map((warning, index) => `**${(page * 5) + (index + 1)}) ${warning.reason}**\n└  ‎Points: ${warning.points}‎ | By: <@${warning.issuer}> | Time: ${(warning.unixTime && warning.unixTime !== 0) ? moment.unix(warning.unixTime).utc().tz(serverConfig.timezone || 'UTC').format('MMMM Do YYYY, h:mm a') : 'Unknown'}`).join('\n\n')}`)
                  .setFooter(arrayChunks.length > 1 ? `Viewing page ${page + 1} of ${arrayChunks.length}` : ''),
                ], ephemeral: true });
              }
              else {
                interaction.reply({ embeds: [
                  new MessageEmbed()
                  .setDescription('Invalid page number.'),
                ], ephemeral: true });
              }
            }
            else {
              interaction.reply({ embeds: [
                new MessageEmbed()
                .setDescription('No warnings to show for this member!'),
              ], ephemeral: true });
            }
          }).catch((vErr) => {
            console.error(vErr);
            const embedMessage = new MessageEmbed()
            .setDescription('Something failed...');
            interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
          });
        }
        else {
          const embedMessage = new MessageEmbed()
          .setDescription('An invalid mention or ID was provided.');
          interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
        }
      }
      else {
        interaction.reply({ embeds: [
          new MessageEmbed()
          .setDescription('You don\'t have permission to use this command.'),
        ], ephemeral: true });
      }
    }
    else {
      const embedMessage = new MessageEmbed()
      .setDescription('This server isn\'t configured by the bot admin.');
      interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
    }
  }
};