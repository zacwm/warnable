import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    // TODO: Do Discord User & Guild check here

    const ConfigerModule = req.modules?.modules['Configer']?.main;
    if (!ConfigerModule) return res.status(500).json({ error: 'Configer module error' });

    const guildConfig = await ConfigerModule.getEditableItemsWithValues(id);
    if (!guildConfig) return res.status(500).json({ error: 'Guild config error' });

    return res.status(200).json(guildConfig);
  }

  res.status(401).json({ error: 'Unauthorized' });
}