// # warnable v3-dev | Command

const { MessageEmbed } = require('discord.js');
const { db } = require('../warnable');

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
          db.addWarning(
            interaction.guildID,
            interaction.options[0].value.match(/\d+/g)[0],
            interaction.options[1].value,
            interaction.user.id,
            interaction.options[2].value,
          )
          .then(async (v) => {
            if (v) {
              const newList = await db.listWarnings(interaction.guildID, interaction.options[0].value.match(/\d+/g)[0]);
              interaction.reply({ embeds: [
                new MessageEmbed()
                .setTitle('Warning added!')
                .setDescription(`**Warned:** <@${interaction.options[0].value.match(/\d+/g)[0]}> (${interaction.options[0].value.match(/\d+/g)[0]})`
                + `\n**Points:** ${interaction.options[1].value} point${interaction.options[1].value !== 1 ? 's' : ''} (New total: ${newList.reduce((prev, val) => prev + val.points, 0) || '?'})`
                + `\n**Reason:** \`${interaction.options[2].value ? interaction.options[2].value : 'No reason provied.'}\``),
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