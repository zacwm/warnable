import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (session) {
    // TODO: Do Discord User & Guild check here

    const ConfigerModule = req.modules?.modules['Configer']?.main;
    if (!ConfigerModule) return res.status(500).json({ error: 'Configer module error' });

    const configItems = await ConfigerModule.getEditableItems();
    if (!configItems) return res.status(500).json({ error: 'Guild config error' });

    // Making changes to config.
    if (req.method === 'POST') {
      console.dir('config post');
    }
    // Requesting for config with values.
    else if (req.method === 'GET') {
      const configValues = await ConfigerModule.getAllModuleGuildConfigs(id);
      if (!configValues) return res.status(500).json({ error: 'Guild config error' });
  
      // Parse values based on configItems
      let valuesParsed = {};
      for (const category in configItems) {
        valuesParsed[category] = {};
        for (const item of configItems[category]) {
          valuesParsed[category][item.key] = configValues[item.module][item.key];
        }
      }
  
      return res.status(200).json({
        configItems,
        configValues: valuesParsed,
      });
    }

  }

  res.status(401).json({ error: 'Unauthorized' });
}