import { Events, GuildMember, Message } from 'discord.js';
import { WarnableModule } from '../../moduleManager';
import NamesModel from './models/Names';

let warnable: WarnableModule;

const CheckName = async (userId: string, username: string, discriminator: string) => {
  // Check if the user has a name in the database
  const name = await NamesModel.findOne({
    where: {
      userId,
      username,
      discriminator,
    },
  });

  if (!name) {
    // If not, create a new name
    await NamesModel.create({
      userId,
      username,
      discriminator,
      firstSeenUnix: Math.floor(Date.now() / 1000),
      lastSeenUnix: Math.floor(Date.now() / 1000),
    });
  } else {
    // If so, update the last seen unix
    await NamesModel.update({
      lastSeenUnix: Math.floor(Date.now() / 1000),
    }, {
      where: {
        userId,
        username,
        discriminator,
      },
    });
  }
};

const FetchAllNames = async (userId: string) => {
  const names = await NamesModel.findAll({
    where: {
      userId,
    },
  });

  return names;
}

const FetchLastSeenName = async (userId: string, includeDiscriminator?: boolean) => {
  const name = await NamesModel.findOne({
    where: {
      userId,
    },
    order: [
      ['lastSeenUnix', 'DESC'],
    ],
  });

  if (!name) {
    return null;
  }

  return `${name.username}${includeDiscriminator ? `#${name.discriminator}` : ''}`;
}

export default {
  [Events.ClientReady]: async (warnableModule: WarnableModule) => {
    warnable = warnableModule;
  },

  [Events.MessageCreate]: async (warnable: WarnableModule, message: Message) => {
    if (message.author.bot) return;
    await CheckName(message.author.id, message.author.username, message.author.discriminator);
  },

  [Events.GuildMemberAvailable]: async (warnable: WarnableModule, member: GuildMember) => {
    if (member.user.bot) return;
    await CheckName(member.id, member.user.username, member.user.discriminator);
  },

  [Events.GuildMemberAdd]: async (warnable: WarnableModule, member: GuildMember) => {
    if (member.user.bot) return;
    await CheckName(member.id, member.user.username, member.user.discriminator);
  },

  [Events.GuildMemberRemove]: async (warnable: WarnableModule, member: GuildMember) => {
    if (member.user.bot) return;
    await CheckName(member.id, member.user.username, member.user.discriminator);
  },

  [Events.GuildMemberUpdate]: async (warnable: WarnableModule, oldMember: GuildMember, newMember: GuildMember) => {
    if (oldMember.user.bot) return;
    await CheckName(newMember.id, newMember.user.username, newMember.user.discriminator);
  },

  FetchAllNames,
  FetchLastSeenName,
};