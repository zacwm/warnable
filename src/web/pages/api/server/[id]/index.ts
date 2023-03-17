import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    const sequelizeDatabase = global.database;
    const accountsModel = await sequelizeDatabase.models.account;
    const account = await accountsModel.findOne({
      where: {
        userId: session.user.id,
      }
    });

    if (!account) return res.status(401).json({ error: 'Unauthorized' });
    const discordUserId = account.providerAccountId;

    // Check with the guild that the user has manage server or above permissions
    const client = global.client;
    const guild = await client.guilds.fetch(id);
    if (!guild) return res.status(404).json({ error: 'Server not found' });

    const member = await guild.members.fetch(discordUserId);
    if (!member) return res.status(401).json({ error: 'Unauthorized' });

    const permissions = member.permissions;
    if (!permissions.has('MANAGE_GUILD')) return res.status(401).json({ error: 'Unauthorized' });
    
    // Load the guild config
    const modules = req.modules?.modules;
    if (!modules) return res.status(500).json({ error: 'Modules not found' });

    const ConfigerModule = modules['Configer']?.main;
    if (!ConfigerModule) return res.status(500).json({ error: 'Configer module error' });
    const GuildConfig = ConfigerModule.getAllModuleGuildConfigs(id);

    const channels = await guild.channels.fetch();
    const roles = await guild.roles.fetch();

    const parseTypeNumToString = (type: number) => {
      switch (type) {
        case 0: return 'textChannel';
        case 2: return 'voiceChannel';
        case 4: return 'category';
        default: return 'unknown';
      }
    }

    const guildData = {
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ dynamic: true }),
      config: GuildConfig,
      channels: channels.map((c) => ({
        id: c.id,
        name: c.name,
        type: parseTypeNumToString(c.type),
      })),
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        hex: r.hexColor,
        hoist: r.hoist,
        position: r.position,
        permissions: r.permissions,
      })).sort((a, b) => b.position - a.position),
    };

    return res.status(200).json(guildData);
  }

  res.status(401).json({ error: 'Unauthorized' });
}