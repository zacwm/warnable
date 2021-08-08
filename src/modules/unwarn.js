const { MessageEmbed } = require('discord.js');
const { db } = require('../warnable');
const moment = require('moment-timezone');

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
      name: 'member',
      description: 'Removes a warning from a member by warning position from list.',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'user',
          type: 'STRING',
          description: 'The user to warn | @mention or ID',
          required: true,
        },
        {
          name: 'number',
          type: 'INTEGER',
          description: 'The number warning that is shown in the list to remove.',
          required: true,
        },
      ],
    },
  ],
};

exports.interactionCreate = async (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    const serverConfig = process.servers[interaction.guildId];
    if (serverConfig) {
      const member = await interaction.member.fetch();
      if (member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator].includes(role.id)) !== undefined) {

        // # sub-cmd = last
        if (interaction.options.getSubcommand() === 'last') {
          if (!process.lastWarnings) process.lastWarnings = {};
          if (!process.lastWarnings[interaction.guildId]) process.lastWarnings[interaction.guildId] = [];
          if (process.lastWarnings[interaction.guildId].length > 0) {
            const removedWarning = process.lastWarnings[interaction.guildId].shift();
            if (removedWarning) {
              db.removeWarning(interaction.guildId, removedWarning.user, removedWarning.time)
              .then(() => {
                interaction.reply({ embeds: [
                  new MessageEmbed()
                  .setTitle('Removed last warning.')
                  .setDescription(`**User:** <@${removedWarning.user}> | **Points:** ${removedWarning.points}`
                  + `\n**Issuer:** <@${removedWarning.issuer}> | **Time:** ${(removedWarning.time && removedWarning.time !== 0) ? moment.unix(removedWarning.time).utc().tz(serverConfig.timezone || 'UTC').format('MMMM Do YYYY, h:mm a') : 'Unknown'}`
                  + `\n**Reason:** \`${removedWarning.reason}\``),
                ], ephemeral: true });
              })
              .catch((rErr) => {
                console.error(rErr);
                interaction.reply({ embeds: [
                  new MessageEmbed()
                  .setDescription('Failed to remove the last warning...'),
                ], ephemeral: true });
              });
            }
          }
          else {
            interaction.reply({ embeds: [
              new MessageEmbed()
              .setDescription('No more recent warnings.'),
            ], ephemeral: true });
          }
        }

        // # sub-cmd = member
        else if (interaction.options.getSubcommand() === 'member') {
          if (interaction.options.get('user').value.match(/\d+/g)) {
            db.listWarnings(
              interaction.guildId,
              interaction.options.get('user').value.match(/\d+/g)[0],
            )
            .then((v) => {
              v.sort((a, b) => { return parseInt(b.unixTime) - parseInt(a.unixTime); });
              const warningNum = interaction.options.get('number').value;
              if (warningNum > 0 && v.length >= warningNum) {
                /*
                 * Heads up to whoever is looking at this :----------)
                 * I know.... It could've been done by giving each warning it's own UID,
                 * but using the sort and unixTime is close enough imo lol, less work for me, the db, and the user kinda...
                 */
                db.removeWarning(
                  interaction.guildId,
                  interaction.options.get('user').value.match(/\d+/g)[0],
                  v[warningNum - 1].unixTime,
                )
                .then(() => {
                  interaction.reply({ embeds: [
                    new MessageEmbed()
                    .setDescription('Warning deleted!'),
                  ], ephemeral: true });
                })
                .catch((qErr) => {
                  console.error(qErr);
                  interaction.reply({ embeds: [
                    new MessageEmbed()
                    .setDescription('Something failed.'),
                  ], ephemeral: true });
                });
              }
              else {
                interaction.reply({ embeds: [
                  new MessageEmbed()
                  .setDescription('No warning is at that position.'),
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
      }
      else {
        const embedMessage = new MessageEmbed()
        .setDescription('You don\'t have permission to use this command.');
        interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
      }
    }
    else {
      const embedMessage = new MessageEmbed()
      .setDescription('This server isn\'t configured by the bot admin.');
      interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
    }
  }
};