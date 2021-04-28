import { cac } from 'cac';
import { Listr } from 'listr2';
import fs from 'fs-extra';
import path from 'path';
import traverse from 'traverse';
import { AModule, Settings } from '@cyn/utils';
import replaceAll from 'string-replace-all-ponyfill';
import dotProp from 'dot-prop';
import { Args, CLICore, CLICtx } from './models';
import { loadConfig } from './config';
import add from './utils/add';

const modules: Record<string, AModule<unknown, unknown>> = {};

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
      Object.entries(importedModules).forEach(([key, MyModule]) => {
        modules[key] = MyModule;
      });
    }
  }

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
          const tasks = new Listr<CLICtx>(
            [],
            {
              // @ts-ignore
              renderer: (command.debug === true) ? 'verbose' : 'default',
              // @ts-ignore
              ctx: {
                outputs: {},
              },
            },
          );

          command.steps.forEach((_step) => {
            const step = myCommand.createCLIStep(modules[_step.plugin], _step.id);

            tasks.add({
              title: _step.id, // build
              task: async (ctx, t) => {
                // eslint-disable-next-line array-callback-return,func-names
                const inputs = traverse(_step.inputs).map(function (value) {
                  if (this.isLeaf && typeof value === 'string') {
                    const regexp = /{{(.*?)}}/g;
                    if (regexp.test(value)) {
                      // @ts-ignore
                      const result = replaceAll(value, regexp, (fullMatch, grp1) => {
                        const search = grp1.trim();
                        const prop = dotProp.get(ctx, search);
                        return prop;
                      });
                      this.update(result);
                    }
                  }
                });

                step.setInputs(inputs);
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
