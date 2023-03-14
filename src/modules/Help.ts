import { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } from '@discordjs/builders';
import { Interaction, Events, ButtonStyle } from 'discord.js';
import { WarnableModule } from '../moduleManager';

const contributors: string[] = [];
(async() => {
  // Fetch with inbuilt node fetch
  fetch('https://api.github.com/repos/zacimac/warnable/contributors')
    .then(res => res.json())
    .then(json => {
      // Sort the contributors by contributions
      json.sort((a: any, b: any) => b.contributions - a.contributions);

      // Parse the json and push the contributors to the contributors array
      json.forEach((user: any) => {
        if (user.type === 'Bot') return;
        contributors.push(`[${user.login}](${user.html_url})`);
      });
    });
})();

export default {
  module: {
    name: 'Help',
    description: 'Provides helpful information about the bot.',
    slashCommands: [
      new SlashCommandBuilder()
        .setName('help')
        .setDescription('Provides helpful information about the bot.'),
    ]
  },

  [Events.InteractionCreate]: (warnable: WarnableModule, interaction: Interaction) => {
    const embeds: any = {
      help: new EmbedBuilder()
        .setTitle('Warnable Help')
        .setDescription(
          'Hey! Need some help with Warnable?'
          + '\n\nNo problem! Just click on one of the buttons below to get started.'
        ),
      modules: new EmbedBuilder()
        .setTitle('Warnable Modules')
        .setDescription(
          'Here are all the modules that currently make up Warnable!'
          + `\n\n${Object.keys(warnable.modules).map(module => `\`${module}\``).join(', ')}`
          + `\n\n${Object.keys(warnable.unloadedModules).length > 0 ? `Unloaded Modules: ${Object.keys(warnable.unloadedModules).map(module => `\`${module}\``).join(', ')}\n\n` : '**All are loaded! Should be good to go!**'}`
        ),
      authors: new EmbedBuilder()
        .setTitle('Warnable Authors')
        .setDescription(
          'Here are the people who have helped make Warnable what it is today!'
          + `\n\n${contributors ? contributors.join(', ') : 'Unable to fetch contributors.'}`
          + `\n\n[♥ If you love Warnable, maybe consider sponsoring me on GitHub! ♥ ](https://github.com/sponsors/zacimac)`
        ),
    }

    const generateButtons: any = (currentPage: string) => {
      const pages = ['Help', 'Modules', 'Authors'];

      // Remove the current page from the list of pages
      const filteredPages = pages.filter(page => page.toLowerCase() !== currentPage);

      const ActionRow = new ActionRowBuilder();
      filteredPages.forEach(page => {
        ActionRow.addComponents(
          new ButtonBuilder()
            .setLabel(page)
            .setStyle(ButtonStyle.Primary)
            .setCustomId(page.toLowerCase())
        );
      });

      // Add extra buttons
      ActionRow.addComponents(
        new ButtonBuilder()
          .setLabel('GitHub')
          .setStyle(ButtonStyle.Link)
          .setURL('https://github.com/zacimac/warnable')
      )

      ActionRow.addComponents(
        new ButtonBuilder()
          .setLabel('Sponsor')
          .setStyle(ButtonStyle.Link)
          .setEmoji({ name: '💖' })
          .setURL('https://github.com/sponsors/zacimac')
      )

      return ActionRow;
    }

    // Check if the interaction is a command - if so reply with the starter help embed.
    if (interaction.isCommand()) {
      const buttons = generateButtons('help');
      interaction.reply({
        embeds: [embeds.help],
        components: [buttons],
        ephemeral: true,
      });
    }

    if (interaction.isButton()) {
      const buttons = generateButtons(interaction.customId);

      if (Object.keys(embeds).includes(interaction.customId)) {
        interaction.update({
          embeds: [embeds[interaction.customId]],
          components: [buttons],
        });
      }
    }
  },
};