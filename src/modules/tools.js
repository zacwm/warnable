// # warnable v3-dev | Command

const { MessageEmbed } = require('discord.js');
const { client } = require('../warnable');
const moment = require('moment-timezone');

exports.meta = {
  name: 'tools',
  description: 'Some tools to assist with moderation',
  options: [
    {
      name: 'prune',
      description: 'List all active punishments for the server.',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'amount',
          type: 'INTEGER',
          description: 'The number of messages to delete | NOTE > Limit is 2 weeks or newer.',
          required: true,
        },
      ],
    },
    {
      name: 'member',
      description: 'Displays information about a member.',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'member',
          type: 'STRING',
          description: 'The users @ or ID to display information about.',
          required: true,
        },
      ],
    },
  ],
};

exports.interaction = async function toolsModule(interaction) {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    const serverConfig = process.servers[interaction.guildID];
    if (serverConfig) {
      const member = await interaction.member.fetch();
      // # Prune
      if (interaction.options.has('prune')) {
        if (member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator].includes(role.id)) !== undefined) {
          client.channels.fetch(interaction.channelID)
          .then((c) => {
            const pruneAmount = parseInt(interaction.options.get('prune').options.get('amount').value);
            if (pruneAmount > 0 && pruneAmount <= 100) {
              c.bulkDelete(pruneAmount, true)
              .then((m) => {
                interaction.reply({ embeds: [
                  new MessageEmbed()
                  .setDescription(`**Done!**\nDeleted **${m.size}** message${m.size > 1 ? 's' : ''}.`)
                  .setColor(0x2ecc71),
                ], ephemeral: true });
              });
            }
            else {
              interaction.reply({ embeds: [
                new MessageEmbed()
                .setDescription('Invalid amount. Can only delete 1 - 100')
                .setColor(0x95a5a6),
              ], ephemeral: true });
            }
          })
          .catch((cErr) => {
            console.error(cErr);
            interaction.reply({ embeds: [
              new MessageEmbed()
              .setDescription('Something failed when trying to bulk delete...')
              .setColor(0x95a5a6),
            ], ephemeral: true });
          });
        }
        else {
          interaction.reply({ embeds: [
            new MessageEmbed()
            .setDescription('You don\'t have permission to use this command.')
            .setColor(0x95a5a6),
          ], ephemeral: true });
        }
      }
      // # Member
      if (interaction.options.has('member')) {
        if (member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator, serverConfig.roles.viewer].includes(role.id)) !== undefined) {
          client.guilds.fetch(interaction.guildID)
          .then((g) => {
            g.members.fetch(interaction.options.get('member').options.get('member').value.match(/\d+/g))
            .then((m) => {
              console.dir(m);
              interaction.reply({ embeds: [
                new MessageEmbed()
                .setDescription('**Member information**')
                .addField('Name', `\`${m.user.username}#${m.user.discriminator}\``, true)
                .addField('User ID', `\`${m.user.id}\``, true)
                .addField('Nickname', m.nickname ? `\`${m.nickname}\`` : '**none**', true)
                .addField('Joined At', `\`${moment(m.joinedAt).format()}\``, true)
                .setThumbnail(m.user.avatarURL({ dynamic: true }))
                .setColor(0x2ecc71),
              ], ephemeral: true });
            })
            .catch((mErr) => {
              console.dir(mErr);
              interaction.reply({ embeds: [
                new MessageEmbed()
                .setDescription('Failed to lookup member. Check if their ID is correct?')
                .setColor(0x95a5a6),
              ], ephemeral: true });
            });
          })
          .catch(() => {
            interaction.reply({ embeds: [
              new MessageEmbed()
              .setDescription('Something failed looking up server.')
              .setColor(0x95a5a6),
            ], ephemeral: true });
          });
        }
        else {
          interaction.reply({ embeds: [
            new MessageEmbed()
            .setDescription('You don\'t have permission to use this command.')
            .setColor(0x95a5a6),
          ], ephemeral: true });
        }
      }
    }
    else {
      interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('This server isn\'t configured by the bot admin.')
        .setColor(0x95a5a6),
      ], ephemeral: true });
    }
  }
};