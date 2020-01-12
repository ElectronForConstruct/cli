import fs from 'fs-extra';
import path from 'path';
import mri from 'mri';
import deepmerge from 'deepmerge';
import rollbar from './utils/ErrorReport';
import PluginManager from './classes/pluginManager';
import { createNormalLogger } from './utils/console';

const userConfigPath = path.join(process.cwd(), 'config.js');
const logger = createNormalLogger('system');

const isDev = process.env.CYN_ENV === 'development';

const shouldReportError = !isDev;
let errorReporting = false;

const alias = {
  h: 'help',
  p: 'profile',
};
const boolean = ['help'];

let args = mri(process.argv.slice(2), {
  alias,
  boolean,
});

interface Config {
  isProject: boolean;
  profile?: string;
  errorLogging?: boolean;
}

let config: Config = {
  isProject: false,
};

async function app(): Promise<void> {
  try {
    const profile = args.profile || 'development';

    config.profile = profile;

    let userConfig = {};
    const userConfigPathExist = await fs.pathExists(userConfigPath);
    if (userConfigPathExist) {
      config.isProject = true;
      userConfig = require(userConfigPath);
    }

    // todo support json
    // https://github.com/davidtheclark/cosmiconfig#cosmiconfigoptions
    const profileConfigPath = path.join(process.cwd(), `config.${profile}.js`);
    const profileConfigPathExist = await fs.pathExists(profileConfigPath);
    if (profileConfigPathExist) {
      const profileConfig = await import(profileConfigPath);
      userConfig = deepmerge(userConfig, profileConfig);
    }

    /**
     * -----------------------------------------------------------------------
     */

    await PluginManager.getInstance().loadCommands();

    let pluginsConfig = {};
    PluginManager.getInstance().getCommands()
      .forEach((command) => {
        pluginsConfig = deepmerge(pluginsConfig, { [command.name]: command.config || {} });
      });

    config = deepmerge.all([config, pluginsConfig, userConfig]) as Config;

    PluginManager.getInstance().setModules();
    PluginManager.getInstance().enhanceModules();

    /**
     * -----------------------------------------------------------------------
     */

    errorReporting = config.errorLogging || false;

    const aliases = PluginManager.getInstance().getAliases();
    const booleans = PluginManager.getInstance().getBooleans();
    const defaults = PluginManager.getInstance().getDefaults();

    args = mri(process.argv.slice(2), {
      alias: deepmerge(alias, aliases),
      boolean: [...boolean, ...booleans],
      default: defaults,
    });

    if (args.help || args.h || args._[0] === 'help' || args._.length === 0) {
      await PluginManager.getInstance().run('help', args);
    } else {
      if (!config.isProject && args._[0] !== 'new') {
        logger.error('Uh oh. This directory doesn\'t looks like an Cyn project!');
        return;
      }

      await PluginManager.getInstance().run(args._[0], args, config);
    }
  } catch (e) {
    logger.log('There was an error performing the current task.');
    if (errorReporting && shouldReportError) {
      const eventId = await rollbar.report(e, config, args);
      logger.log(`Please, open an issue and specify the following error code in your message: ${eventId}`);
    }

    logger.fatal(e);
  }
}

export default app;
