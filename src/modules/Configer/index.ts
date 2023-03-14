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

export default {
  registerConfigurableModule,
  getAllModuleGuildConfigs,
  module: (moduleName: string) => {
    return ConfigurableModules[moduleName];
  }
};