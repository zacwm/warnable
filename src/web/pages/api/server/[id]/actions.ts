import ServerRouteMiddleware from '../../../../middlewares/serverRoute';

async function handler(req, res) {
  const { id } = req.query;

  const PunishCoreModule = req.modules?.modules['PunishCore']?.main;
  if (!PunishCoreModule) return res.status(500).json({ error: 'PunishCore module error' });

  // Save changes to actions
  if (req.method === 'POST') {
    if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Invalid body' });

    // Save actions
    try {
      await PunishCoreModule.SetGuildActions(id, req.body);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Guild actions save error' });
    }

    return res.status(200).json({
      success: true,
    });
  }

  // Requesting for actions
  else if (req.method === 'GET') {
    const ranges = await PunishCoreModule.GetGuildRanges(id);
    if (!ranges) return res.status(500).json({ error: 'Guild actions error' });

    return res.status(200).json({
      ranges,
    });
  }
}

export default ServerRouteMiddleware(handler);