import ServerRouteMiddleware from '../../../../../middlewares/serverRoute';

async function handler(req, res) {
  const { warningId } = req.query;

    const modules = req.modules?.modules;
    if (!modules) return res.status(500).json({ error: 'Modules not found' });

    const WarnCoreModule = modules['WarnCore']?.main;
    if (!WarnCoreModule) return res.status(500).json({ error: 'WarnCore module error' });
    const WarningData = await WarnCoreModule.FetchWarningById(warningId, true);

    if (!WarningData) return res.status(404).json({ error: 'Warning not found' });
    if (WarningData.guildId !== req.guild.id) return res.status(401).json({ error: 'Unauthorized' });

    return res.status(200).json(WarningData);
}

export default ServerRouteMiddleware(handler);