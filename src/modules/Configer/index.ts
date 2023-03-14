import { Model } from 'sequelize';

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

const getEditableItemsWithValues = async (guildId: string) => {
  const values = await getAllModuleGuildConfigs(guildId);

  // This response is parsed quite a bit, as this function is primarily used for the web dashboard.
  // Structure is as follows:
  /*
    {
      category: [
        {
          name: string,
          type: string,
          value: any,
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
    const moduleData = values[moduleName];

    for (const key in module.editableItems) {
      const item = module.editableItems[key];
      const value = moduleData[key];

      if (!response[item.category]) response[item.category] = [];
      response[item.category].push({
        name: item.name,
        type: item.type,
        value,
        module: moduleName,
        key
      });
    }
  }

  return response;
};

export default {
  registerConfigurableModule,
  getAllModuleGuildConfigs,
  getEditableItemsWithValues,
  module: (moduleName: string) => {
    return ConfigurableModules[moduleName];
  }
};