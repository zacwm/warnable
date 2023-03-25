import { Guild } from 'discord.js';
import { WarnableModule } from '../../ModuleManager';
import ConfigModel from './models/Config';
import ActionsModel from './models/Actions';

let warnable: WarnableModule;

export interface PunishmentAction {
  type: 'ban' | 'kick' | 'timeout' | 'role' | 'directMessage';
  values?: any[];
}

const GetGuildActions = async (guildId: string) => {
  const GuildActions = await ActionsModel.findOne({ where: { guildId } });

  if (!GuildActions?.data) return [];
  
  try {
    return JSON.parse(GuildActions.data as string);
  } catch (e) {
    return [];
  }
}

const SetGuildActions = async (guildId: string, ranges: any) => {
  if (!Array.isArray(ranges)) throw new Error('Ranges is not an array');
  // Check that each action is valid
  let NullMaxPoints = 0;
  for (const range of ranges) {
    if (!range.minPoints || !range.actions) throw new Error('Missing required properties');
    if (!range.maxPoints) NullMaxPoints++;
    for (const action of range.actions) {
      if (!['ban', 'kick', 'timeout', 'role', 'directMessage'].includes(action.type)) {
        throw new Error('Invalid action type: ' + action.type);
      }
    }
  }
  if (NullMaxPoints > 1) throw new Error('More than one null/undefined maxPoints');

  const parsed = JSON.stringify(ranges);

  // Update otherwise create
  const GuildActions = await ActionsModel.findOne({ where: { guildId } });
  if (GuildActions) {
    GuildActions.data = parsed;
    await GuildActions.save();
  } else {
    await ActionsModel.create({ guildId, data: parsed });
  }

  return true;
};

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

  GetGuildActions,
  SetGuildActions,
  ApplyPunishmentActions,
  RunPoints: async (guildId: string, userId: string, points: number) => {
    
  },
};