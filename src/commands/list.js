// # warnable v3-dev | Command

exports.meta = {
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

const { MessageEmbed } = require('discord.js');
const { db } = require('../warnable');

exports.interaction = async (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    db.getGuild(interaction.guildID).then(async (g) => {
      if (g) {
        const member = await interaction.member.fetch();
        if (member.roles.cache.find(role => [g.rAdmin, g.rMod, g.rViewer].includes(role.id)) !== undefined) {
          db.listWarnings(interaction.guildID,
            interaction.options[0].value.match(/\d+/g)[0],
          ).then((v) => {
            v.sort((a, b) => { return parseInt(b.unixTime) - parseInt(a.unixTime); });
            const arrayChunks = Array(Math.ceil(v.length / 5)).fill().map((_, index) => index * 5).map(begin => v.slice(begin, begin + 5));
            const page = interaction.options[1] ? parseInt(interaction.options[1].value) : 0;
            if (page > -1 && arrayChunks.length > page) {
              const embedMessage = new MessageEmbed()
              .setTitle(`Warnings for ${v[0].user} | Total points: ${v.reduce((prev, val) => prev + val.points, 0)}`)
              .setDescription(`${arrayChunks[page].map((warning, index) => `**${index + 1}) ${warning.reason}**\n└  ‎Points: ${warning.points}‎ | By: <@${warning.issuer}> | Time: ${(warning.unixTime) ? warning.unixTime : 'Unknown'}`).join('\n\n')}`);
              interaction.reply({
                embeds: [ embedMessage ],
                ephemeral: true,
              });
            }
            else {
              const embedMessage = new MessageEmbed()
              .setDescription('Invalid page number.');
              interaction.reply({
                embeds: [ embedMessage ],
                ephemeral: true,
              });
            }
          }).catch((vErr) => {
            console.error(vErr);
            interaction.reply('Something failed!', { ephemeral: true });
          });
        }
        else {
          interaction.reply('You don\'t have permission to use this command.', { ephemeral: true });
        }
      }
      else {
        interaction.reply('This server isn\'t configured by the bot admin.', { ephemeral: true });
      }
    }).catch((gErr) => {
      console.error(gErr);
      interaction.reply('Something failed!', { ephemeral: true });
    });
  }
};