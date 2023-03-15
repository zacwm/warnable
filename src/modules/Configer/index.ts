interface ConfigurableModuleValue {
  category: string;
  name: string;
  type: string;
}

interface ConfigurableModule {
  editableItems: Record<string, ConfigurableModuleValue>;
  get: (guildId: string) => Promise<Record<string, any>>;
  set: (guildId: string, updates: { key: string, newValue: any }[]) => Promise<void>;
}

const ConfigurableModules: Record<string, ConfigurableModule> = {};

const registerConfigurableModule = ({ moduleName, editableItems,  get, set }: any) => {
  ConfigurableModules[moduleName] = { editableItems, get, set };
};

const getAllModuleGuildConfigs = async (guildId: string) => {
  const response: any = {};
  
  for (const moduleName in ConfigurableModules) {
    const module = ConfigurableModules[moduleName];
    const moduleData = await module.get(guildId);

    response[moduleName] = moduleData;
  }

  return response;
};

const getEditableItems = async () => {
  // This response is parsed quite a bit, as this function is primarily used for the web dashboard.
  // Structure is as follows:
  /*
    {
      category: [
        {
          name: string,
          type: string,
          module: string,
          key: string
        }
      ],
      ...
    }
  */
  const response: any = {};
  
  for (const moduleName in ConfigurableModules) {
    const module = ConfigurableModules[moduleName];

    for (const key in module.editableItems) {
      const item = module.editableItems[key];

      if (!response[item.category]) response[item.category] = [];
      response[item.category].push({
        name: item.name,
        type: item.type,
        module: moduleName,
        key
      });
    }
  }

  return response;
};

const updateMultipleConfigs = async (guildId: string, updates: { module: string, key: string, newValue: any }[]) => {
  const moduleUpdates: any = {};

  for (const update of updates) {
    if (!moduleUpdates[update.module]) moduleUpdates[update.module] = [];
    moduleUpdates[update.module].push({
      key: update.key,
      newValue: update.newValue
    });
  }

  for (const moduleName in moduleUpdates) {
    const module = ConfigurableModules[moduleName];
    await module.set(guildId, moduleUpdates[moduleName]);
  }

  return true;
};

export default {
  registerConfigurableModule,
  getAllModuleGuildConfigs,
  getEditableItems,
  updateMultipleConfigs,
  module: (moduleName: string) => {
    return ConfigurableModules[moduleName];
  }
};