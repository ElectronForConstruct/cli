import { cac } from 'cac';
import { Listr } from 'listr2';
import fs from 'fs-extra';
import path from 'path';

import { Settings } from '@cyn/utils';
import { Args, CLICore, CLICtx } from './models';
import { loadConfig } from './config';
import add from './utils/add';

const modules: Record<string, any> = {};

const core = new CLICore();

// const tasks = new Listr<any>(
//   [
//     /* tasks */
//   ],
//   {
//     /* options */
//   },
// );

const cli = cac();

async function app() {
  cli
    // .option('-p, --profile <name>', 'Specify profile')
    .option('-c, --config <path>', 'Specify path to a configuration file')
    // .option('-w, --watch', 'Watch for changes and restart')
    .option('-d, --debug', 'Output the resolved config file');

  // --- Load config

  const parsed = cli.parse();

  const config = await loadConfig(parsed.options.config);

  const settings = config.config as Settings;

  if (!settings.commands) {
    throw new Error('No commands available');
  }

  if (settings?.plugins) {
    // eslint-disable-next-line no-restricted-syntax
    for await (const plugin of settings.plugins) {
      const importedModules = await add(plugin);
      console.log('importedModules', importedModules);
      importedModules.modules.forEach((MyModule) => {
        const modInstance = new MyModule();
        modules[modInstance.id] = module;
      });
    }
  }

  console.log('modules', modules);

  Object.entries(settings.commands).forEach(([commandName, command]) => {
    const myCommand = core.createCLICommand(commandName);
    // Make commands
    cli
      .command(myCommand.name, command.description)
      .action(async (args: Args) => {
        // const configuration = core.computeConfiguration();

        if (args.debug) {
          // dump(configuration);
        }

        try {
          const tasks = new Listr<CLICtx<unknown>>(
            [],
            {
            // @ts-ignore
              renderer: (module.debug === true) ? 'verbose' : 'default',
              // ctx: context,
            },
          );

          command.steps.forEach((_step) => {
            const step = myCommand.createCLIStep(modules[_step.plugin], _step.id);

            tasks.add({
              title: _step.id, // build
              task: async (ctx, t) => {
                // TODO replace ${{ outputs['dummy-1'].message }}

                console.log('_step.inputs', _step.inputs);

                step.setInputs(_step.inputs);
                step.setLogger({
                  log: (str: string) => {
                    t.output = str;
                  },
                });

                const output = await step.run();

                ctx.outputs[step.id] = output;

                return ctx;
              },
              options: {
                bottomBar: 5,
              },
            });
          });

          if (tasks) {
            const ctx = await tasks.run();
            console.log('ctx', ctx);
          } else {
            console.log('Nothing to run');
          }
        } catch (e) {
          // it will collect all the errors encountered if { exitOnError: false }
          // is set as an option but will not throw them
          // elsewise it will throw the first error encountered as expected
          console.error(e);
        }
      });
  });

  // Load local commands and override any command made by the user
  const commands: any[] = [];
  commands.forEach(({ name, description, callback }) => {
    cli
      .command(name, description)
      .action(callback);
  });

  cli.help();

  let pkg: any = {};
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  } catch (error) {
    // logger.info('Error reading package.json file');
  }

  cli.version(pkg?.version ?? '0.0.0');

  // Run
  cli.parse();
}

export default app;
