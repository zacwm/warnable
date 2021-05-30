const { MessageEmbed } = require('discord.js');
const { db } = require('../warnable');

exports.meta = {
  name: 'unwarn',
  description: 'Removes a warning from a member.',
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
};

exports.interaction = async (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    const serverConfig = process.servers[interaction.guildID];
    if (serverConfig) {
      const member = await interaction.member.fetch();
      if (member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator].includes(role.id)) !== undefined) {
        if (interaction.options[0].value.match(/\d+/g)) {
          db.listWarnings(
            interaction.guildID,
            interaction.options[0].value.match(/\d+/g)[0],
          )
          .then((v) => {
            v.sort((a, b) => { return parseInt(b.unixTime) - parseInt(a.unixTime); });
            const warningNum = parseInt(interaction.options[1].value);
            if (warningNum > 0 && v.length >= warningNum) {
              /*
               * Heads up to whoever is looking at this :----------)
               * I know.... It could've been done by giving each warning it's own UID,
               * but using the sort and unixTime is close enough imo lol, less work for me, the db, and the user kinda...
               */
              db.removeWarning(
                interaction.guildID,
                interaction.options[0].value.match(/\d+/g)[0],
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