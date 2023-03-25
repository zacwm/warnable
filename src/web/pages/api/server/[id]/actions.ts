import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    // TODO: Do Discord User & Guild check here

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
      const actions = await PunishCoreModule.GetGuildActions(id);
      if (!actions) return res.status(500).json({ error: 'Guild actions error' });

      return res.status(200).json({
        actions,
      });
    }
  }

  res.status(401).json({ error: 'Unauthorized' });
}