import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { Interaction, ButtonStyle, Events, Component } from 'discord.js';
import { WarnableModule } from '../moduleManager';

const CreateWarnListMessageContent: any = async (warnable: WarnableModule, userId: string, guildId: string, page: number) => {
  const WarnCore = warnable.modules['WarnCore'].main;
  const NameStorer = warnable.modules['NameStorer'].main;

  const LastSeenName = await NameStorer.FetchLastSeenName(userId, true);
  const warnings = await WarnCore.FetchUserWarnings(userId, guildId);
  warnings.sort((a: any, b: any) => b.unixTimestamp - a.unixTimestamp);

  if (warnings.length === 0) {
    return {
      embeds: [new EmbedBuilder().setTitle(`Warnings for ${LastSeenName ?? userId} [Total: 0]`).setDescription('No warnings found.')],
      components: [],
    }
  }
  
  const totalWarningPoints = warnings.reduce((total: number, warning: any) => total + warning.points, 0);
  const totalPages = warnings.length > 0 ? Math.ceil(warnings.length / 5) : 1;

  const pageWarnings = warnings.slice((page - 1) * 5, page * 5);

  const parseWarning = (warning: any) => {
    const { id, points, reason, unixTimestamp, issuerId } = warning;

    let pointsAdjustmentType = '';
    if (points > 0) {
      pointsAdjustmentType = '+';
    } else if (points < 0) {
      pointsAdjustmentType = '-';
    }

    return `**${reason.replace('*', '\\*')}**`
      + `\n└ ID: ${id} • ${pointsAdjustmentType}${points} points • At: <t:${unixTimestamp}:f> • By: <@${issuerId}>`
  };

  const embed = new EmbedBuilder()
    .setTitle(`Warnings for ${LastSeenName ?? userId} [Total: ${totalWarningPoints}]`)
    .setDescription(`${pageWarnings.map(parseWarning).join('\n\n')}`)
    .setFooter({ text: `User ID: ${userId}` })
  
  const pageNavigationButtons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`list:${userId}:${guildId}:first`)
        .setLabel('◀◀')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1),
      new ButtonBuilder()
        .setCustomId(`list:${userId}:${guildId}:previous`)
        .setLabel('◀')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 1),
      new ButtonBuilder()
        .setCustomId(`list:${userId}:${guildId}:pageNumber`)
        .setLabel(`${page}/${totalPages}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId(`list:${userId}:${guildId}:next`)
        .setLabel('▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= totalPages),
      new ButtonBuilder()
        .setCustomId(`list:${userId}:${guildId}:last`)
        .setLabel('▶▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= totalPages),
    );

  return {
    embeds: [embed],
    components: [pageNavigationButtons],
  }
}

export default {
  module: {
    name: 'List',
    description: 'Lists all warnings for a user.',
    dependencies: ['WarnCore', 'NameStorer'],
    slashCommands: [
      new SlashCommandBuilder()
        .setName('list')
        .setDescription('Lists warnings for a user')
        .addUserOption(option => option.setName('user').setDescription('The user to list warnings for').setRequired(true)),
    ],
  },

  [Events.InteractionCreate]: async (warnable: WarnableModule, interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      if (!interaction.guild) return interaction.reply({ content: 'This command can only be used in a guild.', ephemeral: true });

      // get user from command
      const user = interaction.options.getUser('user');
      if (!user) return interaction.reply({ content: 'No user provided.', ephemeral: true });
  
      const WarnListMessageContent = await CreateWarnListMessageContent(warnable, user.id, interaction.guild.id, 1);
  
      interaction.reply(WarnListMessageContent);
    }

    if (interaction.isButton()) {
      if (!interaction.guild) return;
      if (!interaction.customId.startsWith('list:')) return;

      const [_, userId, guildId, action] = interaction.customId.split(':');
      // Get page number button
      const pageButton: any = interaction.message.components[0].components[2];
      if (!pageButton || pageButton.type !== 2) return;

      const currentPage = parseInt(pageButton.label.split('/')[0]);
      if (isNaN(currentPage)) return;

      let newPage = currentPage;

      switch (action) {
        case 'first':
          newPage = 1;
          break;
        case 'previous':
          newPage = currentPage - 1;
          break;
        case 'next':
          newPage = currentPage + 1;
          break;
        case 'last':
          newPage = parseInt(pageButton.label.split('/')[1]);
          break;
        default:
          return;
      }

      const WarnListMessageContent = await CreateWarnListMessageContent(warnable, userId, guildId, newPage);
      // Update message
      interaction.update(WarnListMessageContent);
    }
  },
};