const openInEditor = require('launch-editor');
const path = require('path');
const fs = require('fs');

/**
 * @type EFCModule
 */
module.exports = {
  name: 'config',
  description: 'Open a link where you can donate to support this app',
  cli: [
    {
      name: 'global',
      shortcut: 'g',
      default: false,
    },
  ],

  async run(args) {
    const configPath = path.join(process.cwd(), `config.${args.profile ? `${args.profile}.js` : 'js'}`);

    if (!fs.existsSync(configPath)) {
      this.logger.error(`It seems that "${path.basename(configPath)}" doesn't exist!`);
      return;
    }

    this.logger.log(`Opening ${configPath}`);

    try {
      openInEditor(configPath);
    } catch (e) {
      this.logger.error(e);
    }
  },
};
