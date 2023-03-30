import ServerRouteMiddleware from '../../../../middlewares/serverRoute';

async function handler(req, res) {
  const { id } = req.query;
    
  const ConfigerModule = req.modules?.modules['Configer']?.main;
  if (!ConfigerModule) return res.status(500).json({ error: 'Configer module error' });

  const configItems = await ConfigerModule.getEditableItems();
  if (!configItems) return res.status(500).json({ error: 'Guild config error' });

  // Making changes to config.
  if (req.method === 'POST') {
    // Example body:
    // {
    //   "Log Channels": { warningsChannel: '123456789012345678' },
    //   "Roles": {},
    // }

    // Parse the items into an array of { module, key, newValue }
    let updates = [];
    for (const category in req.body) {
      for (const item in req.body[category]) {
        const value = req.body[category][item];
        const module = configItems[category].find(i => i.key === item).module;
        updates.push({ module, key: item, newValue: value });
      }
    }
  
    console.dir(updates, { depth: null });

    const updateResponse = await ConfigerModule.updateMultipleConfigs(id, updates);

    if (!updateResponse) return res.status(500).json({ error: 'Guild config error' });

    return res.status(200).json({ success: true });
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

export default ServerRouteMiddleware(handler);