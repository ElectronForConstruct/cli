const { prompt } = require('enquirer');
const { Command } = require('@efc/core');
const install = require('install-packages');
const path = require('path');
const startPreview = require('../utils/startPreview');

module.exports = class extends Command {
  constructor() {
    super('preview', 'Preview', 'p');
    this.setCategory('Developement');
  }

  async run(args = {}) {
    const { settings } = this;
    const argsLength = Object.keys(args).length;

    // TODO check arg url against regex

    let previewUrl = '';

    // eslint-disable-next-line
    if (argsLength > 0) previewUrl = args[ 0 ];
    else {
      console.log('\nTo preview your Construct project in Electron, you need a valid subscription.');
      console.log('\t• Construct 3: Go to the preview menu, hit "Remote preview" and paste the link that appear here');
      console.log('\t• Construct 2: Start a regular browser preview and paste the link here');
      console.log('\t• Leave blank to preview current folder\n');
      const answers = await prompt([
        {
          type: 'input',
          name: 'url',
          message: 'Enter your Construct URL: ',
          validate: (url) => {
            if (url === '') return true;
            const regexC3 = /https:\/\/preview\.construct\.net\/#.{8}$/;
            const regexC2 = /^https?:\/\/(?:localhost|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}):\d*\/?$/;
            if (url.match(regexC2) || url.match(regexC3)) {
              return true;
            }
            return `Invalid URL: ${url}`;
          },
        },
      ]);
      previewUrl = answers.url;
    }

    const templateFolder = path.join(__dirname, '../..', 'template');
    const pkg = require(path.join(templateFolder, 'package.json'));
    if (pkg.devDependencies.electron !== settings.electron) {
      await install({
        packages: [`electron@${settings.electron}`],
        saveDev: true,
        cwd: templateFolder,
      });
    }

    await startPreview(previewUrl);
  }
};
