import mri from 'mri';
import { cosmiconfig } from 'cosmiconfig';
import CommandManager from './classes/commandManager';
import HookManager from './classes/hooksManager';

import hooks from './hooks';
import { Settings } from './models';

async function app(): Promise<void> {
  let settings: Settings = {};

  const alias = {
    h: 'help',
    p: 'profile',
  };
  const boolean = ['help'];

  const argv = process.argv.slice(2);
  const commandName = argv[0];

  const cm = CommandManager.getInstance();
  const hm = HookManager.getInstance();

  // --- Load config

  const explorerSync = cosmiconfig('cyn');
  const config = await explorerSync.search();
  if (config) {
    settings = config.config;
  }

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

  await commandWrapper.command.run(args, settings);
}

export default app;
