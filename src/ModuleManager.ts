import { Client as DiscordClient, Events, REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

interface ModuleManagerInterface {
  load(): Promise<void>
  registerSlashCommands(): Promise<void>
  createEventHandlers(): void
  onEvent(event: string, ...args: any[]): void
}

interface ModuleItem {
  path: string;
  main: any;
  name: string;
  version?: string;
  description?: string;
  library?: boolean;
  dependencies?: string[];
  events?: string[];
  slashCommands?: object[];
  flags?: string[];
}

export interface WarnableModule {
  client: DiscordClient;
  modules: Record<string, ModuleItem>;
  unloadedModules: string[];
}

class ModuleManager implements ModuleManagerInterface {
  client: DiscordClient;
  modules: Record<string, ModuleItem>;
  unloadedModules: string[];

  constructor(client: DiscordClient) {
    this.client = client;
    this.modules = {};
    this.unloadedModules = [];
  }

  async load(): Promise<void> {
    // Loops through modules folder and loads each module.
    // Requirements to load:
    // - Must be a folder that contains a `module.json` file
    // - Must be a folder that contains a `index.ts` file that exports a module object.
    // - Must be a *.ts file that exports a module object.

    return new Promise((resolve, reject) => {
      const LoadedModules: string[] = [];
      const FailedModules: string[] = [];

      const readModule = (modulePath: string, fileData: any, isJson?: boolean) => {
        let name: string | undefined;
        let module: any;

        if (isJson) {
          if (!fileData.main) {
            throw new Error(`Module '${modulePath}' does not contain a 'main' property.`);
          }
          name = fileData.name;
          module = {
            ...fileData,
            path: modulePath,
            main: require(path.join(modulePath, `../${fileData.main}`)).default,
          }
        } else {
          fileData = fileData.default;
          if (!fileData.module) {
            throw new Error(`Module '${modulePath}' does not export a 'module' object.`);
          }
          name = fileData.module.name;
          module = {
            ...fileData.module,
            path: modulePath,
            main: fileData,
          };
        }

        if (!name) {
          throw new Error(`Module '${modulePath}' does not contain a 'name' property.`);
        }

        // Check for duplicate module names
        if (this.modules[name]) {
          throw new Error(`Duplicate module name '${name}' found.`);
        }

        // If module has events, check that all are valid Discord events
        if (module.main) {
          const parsedEvents: string[] = [];
          Object.keys(module.main).forEach((event) => {
            if (!Object.values(Events).includes(event as Events)) return;
            if (typeof module.main[event] !== 'function') {
              throw new Error(`Module '${name}' has an invalid event handler for '${event}'`);
            }
            parsedEvents.push(event);
          });
          module = {
            ...module,
            events: parsedEvents,
          };
        }

        this.modules[name] = module;
      }


      // Parse modules folder...
      fs.readdir(path.join(__dirname, './modules'), (err, moduleDirFiles: string[]) => {
        moduleDirFiles.forEach((file) => {
          const isFolder = fs.statSync(path.join(__dirname, './modules', file)).isDirectory();
          const isTsFile = file.endsWith('.ts');

          let filePath;
          let isJson;

          if (isFolder) {
            if (fs.existsSync(path.join(__dirname, './modules', file, 'module.json'))) {
              filePath = path.join(__dirname, './modules', file, 'module.json');
              isJson = true;
            } else if (fs.existsSync(path.join(__dirname, './modules', file, 'index.ts'))) {
              filePath = path.join(__dirname, './modules', file, 'index.ts');
            }
          } else if (isTsFile) {
            filePath = path.join(__dirname, './modules', file);
          }

          if (!filePath) return;
  
          try {
            readModule(filePath, require(filePath), isJson);
            LoadedModules.push(file);
          } catch (e) {
            console.warn(`Error loading module '${file}'`);
            console.error(e);
            FailedModules.push(file);
          }
        });

        // Check that all dependencies are met
        Object.keys(this.modules).forEach((name) => {
          const module = this.modules[name];
          if (!module.dependencies) return;
          module.dependencies.forEach((dependency) => {
            if (this.modules[dependency]) return;
            console.warn(`Module '${module.path}' has an unmet dependency: '${dependency}'`);
            // Remove module from list of modules to load and move from loaded to failed
            if (this.modules[name]) {
              delete this.modules[name];
              LoadedModules.splice(LoadedModules.indexOf(name), 1);
              FailedModules.push(name);
            }
          });
        });

        console.info(`Successfully loaded ${LoadedModules.length} modules.`);
        if (FailedModules.length) {
          console.warn(`Failed to load ${FailedModules.length} modules: ${FailedModules.join(', ')}`);
          this.unloadedModules = FailedModules;
        }
        this.createEventHandlers();
        resolve();
      });
    });
  }

  async registerSlashCommands(): Promise<void> {
    const commandsFlat = Object.values(this.modules).reduce((acc: any[], module: ModuleItem) => {
      if (!module.slashCommands) return acc;
      return acc.concat(module.slashCommands);
    }, []);

    // Alert and filter out duplicate name properties
    const commands: any[] = [];
    const duplicateNames: string[] = [];
    commandsFlat.forEach((command) => {
      if (commands.find((c) => c.name === command.name)) {
        duplicateNames.push(command.name);
        return;
      }
      commands.push(command);
    });

    if (duplicateNames.length) {
      console.warn(`Duplicate slash command names found: ${duplicateNames.join(', ')}`);
      console.warn('These commands will be ignored and not registered until resolved to avoid conflicts.');
    }

    // Register slash commands
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
    const tempGuildId = '338136332842827776';
    try {
      console.info('Started refreshing slash commands...');
      await rest.put(
        Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, tempGuildId),
        { body: commands },
      );
      console.info(`Successfully reloaded ${commands.length} slash commands.`);
    } catch (error) {
      console.error(error);
    }
  }

  createEventHandlers(): void {
    // Loops through modules and loads any new event handlers
    const eventsUsed: string[] = [];
    Object.values(this.modules).forEach((module) => {
      if (!module.events) return;
      module.events.forEach((event) => {
        if (eventsUsed.includes(event)) return;
        eventsUsed.push(event);
        this.client.on(event, (...args: any[]) => this.onEvent(event, ...args));
      });
    });

    this.onEvent('WarnableReady');
  }

  onEvent(event: string, ...args: any[]): void {
    // Loop through modules and call event handlers
    Object.keys(this.modules).forEach((key) => {
      const module = this.modules[key];
      if (!module.events || !module.main) return;
      if (!module.main[event]) return;
      // If interaction is a slash command, check that it exists in the modules slash commands
      if (event === 'interactionCreate' && args[0].isChatInputCommand()) {
        if (!module.slashCommands) return;
        if (!module.slashCommands.find((c: any) => c.name === args[0].commandName)) return;
      }

      const warnable: WarnableModule = {
        client: this.client,
        modules: this.modules,
        unloadedModules: this.unloadedModules,
      };

      module.main[event](warnable, ...args);
    });
  }
}

export default ModuleManager;