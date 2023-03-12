import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { Interaction, Events } from 'discord.js';
import { WarnableModule } from '../moduleManager';

export default {
  module: {
    name: 'Hello',
    slashCommands: [
      new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Tests if the bot is online.'),
    ]
  },

  [Events.InteractionCreate]: (warnable: WarnableModule, interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('Hello :wave:')
      ],
      ephemeral: true,
    });
  },
};