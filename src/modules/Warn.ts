import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import { Events, Interaction } from 'discord.js';
import { WarnableModule } from '../moduleManager';

export default {
  module: {
    name: 'Warn',
    description: 'Applies a warning to a user.',
    dependencies: ['WarnCore'],
    slashCommands: [
      new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Creates a new warning for a user.')
        .addStringOption(option => option.setName('user').setDescription('The user to apply the warning to').setRequired(true))
        .addIntegerOption(option => option.setName('points').setDescription('The amount of points to apply to the user').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('The reason for the warning').setRequired(false)),
    ],
  },

  [Events.InteractionCreate]: async (warnable: WarnableModule, interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.guild) return interaction.reply({ content: 'This command can only be used in a guild.', ephemeral: true });

    const WarnCore = warnable.modules['WarnCore'].main;

    const user = interaction.options.getString('user');
    const points = interaction.options.getInteger('points') ?? 0;
    const reason = interaction.options.getString('reason') ?? '*No reason provided.*';

    if (!user) return interaction.reply({ content: 'You must provide a user to warn.', ephemeral: true });
    const userId = user.replace(/[<@!>]/g, '');

    const warning = await WarnCore.CreateNewWarning(interaction.guildId, userId, interaction.user.id, points, reason);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Warning created - ID: ${warning.id}`)
          .setDescription(`Applied ${points} points to <@${userId}> for \`${reason}\``)
          .setFooter({ text: `Total points ${warning.totalPoints}` })
          .setTimestamp(warning.unixTimestamp * 1000)
      ]
    })
  },
};