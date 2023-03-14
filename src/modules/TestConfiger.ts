import { EmbedBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { Interaction, Events } from 'discord.js';
import { WarnableModule } from '../moduleManager';

export default {
  module: {
    name: 'TestConfiger',
    dependencies: ["Configer"],
    slashCommands: [
      new SlashCommandBuilder()
        .setName('configer')
        .setDescription('Test configer command.'),
    ]
  },

  [Events.InteractionCreate]: async (warnable: WarnableModule, interaction: Interaction) => {
    if (!interaction.isCommand()) return;
    
    const configer = warnable.modules.Configer.main;

    /*
    const allGuildConfigData = await configer.getAllModuleGuildConfigs(interaction.guildId);
    console.dir(allGuildConfigData);
    */
    
    const LogCoreConfiger = configer.module('LogCore');

    if (LogCoreConfiger) {
      await LogCoreConfiger.set(interaction.guildId, [
        { key: 'warningsChannel', value: '456' },
        { key: 'punishmentsChannel', value: '789' },
      ]);
      return interaction.reply({ content: 'Done' });
    }
    

    interaction.reply({ content: 'Ok' });
  },
};