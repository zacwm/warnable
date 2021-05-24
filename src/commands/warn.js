// # warnable v3-dev | Command

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

const { MessageEmbed } = require('discord.js');
const { db } = require('../warnable');

exports.interaction = (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    db.getGuild(interaction.guildID).then(async (g) => {
      if (g) {
        const member = await interaction.member.fetch();
        if (member.roles.cache.find(role => [g.rAdmin, g.rMod].includes(role.id)) !== undefined) {
          db.addWarning(interaction.guildID,
            interaction.options[0].value.match(/\d+/g)[0],
            interaction.options[1].value,
            interaction.user.id,
            interaction.options[2].value,
          ).then((v) => {
            if (v) {
              const embedMessage = new MessageEmbed()
              .setTitle('Warning added!')
              .setDescription(`**Warned:** <@${interaction.options[0].value.match(/\d+/g)[0]}> (${interaction.options[0].value.match(/\d+/g)[0]})`
              + `\n**Points:** ${interaction.options[1].value} point${interaction.options[1].value !== 1 ? 's' : ''}`
              + `\n**Reason:** \`${interaction.options[2].value ? interaction.options[2].value : 'No reason provied.'}\``);
              interaction.reply({
                embeds: [ embedMessage ],
                ephemeral: true,
              });
            }
            else {
              const embedMessage = new MessageEmbed()
              .setDescription('The warning couldn\'t be applied.');
              interaction.reply({
                embeds: [ embedMessage ],
                ephemeral: true,
              });
            }
          }).catch(vErr => {
            console.err(vErr);
            const embedMessage = new MessageEmbed()
            .setDescription('Something failed...');
            interaction.reply({
              embeds: [ embedMessage ],
              ephemeral: true,
            });
          });
        }
        else {
          const embedMessage = new MessageEmbed()
          .setDescription('You don\'t have permission to use this command.');
          interaction.reply({
            embeds: [ embedMessage ],
            ephemeral: true,
          });
        }
      }
      else {
        const embedMessage = new MessageEmbed()
        .setDescription('This server isn\'t configured by the bot admin.');
        interaction.reply({
          embeds: [ embedMessage ],
          ephemeral: true,
        });
      }
    }).catch(gErr => {
      console.err(gErr);
      const embedMessage = new MessageEmbed()
      .setDescription('Something failed...');
      interaction.reply({
        embeds: [ embedMessage ],
        ephemeral: true,
      });
    });
  }
};