import { CynModule, CynModuleWrapper } from '../models';

export default class CommandManager {
  private static instance: CommandManager;

  static getInstance(): CommandManager {
    if (!CommandManager.instance) {
      CommandManager.instance = new CommandManager();
    }
    return CommandManager.instance;
  }

  getAlias(command: CynModule): Record<string, string> {
    const aliases: Record<string, string> = {};
    if (!command.cli) {
      return {};
    }

    command.cli.forEach((value) => {
      aliases[value.name] = value.shortcut;
    });
    return aliases;
  }

  getDefault(command: CynModule): Record<string, string> {
    const defaults: Record<string, string> = {};
    if (!command.cli) {
      return {};
    }

    command.cli.forEach((value) => {
      defaults[value.name] = value.default;
    });
    return defaults;
  }

  getBoolean(command: CynModule): string[] {
    const booleans: string[] = [];
    if (!command.cli) {
      return [];
    }

    command.cli.forEach((value) => {
      if (value.boolean) {
        booleans.push(value.name);
      }
    });
    return booleans;
  }

  async getCommand(name: string): Promise<CynModuleWrapper> {
    const Module = await import((`../commands/${name}`));
    console.log(Module);

    // eslint-disable-next-line
    const command = new Module.default();

    return {
      alias: this.getAlias(command),
      boolean: this.getBoolean(command),
      default: this.getDefault(command),
      command,
    };
  }
}
