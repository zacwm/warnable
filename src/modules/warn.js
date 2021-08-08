// # warnable v3-dev | Command

const { MessageEmbed } = require('discord.js');
const { db, logs } = require('../warnable');
const { pointCheck } = require('../common/punishments');

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
	if (interaction.commandName === this.meta.name) {
    const serverConfig = process.servers[interaction.guildId];
    console.dir(interaction.options.get('reason'));
    if (serverConfig) {
      const member = await interaction.member.fetch();
      if (member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator].includes(role.id)) !== undefined) {
        if (interaction.options.get('user').value.match(/\d+/g)) {
          const wGuildID = interaction.guildId;
          const wUserID = interaction.options.get('user').value.match(/\d+/g)[0];
          const wPoints = parseInt(interaction.options.get('points').value);
          const wIssuerID = interaction.user.id;
          const wReason = interaction.options.get('reason') ? interaction.options.get('reason').value : 'No reason provied.';
          const wTime = (new Date(new Date().toUTCString()).getTime() / 1000).toString();

          db.addWarning(wGuildID, wUserID, wPoints, wIssuerID, wReason, wTime)
          .then(async (v) => {
            if (v) {
              if (!process.lastWarnings) process.lastWarnings = {};
              if (!process.lastWarnings[wGuildID]) process.lastWarnings[wGuildID] = [];
              process.lastWarnings[wGuildID].unshift({ user: wUserID, points: wPoints, issuer: wIssuerID, reason: wReason, time: wTime });
              if (process.lastWarnings[wGuildID].length > 50) process.lastWarnings[wGuildID].pop();

              const newList = await db.listWarnings(wGuildID, wUserID);
              const pointTotal = newList.reduce((prev, val) => prev + val.points, 0);
              const descString = `**Warned:** <@${wUserID}> (${wUserID})`
              + `\n**Points:** ${wPoints} point${wPoints !== 1 ? 's' : ''} (New total: ${pointTotal || '?'})`
              + `\n**Reason:** \`${wReason}\``;

              if (pointTotal && wPoints > 0) pointCheck(wGuildID, wUserID, pointTotal, wIssuerID);

              logs.guild(interaction.guildID, 'main', {
                title: 'New warning',
                description: descString + `\n**Issuer:** <@${wIssuerID}>`,
                color: 0xf39c12,
              });
              interaction.reply({ embeds: [
                new MessageEmbed()
                .setTitle('Warning added!')
                .setDescription(descString)
                .setColor(0xf39c12),
              ], ephemeral: true });
            }
            else {
              interaction.reply({ embeds: [
                new MessageEmbed()
                .setDescription('The warning couldn\'t be applied.'),
              ], ephemeral: true });
            }
          }).catch(vErr => {
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