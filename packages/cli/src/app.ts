import { cac } from 'cac';
import { Listr } from 'listr2';
import fs from 'fs-extra';
import path from 'path';
import { Core } from '@cyn/core';

import { Args } from './models';

const core = new Core();

const tasks = new Listr<any>(
  [
    /* tasks */
  ],
  {
    /* options */
  },
);

const cli = cac();

/* fromStepsToListr(
  steps: TaskStep<unknown>[],
  task: ListrTaskWrapper<Ctx<unknown>, any>,
  ctx: Ctx<unknown>,
  options: ListrSubClassOptions<unknown>,
) {
  const generatedTasks: ListrTask<Ctx<unknown>>[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const step of steps) {
    if (!step) {
      console.info('Invalid step');
      return;
    }

    const moduleInstanceForStep = this.moduleManager.get(step.name);
    if (moduleInstanceForStep) {
      // @ts-ignore
      const taskSettings: Ctx<unknown> = deepmerge.all([
        moduleInstanceForStep.config ?? {},
        // @ts-ignore
        step.config ?? {},
      ]);

      const { tasks: instanceTasks } = moduleInstanceForStep;

      ctx.taskSettings = taskSettings;

      generatedTasks.push({
        title: step.name, // dummy
        task(innerCtx, task2) {
          innerCtx.taskSettings = taskSettings;

          // @ts-ignore
          return task2.newListr(instanceTasks, {
            ctx: innerCtx,
            rendererOptions: { collapse: true },
          });
        },
        options: {
          ...options,
          ctx,
        },
      });
    } else {
      console.error(`Cannot find Task ${step.name}`);
    }
  }

  return task.newListr(generatedTasks, {
    rendererOptions: { collapse: false },
    ...options,
    ctx,
  });
} */

function app(): void {
  cli
    // .option('-p, --profile <name>', 'Specify profile')
    .option('-c, --config <path>', 'Specify path to a configuration file')
    // .option('-w, --watch', 'Watch for changes and restart')
    .option('-d, --debug', 'Output the resolved config file');

  // --- Load config

  const parsed = cli.parse();

  // await core.loadConfig(parsed.options.profile, parsed.options.config);

  // await core.loadTasks();

  const availableCommands = core.getCommands();
  availableCommands.forEach((command) => {
    // Make commands
    cli
      .command(command.name, command.description)
      .action((args: Args) => {
        // const configuration = core.computeConfiguration();

        if (args.debug) {
          // dump(configuration);
        }

        try {
          // const t = core.getTasks(command.name);

          // const tasks = new Listr<Ctx<unknown>>(
          //   [],
          //   {
          //   // @ts-ignore
          //     renderer: (module.debug === true) ? 'verbose' : 'default',
          //     ctx: context,
          //   },
          // );

          // tasks.add({
          //   title: command, // build
          //   // @ts-ignore
          //   task: (ctx, t) => this.fromStepsToListr(steps, t, ctx),
          //   options: {
          //     bottomBar: 5,
          //   },
          // });

          // if (t) {
          //   await t.run();
          // } else {
          //   console.log('Nothing to run');
          // }
          // console.log('ctx', ctx);
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  cli.version(pkg?.version ?? '0.0.0');

  // Run
  cli.parse();
}

export default app;
