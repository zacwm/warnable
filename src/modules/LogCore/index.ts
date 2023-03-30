import { WarnableModule } from '../../ModuleManager';
import ConfigModel from './models/Config';

export default {
  'WarnableReady': (warnable: WarnableModule) => {
    const Configer = warnable.modules['Configer'].main;

    Configer.registerConfigurableModule({
      moduleName: 'LogCore',
      editableItems: {
        'warningsChannel': {
          category: 'Log Channels',
          name: 'Warnings Channel',
          type: 'textChannel',
        },
        'punishmentsChannel': {
          category: 'Log Channels',
          name: 'Punishments Channel',
          type: 'textChannel',
        },
        'messagesChannel': {
          category: 'Log Channels',
          name: 'Messages Channel',
          type: 'textChannel',
        },
        'usersChannel': {
          category: 'Log Channels',
          name: 'Users Channel',
          type: 'textChannel',
        },
      },
      get: async (guildId: string) => {
        const config = await ConfigModel.findOne({ where: { guildId } });

        if (!config) {
          return {};
        }

        return config.toJSON();
      },
      set: async (guildId: string, updates: { key: string, newValue: any }[]) => {
        let config = await ConfigModel.findOne({ where: { guildId } });

        if (!config) {
          config = await ConfigModel.create({ guildId });
        }

        for (const update of updates) {
          config[update.key] = update.newValue;
        }

        console.dir('saving config');
        await config.save();
        return config.toJSON();
      },
    });
  },
};