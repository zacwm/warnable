import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';

const serverRouteMiddleware = (handler) => async (req, res) => {
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

    // TODO: Check if user has viewing role permissions if set in guild config.
    const permissions = member.permissions;
    if (!permissions.has('MANAGE_GUILD')) return res.status(401).json({ error: 'Unauthorized' });

    req.guild = guild;
    req.member = member;

    return handler(req, res);
  }

  return res.status(401).json({ error: 'Unauthorized' });
}

export default serverRouteMiddleware;