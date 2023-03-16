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

    const modules = req.modules?.modules;
    if (!modules) return res.status(500).json({ error: 'Modules not found' });

    const WarnCoreModule = modules['WarnCore']?.main;
    if (!WarnCoreModule) return res.status(500).json({ error: 'WarnCore module error' });
    const GuildWarnings = await WarnCoreModule.FetchGuildWarnings(id, 50, true);

    return res.status(200).json(GuildWarnings || []);
  }

  res.status(401).json({ error: 'Unauthorized' });
}