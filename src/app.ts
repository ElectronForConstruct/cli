import mri from 'mri';
import CommandManager from './classes/commandManager';

async function app(): Promise<void> {
  const settings = {};

  const alias = {
    h: 'help',
    p: 'profile',
  };
  const boolean = ['help'];

  const argv = process.argv.slice(2);
  const commandName = argv[0];

  const cm = CommandManager.getInstance();

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
