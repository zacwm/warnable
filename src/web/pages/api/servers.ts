import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    // Fetch the accounts from the database
    const sequelizeDatabase = global.database;
    const accountsModel = await sequelizeDatabase.models.account;
    const account = await accountsModel.findOne({
      where: {
        userId: session.user.id,
      }
    });

    if (!account) return res.status(401).json({ error: 'Unauthorized' });

    const accessToken = account.access_token;
    const servers = [];

    const userGuildsRequest = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const userGuildsResponse: any = await userGuildsRequest.json();
    const filtered = (userGuildsResponse || []).filter((server) => server.owner || server.permissions & 32);

    const DiscordClient = global.client;

    // Get list of server id's the bot is in
    const botServers = await DiscordClient.guilds.fetch();
    const botServerIds = (botServers || []).map((server) => server.id);

    for (const server of filtered) {
      let inServer = false;
      
      // Check if server is in bot servers
      if (botServerIds.includes(server.id)) inServer = true;

      servers.push({
        id: server.id,
        name: server.name,
        icon: server.icon,
        inServer: inServer,
      });
    }

    // Sort inServer to top
    servers.sort((a, b) => {
      if (a.inServer && !b.inServer) return -1;
      if (!a.inServer && b.inServer) return 1;
      return 0;
    });

    return res.status(200).json({
      servers: servers,
      clientId: DiscordClient.user.id,
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}