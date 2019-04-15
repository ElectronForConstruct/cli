const eb = require('electron-builder/out/index');
const fs = require('fs');
const path = require('path');
const Command = require('../Command');

module.exports = class extends Command {
  constructor() {
    super('installer', 'Generate installer');
    this.setDefaultConfiguration({
      appId: 'com.you.yourapp',
      productName: 'YourAppName',
      copyright: 'Copyright © 2018 You',
      directories: {
        buildResources: 'build',
        output: 'dist',
      },
      files: [
        '!preview.exe',
        '!preview',
        '!node_modules/greenworks/!**',
        '!node_modules/app-builder-bin/!**',
        '!node_modules/app-builder-lib/!**',
      ],
    });
  }

  async run() {
    const { settings } = this;

    for (let i = 0; i < this.modules.length; i += 1) {
      const module = this.modules[i];

      if (typeof module.onPreBuild === 'function') {
        // eslint-disable-next-line
        await module.onPreBuild();
      }
    }

    if (
      !fs.existsSync(path.join(process.cwd(), 'index.html'))
      && !fs.existsSync(path.join(process.cwd(), 'data.js'))
      && !fs.existsSync(path.join(process.cwd(), 'data.json'))) {
      console.warn('It seems that there isn\'t any Construct game inside this folder. You must be currently inside a folder containing an HTML5 export of a Construct game');
    } else {
      try {
        // eslint-disable-next-line
        const result = await eb.build({ config: settings.build });
        console.log(result);
      } catch (e) {
        console.log('There was an error building your project:', e);
      }
    }
  }
};
