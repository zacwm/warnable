import { Events } from 'discord.js';
import { WarnableModule } from '../../moduleManager';
import WarningModel from './models/Warning';

let warnable: WarnableModule;

const fillNames = async (warnings: any[]) => {
  // Get all unique user id's from userId and issuerId and map to object with id as key
  const uniqueUserIds: any[] = [...new Set(warnings.map((warning: any) => warning.userId).concat(warnings.map((warning: any) => warning.issuerId)))];
  const UserIdsToNames: any = {};
  
  // Fetch all users from the unique user id's with NameStorer
  const NameStorer = warnable.modules.NameStorer.main;
  
  for (const userId of uniqueUserIds) {
    const user = await NameStorer.FetchLastSeenName(userId, true);
    UserIdsToNames[userId] = user;
  }
  
  const parsedWarnings = [];
  // Fill the warnings with the user names (if userId is found then a new key of userName is added to the warning object)
  for (const warning of warnings) {
    const userName = UserIdsToNames[warning.userId];
    const issuerName = UserIdsToNames[warning.issuerId];
    
    parsedWarnings.push({
      ...warning.toJSON(),
      userName,
      issuerName,
    });
  }
  
  return parsedWarnings;
}

const FetchUserWarnings = async (userId: string, guildId?: string, fillName?: boolean, sortOldToNew?: boolean) => {
  const warnings = await WarningModel.findAll({
    where: guildId ? { userId, guildId, deleted: false } : { userId },
    order: [ ['id', sortOldToNew ? 'DESC' : 'ASC'] ],
  });

  if (fillName) {
    const filledNameWarnings = await fillNames(warnings);
    return filledNameWarnings;
  }

  return warnings;
};

const FetchGuildWarnings = async (guildId: string, limit: number, fillName?: boolean, sortOldToNew?: boolean) => {
  const warnings: any = await WarningModel.findAll({
    where: { guildId },
    limit,
    order: [ ['id', sortOldToNew ? 'ASC' : 'DESC'] ],
  });

  if (fillName) {
    const filledNameWarnings = await fillNames(warnings);
    return filledNameWarnings;
  }

  return warnings.toJSON();
};

const FetchWarningById = async (warningId: string, fillName?: boolean) => {
  const warning = await WarningModel.findByPk(warningId);

  if (!warning) {
    return null;
  }

  if (fillName) {
    const parsedWarning = await fillNames([warning]);
    return parsedWarning[0];
  }

  return warning.toJSON();
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