import { Guild } from 'discord.js';
import { WarnableModule } from '../../ModuleManager';
import ConfigModel from './models/Config';

let warnable: WarnableModule;

export interface PunishmentAction {
  type: 'kick' | 'ban' | 'mute' | 'message' | 'role';
  value?: string;
}

const ApplyPunishmentActions = async (actions: PunishmentAction[], guildId: string, userId: string) => {
  // Fetch guild
  let guild: Guild | undefined = warnable.client.guilds.cache.get(guildId);
  if (!guild) {
    guild = await warnable.client.guilds.fetch(guildId);
  }
  if (!guild) return false;

  // Fetch member
  const member = await guild.members.fetch(userId);
  if (!member) return false;

  // Apply actions
  for (const action of actions) {
    console.dir(action);
  }
};

export default {
  'WarnableReady': (warnableModule: WarnableModule) => {
    warnable = warnableModule;
    const Configer = warnable.modules['Configer'].main;

    Configer.registerConfigurableModule({
      moduleName: 'PunishCore',
      editableItems: {
        'immuneRoles': {
          category: 'Roles',
          name: 'Immune Roles',
          type: 'role',
          flags: ['multiple', 'excludeEveryone'],
        },
      },
      get: async (guildId: string) => {
        const config = await ConfigModel.findOne({ where: { guildId } });

        if (!config) {
          return {};
        }

        return config.toJSON();
      },
      set: async (guildId: string, updates: { key: string, value: any }[]) => {
        let config = await ConfigModel.findOne({ where: { guildId } });

        if (!config) {
          config = await ConfigModel.create({ guildId });
        }

        for (const update of updates) {
          config[update.key] = update.value;
        }

        await config.save();
        return config.toJSON();
      },
    });
  },

  ApplyPunishmentActions,
  RunPoints: async (guildId: string, userId: string, points: number) => {
    
  },
};