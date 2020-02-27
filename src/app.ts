import mri from 'mri';
import { cosmiconfig } from 'cosmiconfig';
import CommandManager from './classes/commandManager';
import HookManager from './classes/hooksManager';
import SettingsManager from './classes/settingsManager';

import hooks from './hooks';

async function app(): Promise<void> {
  const alias = {
    h: 'help',
    p: 'profile',
    c: 'config',
  };
  const boolean = ['help', 'debug'];

  const argv = process.argv.slice(2);
  const commandName = argv[0];

  const cm = CommandManager.getInstance();
  const hm = HookManager.getInstance();
  const sm = SettingsManager.getInstance();

  // --- Load config

  await sm.loadConfig();

  // --- Load hooks

  hm.registerAll(hooks);

  // --- Execute

  let commandWrapper;
  if (commandName) {
    commandWrapper = await cm.getCommand(commandName);
  } else {
    commandWrapper = await cm.getCommand('help');
  }

  const args = mri(argv, {
    alias: { ...alias, ...commandWrapper.alias },
    boolean: [...boolean, ...commandWrapper.boolean],
    default: commandWrapper.default,
  });

  if (args.config) {
    await sm.loadConfig(args.config);
  }

  await commandWrapper.command.run(args);
}

export default app;
