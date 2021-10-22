/* eslint-disable no-case-declarations */
// # warnable v3-dev | Command
const { logs } = require('../common/logs');
const { MessageEmbed } = require('discord.js');
const punishments = require('../common/punishments');
const Punishments = require('../database/Punishments');
const moment = require('moment');

exports.meta = {
  warnable: {
    type: 'guild',
    requirements: ['admin', 'moderator'],
  },
  name: 'punish',
  description: 'List, stop or start a punishment for a member.',
  options: [
    {
      name: 'list',
      description: 'List all active punishments for the server.',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'page',
          type: 'INTEGER',
          description: 'The page of punishments to show.',
        },
      ],
    },
    {
      name: 'start',
      description: 'Start a new punishment for a member',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'user',
          type: 'STRING',
          description: 'The member to stop the punishment. Can be a @mention or ID',
          required: true,
        },
        {
          name: 'type',
          type: 'STRING',
          description: 'What type of punishment to apply.',
          required: true,
          choices: [
            {
              name: 'Ban',
              value: 'punish_ban',
            },
            {
              name: 'Kick',
              value: 'punish_kick',
            },
            {
              name: 'Mute',
              value: 'punish_mute',
            },
          ],
        },
        {
          name: 'length',
          type: 'STRING',
          description: 'The length of time to punish for | No length = Perm',
        },
      ],
    },
    {
      name: 'stop',
      description: 'Stop an active punishment for a member',
      type: 'SUB_COMMAND',
      options: [
        {
          name: 'user',
          type: 'STRING',
          description: 'The member to stop the punishment. Can be a @mention or ID',
          required: true,
        },
        {
          name: 'reason',
          type: 'STRING',
          description: 'The reason you stopped the punishment.',
        },
      ],
    },
  ],
};

exports.guildMemberAdd = (member) => {
  punishments.rejoin(member.guild.id, member.user.id);
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
  const member = await interaction.member.fetch();

  // # sub-cmd = list
  if (interaction.options.getSubcommand() === 'list') {
    if (!member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator, serverConfig.roles.viewer].includes(role.id))) {
      return interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('You don\'t have permission to use this command.'),
      ], ephemeral: true });
    }
    const p = await Punishments.findAll({ where: { guildID: interaction.guildId } });
    if (p.length < 1) {
      return interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('No active punishments running for this server.'),
      ], ephemeral: true });
    }
    p.sort((a, b) => { return parseInt(b.unixTime) - parseInt(a.unixTime); });
    const arrayChunks = Array(Math.ceil(p.length / 5)).fill().map((_, index) => index * 5).map(begin => p.slice(begin, begin + 5));
    const page = interaction.options.get('page') ? interaction.options.get('page') - 1 : 0;
    if (!(page > -1 && arrayChunks.length > page)) {
      return interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('Invalid page number.'),
      ], ephemeral: true });
    }
    interaction.reply({ embeds: [
      new MessageEmbed()
      .setTitle(`Active server punishments | Total: ${p.length}`)
      .setDescription(`${arrayChunks[page].map((punish) => `<@${punish.userID}> | ${parseInt(punish.unixFinish) > 0 ? 'Temp-' : ''}${punish.type == 0 ? 'mute' : 'ban'}\n└  Issuer: <@${punish.issuerID}> | Finish time: ${(punish.finishTime && punish.finishTime !== 0) ? `<t:${punish.finishTime}:R>` : 'Unknown'}`).join('\n')}`)
      .setFooter(arrayChunks.length > 1 ? `Viewing page ${page + 1} of ${arrayChunks.length}` : ''),
    ], ephemeral: true });
  }

  // # sub-cmd = start
  else if (interaction.options.getSubcommand() === 'start') {
    if (!member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator].includes(role.id))) {
      return interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('You don\'t have permission to use this command.'),
      ], ephemeral: true });
    }

    if (!interaction.options.get('user').value.match(/\d+/g)) {
      return interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('An invalid mention or ID was provided.'),
      ], ephemeral: true });
    }
    const user = interaction.options.get('user').value.match(/\d+/g)[0];
    let type;
    switch (interaction.options.get('type').value) {
      case 'punish_mute':
        type = 0;
        break;
      case 'punish_ban':
        type = 1;
        break;
      case 'punish_kick':
        type = 2;
        break;
    }
    const length = type !== 2 ? (
      interaction.options.get('length') ? moment().add(parseInt(interaction.options.get('length').value.match(/\d+/g)[0]),
      interaction.options.get('length').value.match(/\D/g)[0]) : undefined
    ) : undefined;
    punishments.execute(interaction.guildId, user, type, interaction.user.id, length ? moment(length).unix() : 0, `[punish] ${length ? 'temp-' : ''}${type} started by ${interaction.user.tag}. Their punishment will finish ${length ? moment().to(length) : 'NEVER.'}`)
    .then((pRes) => {
      if (!pRes) {
        return interaction.reply({ embeds: [
          new MessageEmbed()
          .setDescription('Something failed.'),
        ], ephemeral: true });
      }
      interaction.reply({ embeds: [
        new MessageEmbed()
        .setTitle('Punishment started')
        .setDescription(`**Punished:** <@${user}>`
        + `\n**Type:** ${type}`
        + `\n**Finishes:** ${length ? moment().to(length) : 'NEVER'}`),
      ], ephemeral: true });
    })
    .catch((pErr) => {
      interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription(`${pErr.reason}`),
      ], ephemeral: true });
    });
  }

  // # sub-cmd = stop
  else if (interaction.options.getSubcommand() === 'stop') {
    if (!member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator].includes(role.id))) {
      return interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('You don\'t have permission to use this command.'),
      ], ephemeral: true });
    }
    punishments.stop(
      interaction.guildId,
      interaction.options.get('user').value.match(/\d+/g)[0],
      interaction.options.get('reason') ? interaction.options.get('reason').value : 'No reason provided.',
    )
    .then(() => {
      logs.guild(interaction.guildId, 'main', {
        title: 'Punishment stopped',
        description: `The punishment for <@${interaction.options.get('user').value.match(/\d+/g)[0]}> (${interaction.options.get('user').value.match(/\d+/g)[0]}) was stopped by <@${interaction.user.id}>`
        + `\n**Reason:** \`${interaction.options.get('reason') ? interaction.options.get('reason').value : 'No reason provided.'}\``,
        color: 0x1abc9c,
      });
      interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('The punishment was stopped!'),
      ], ephemeral: true });
    })
    .catch((rErr) => {
      interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription(`An error occured trying to stop the punishment...\n\`\`\`\n${rErr.reason}\n\`\`\``),
      ], ephemeral: true });
    });
  }
};