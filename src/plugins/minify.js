const minify = require('babel-minify');
const recursive = require('recursive-readdir');
const path = require('path');
const fs = require('fs');
const Command = require('../Command');

module.exports = class extends Command {
  constructor() {
    super('minifier', 'Minify');

    this.setDefaultConfiguration({
      ignore: ['data.js', 'offline.js'],
    });
  }

  async recursiveReadDir(dir) {
    return new Promise((resolve, reject) => {
      recursive(dir, (err, files) => {
        if (err) {
          reject(err);
        }
        resolve(files);
      });
    });
  }

  async minify(dir) {
    const { ignore } = this.settings.minify;

    console.log('Minifying...');

    const files = await this.recursiveReadDir(dir);

    files.forEach((file) => {
      if (path.extname(file) === '.js' && !ignore.includes(path.basename(file)) && !file.includes('node_modules')) {
        // console.info(`Minifying ${path.basename(file)}`;

        try {
          const fileContent = fs.readFileSync(file, 'utf8');

          const { code } = minify(fileContent);

          fs.writeFileSync(file, code, 'utf8');
          console.info(`Minified ${path.basename(file)}`);
        } catch (e) {
          console.error(`Failed minifying ${path.basename(file)}`);
        }
      }
    });

    console.log('All files minified successfuly');
  }

  async onPreBuild(dir) {
    await this.minify(dir);
  }

  async run() {
    console.log('The minifier will run before the build step only on files that are going to be included in the final package.');
    console.log('Please use "efc build" to run the minifier');
  }
};
