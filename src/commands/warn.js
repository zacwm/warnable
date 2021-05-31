// # warnable v3-dev | Command

const { MessageEmbed } = require('discord.js');
const { db, logs } = require('../warnable');

exports.meta = {
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

exports.interaction = async (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    const serverConfig = process.servers[interaction.guildID];
    if (serverConfig) {
      const member = await interaction.member.fetch();
      if (member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator].includes(role.id)) !== undefined) {
        if (interaction.options[0].value.match(/\d+/g)) {
          const wGuildID = interaction.guildID;
          const wUserID = interaction.options[0].value.match(/\d+/g);
          const wPoints = parseInt(interaction.options[1].value);
          const wIssuerID = interaction.user.id;
          const wReason = interaction.options[2] ? interaction.options[2].value : 'No reason provied.';

          db.addWarning(wGuildID, wUserID, wPoints, wIssuerID, wReason)
          .then(async (v) => {
            if (v) {
              const newList = await db.listWarnings(wGuildID, wUserID);
              const descString = `**Warned:** <@${wUserID}> (${wUserID})`
              + `\n**Points:** ${wPoints} point${wPoints !== 1 ? 's' : ''} (New total: ${newList.reduce((prev, val) => prev + val.points, 0) || '?'})`
              + `\n**Reason:** \`${wReason}\``;

              logs.guild(interaction.guildID, 'main', {
                title: 'New warning',
                description: descString + `\n**Issuer:** <@${wIssuerID}>`,
                color: 0xe67e22,
              });
              interaction.reply({ embeds: [
                new MessageEmbed()
                .setTitle('Warning added!')
                .setDescription(descString)
                .setColor(0xe67e22),
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