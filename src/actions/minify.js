const { Command } = require('@efc/core');
const minify = require('babel-minify');
const recursive = require('recursive-readdir');
const path = require('path');
const fs = require('fs');
const ora = require('ora');

module.exports = class extends Command {
  constructor() {
    super('minify', 'Minify', 'm');
  }

  async recursiveReadDir(dir) {
    return new Promise((resolve, reject) => {
      recursive(dir, (err, files) => {
        if (err) reject(err);
        resolve(files);
      });
    });
  }

  async minify(dir) {
    const { ignore } = this.settings.minify;

    console.log(dir);
    let spinner = ora('Minifying...').start();

    const files = await this.recursiveReadDir(dir);

    files.forEach((file) => {
      if (path.extname(file) === '.js' && !ignore.includes(path.basename(file))) {
        spinner.text = `Minifying ${path.basename(file)}`;

        try {
          const fileContent = fs.readFileSync(file, 'utf8');

          const { code } = minify(fileContent);

          fs.writeFileSync(file, code, 'utf8');
          spinner = spinner.info(`Minified ${path.basename(file)}`).start();
        } catch (e) {
          spinner = spinner.fail(`Failed minifying ${path.basename(file)}`).start();
        }
      }
    });

    spinner.succeed('All files minified successfuly');
  }

  async onPreBuild(dir) {
    await this.minify(dir);
  }

  async run() {
    console.log('The minifier will run before the build step only on files that are going to be included in the final package.');
    console.log('Please use "efc build" to run the minifier');
  }
};
