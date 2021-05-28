// # warnable v3-dev | Command

const { db } = require('../warnable');
const { MessageEmbed } = require('discord.js');
const punishments = require('../common/punishments');
const moment = require('moment-timezone');

exports.meta = {
  name: 'punish',
  description: 'List, stop or start a punishment for a member.',
  options: [
    {
      name: 'list',
      description: 'List all active punishments for the server.',
      type: 'SUB_COMMAND',
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
              value: 'punish_ban',
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
      ],
    },
  ],
};

exports.interaction = async (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    console.dir(interaction);
    if (interaction.options[0].name === 'list') {
      db.listPunishments(interaction.guildID)
      .then(p => {
        if (p.length > 0) {
          const embedMessage = new MessageEmbed()
          .setDescription(`There are ${p.length} active punishments.`);
          interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
        }
        else {
          const embedMessage = new MessageEmbed()
          .setDescription('There are no active punishments for the server.');
          interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
        }
      })
      .catch(pErr => {
        console.error(pErr);
        const embedMessage = new MessageEmbed()
        .setDescription('Something failed.');
        interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
      });
    }
    else if (interaction.options[0].name === 'start') {
      if (interaction.options[0].options[0].value.match(/\d+/g)) {
        const user = interaction.options[0].options[0].value.match(/\d+/g)[0];
        const type = interaction.options[0].options[1].value.replace('punish_', '');
        const length = type !== 'kick' ? (interaction.options[0].options[2] ? moment().add(parseInt(interaction.options[0].options[2].value.match(/\d+/g)[0]), interaction.options[0].options[2].value.match(/\D/g)[0]) : undefined) : undefined;
        punishments.execute(interaction.guildID, user, type, `[punish] ${length ? 'temp-' : ''}${type} started by ${interaction.user.tag}. Their punishment will finish ${length ? moment().to(length) : 'NEVER.'}`)
        .then((pRes) => {
          if (pRes) {
            const embedMessage = new MessageEmbed()
            .setTitle('Punishment started')
            .setDescription(`**Punished:** <@${user}>`
            + `\n**Type:** ${type}`
            + `\n**Finishes:** ${length ? moment().to(length) : 'NEVER'}`);
            interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
          }
          else {
            const embedMessage = new MessageEmbed()
            .setDescription('Something failed.');
            interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
          }
        })
        .catch((pErr) => {
          console.error(pErr);
          const embedMessage = new MessageEmbed()
          .setDescription('Something failed.');
          interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
        });
      }
      else {
        const embedMessage = new MessageEmbed()
        .setDescription('An invalid mention or ID was provided.');
        interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
      }
    }
    else if (interaction.options[0].name === 'stop') {
      console.dir(interaction.options[0]);
      const embedMessage = new MessageEmbed()
      .setDescription('\\//');
      interaction.reply({ embeds: [ embedMessage ], ephemeral: true });
    }
  }
};