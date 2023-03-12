import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import { Events, Interaction } from 'discord.js';
import { WarnableModule } from '../moduleManager';

export default {
  module: {
    name: 'Delete',
    description: 'Deletes a warning from a user.',
    dependencies: ['WarnCore'],
    slashCommands: [
      new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Deletes a warning from a user.')
        .addIntegerOption(option => option.setName('id').setDescription('The warning ID to delete').setRequired(true))
    ],
  },

  [Events.InteractionCreate]: async (warnable: WarnableModule, interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) return interaction.reply({ content: 'This command can only be used in a guild.', ephemeral: true });

    const WarnCore = warnable.modules['WarnCore'].main;

    const id = (interaction.options.getInteger('id') ?? 0).toString();

    if (!id) return interaction.reply({ content: 'You must provide a warning ID to delete.', ephemeral: true });

    const warning = await WarnCore.FetchWarningById(id);
    if (!warning) return interaction.reply({ content: 'That warning does not exist.', ephemeral: true });

    const deleteWarning = await WarnCore.DeleteWarning(id);
    if (!deleteWarning) return interaction.reply({ content: 'There was an error deleting that warning.', ephemeral: true });

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Warning deleted - ID: ${id}`)
          .setDescription(`Deleted warning from <@${warning.userId}>`)
          .setFooter({ text: `Total points ${warning.totalPoints}` }),
      ],
      ephemeral: true,
    });
  },
};