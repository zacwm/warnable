import { Events } from 'discord.js';
import { WarnableModule } from '../../ModuleManager';
import ConfigModel from './models/Config';
import ActionsModel from './models/Actions';
import TempActions from './models/TempActions';

let warnable: WarnableModule;
let CheckTemporaryActionsInterval: NodeJS.Timeout;

export interface PunishmentAction {
  type: 'ban' | 'kick' | 'timeout' | 'role' | 'directMessage';
  values?: any[];
}

const GetGuildRanges = async (guildId: string, ) => {
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

const CheckTemporaryActions = async () => {
  // Checks if any temporary punishments have served their time and to perform the next action
  // (i.e Temporary ban time served, so unban the user as Discord doesn't support temporary bans)
  const currentTime = Date.now() / 1000;
  const UnfinishedActions = await TempActions.findAll({ where: { finished: false } });

  const newFinishedActions = [];
  const errorWhenFinishing = [];

  for (const action of UnfinishedActions) {
    if (action.finishUnix <= currentTime) {
      const guild = await warnable.client.guilds.fetch(action.guildId);
      const member = await guild.members.fetch(action.userId);

      try {
        if (action.type === 'ban') {
          await guild.members.unban(action.userId);
        } else if (action.type === 'timeout') {
          await member.timeout(null);
        } else if (action.type === 'role') {
          const role = await guild.roles.fetch(action.value);
          if (!role) throw new Error('Role not found');
          await member.roles.remove(role);
        }

        action.finished = true;
        await action.save();

        newFinishedActions.push(action);
      } catch (e) {
        console.error(e);
        errorWhenFinishing.push(action);
      }
    }
  }

  return {
    done: newFinishedActions,
    errors: errorWhenFinishing,
  };
}

const CreateTemporaryAction = async (actionType: string, guildId: string, userId: string, duration: number, value?: string) => {
  const currentTime = Date.now();
  
  await TempActions.create({
    type: actionType,
    guildId,
    userId,
    finishUnix: Math.floor(currentTime / 1000) + duration,
    value,
    finished: false
  });
}

const ApplyPunishmentAction = async (action: PunishmentAction, guild: any, member: any, reason?: string) => {
  if (!guild) return false;
  if (!member) return false;

  try {
    if (action.type === 'ban') {
      await member.ban({ reason });
      if (action.values && action.values[0]) {
        await CreateTemporaryAction('ban', guild.id, member.id, action.values[0]);
      }
    } else if (action.type === 'kick') {
      await member.kick();
    } else if (action.type === 'timeout') {
      if (!action.values || !action.values[0]) throw new Error('Missing required values for timeout action');
      await member.timeout(action.values[0] * 1000, reason);
      if (action.values && action.values[1]) {
        await CreateTemporaryAction('timeout', guild.id, member.id, action.values[1]);
      }
    } else if (action.type === 'role') {
      if (!action.values || !action.values[0]) throw new Error('Missing required values for role action');
      const role = await guild.roles.fetch(action.values[0]);
      if (!role) throw new Error('Role not found');
      await member.roles.add(role);
      if (action.values && action.values[1]) {
        await CreateTemporaryAction('role', guild.id, member.id, action.values[1], role.id);
      }
    } else if (action.type === 'directMessage') {
      if (!action.values || !action.values[0]) throw new Error('Missing required values for directMessage action');
      const parsedMessage = action.values[0]
        .replace('{serverName}', guild.name)
        .replace('{serverId}', guild.id)
        .replace('{userName}', member.user.username)
        .replace('{userTag}', member.user.tag)
        .replace('{userId}', member.id)
        .replace('{points}', member?.points || 'N/A') // Direct message actions are not possible manually anyways, only point checks.
      await member.send(parsedMessage);
    }

    return {
      action,
      success: true,
    };
  } catch (e) {
    console.error(e);
    return {
      action,
      success: false,
      error: e,
    };
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

  [Events.ClientReady]: async () => {
    CheckTemporaryActionsInterval = setInterval(async () => {
      console.info('Checking temporary actions...');
      const { done, errors } = await CheckTemporaryActions();

      // TODO: Do guild(s) message announcement too...

      if (done.length > 0) {
        console.log(`Finished ${done.length} temporary actions`);
      }

      if (errors.length > 0) {
        console.error(`Failed to finish ${errors.length} temporary actions`);
      }
    }, 2 * 60 * 1000);
  },

  GetGuildRanges,
  SetGuildActions,
  ApplyPunishmentAction,
  RunPoints: async (guildId: string, userId: string, points: number) => {
    const ranges = await GetGuildRanges(guildId);
    if (!ranges) return false;

    const guild = await warnable.client.guilds.fetch(guildId);
    if (!guild) return false;

    const member = await guild.members.fetch(userId);
    if (!member) return false;

    let actions: PunishmentAction[] = [];
    for (const range of ranges) {
      if (points >= range.minPoints) {
        if (range.maxPoints) {
          if (points <= range.maxPoints) {
            actions = actions.concat(range.actions);
          }
        } else {
          actions = actions.concat(range.actions);
        }
      }
    }

    if (actions.length === 0) return false;

    const ActionResponses = await Promise.all(actions.map(async (action) => {
      return ApplyPunishmentAction(action, guild, {...member, points}, `Reaching ${points} points`);
    }));

    return ActionResponses;
  },
};