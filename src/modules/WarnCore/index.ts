import { Events } from 'discord.js';
import { WarnableModule } from '../../moduleManager';
import WarningModel from './models/Warning';

let warnable: WarnableModule;

const FetchUserWarnings = async (userId: string, guildId?: string) => {
  const warnings = await WarningModel.findAll({
    where: guildId ? { userId, guildId, deleted: false } : { userId },
  });

  return warnings;
};

const FetchGuildWarnings = async (guildId: string, limit: number) => {
  const warnings = await WarningModel.findAll({
    where: { guildId },
    limit,
  });

  return warnings;
};

const FetchWarningById = async (warningId: string) => {
  const warning = await WarningModel.findByPk(warningId);

  return warning;
};

const CreateNewWarning = async (guildId: string, userId: string, issuerId: string, points: number, reason: string, unixTimestamp?: number) => {
  const warning = await WarningModel.create({
    guildId,
    userId,
    issuerId,
    points,
    reason,
    unixTimestamp: unixTimestamp || Math.floor(Date.now() / 1000),
  });

  const totalPoints = await WarningModel.sum('points', { where: { userId, guildId } });

  return {
    ...warning.toJSON(),
    totalPoints,
  }
};

const DeleteWarning = async (warningId: string, deletedBy: string) => {
  const warning = await WarningModel.findByPk(warningId);

  if (!warning) {
    return null;
  }

  // Update the warning as deleted (Removes main warning data and adds deleted data)
  warning.reason = 'Deleted';
  warning.points = 0;
  warning.deleted = true;
  warning.deletedBy = deletedBy;
  warning.deletedAt = Math.floor(Date.now() / 1000);
  await warning.save();

  return warning;
};

export default {
  [Events.ClientReady]: async (warnableModule: WarnableModule) => {
    warnable = warnableModule;
  },

  FetchUserWarnings,
  FetchGuildWarnings,
  FetchWarningById,
  CreateNewWarning,
  DeleteWarning,
};