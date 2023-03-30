import ServerRouteMiddleware from '../../../../middlewares/serverRoute';

async function handler(req, res) {
  const { id } = req.query;

  const modules = req.modules?.modules;
  if (!modules) return res.status(500).json({ error: 'Modules not found' });

  const WarnCoreModule = modules['WarnCore']?.main;
  if (!WarnCoreModule) return res.status(500).json({ error: 'WarnCore module error' });
  const GuildWarnings = await WarnCoreModule.FetchGuildWarnings(id, 50, true);

  return res.status(200).json(GuildWarnings || []);
}

export default ServerRouteMiddleware(handler);