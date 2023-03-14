import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { id, warningId } = req.query;
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

    const accessToken = account.access_token;

    const guildsRequest = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Check status of request
    if (guildsRequest.status !== 200) {
      console.error('Failed to fetch guilds', guildsRequest.status, guildsRequest.statusText)
      return res.status(500).json({ error: 'Failed to parse' });
    }
    const guilds = await guildsRequest.json();

    const guildApiData = guilds.find((g) => {
      const guildSelect = g.id === id;
      const hasManageServer = g.permissions & 0x20;
      return guildSelect && hasManageServer;
    });
    if (!guildApiData) return res.status(404).json({ error: 'Server not found' });

    // TODO: Replace with proper server cache system
    const client = global.client;
    let guild;

    // Find in cache, otherwise try to fetch
    if (client.guilds.cache.has(id)) {
      guild = client.guilds.cache.get(id);
    } else {
      try {
        guild = await client.guilds.fetch(id);
      } catch (e) {
        return res.status(404).json({ error: 'Server not found' });
      }
    }

    if (!guild) return res.status(404).json({ error: 'Server not found' });

    const modules = req.modules?.modules;
    if (!modules) return res.status(500).json({ error: 'Modules not found' });

    const WarnCoreModule = modules['WarnCore']?.main;
    if (!WarnCoreModule) return res.status(500).json({ error: 'WarnCore module error' });
    const WarningData = await WarnCoreModule.FetchWarningById(warningId, true);

    if (!WarningData) return res.status(404).json({ error: 'Warning not found' });
    if (WarningData.guildId !== guild.id) return res.status(401).json({ error: 'Unauthorized' });

    return res.status(200).json(WarningData);
  }

  res.status(401).json({ error: 'Unauthorized' });
}