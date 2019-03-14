const { prompt } = require('enquirer');
const opn = require('opn');
const { Command } = require('@efc/core');
const pkg = require('../../package.json');

module.exports = class extends Command {
  constructor() {
    super('help', 'Help', 'h');
  }

  isVisible() {
    return true;
  }

  async run(args) {
    const argsLength = Object.keys(args).length;

    console.log(`\n  Version: ${pkg.version}\n`);

    let { modules } = this;
    if (argsLength === 1) modules = modules.filter(m => m.id === args[0]);

    const maxCategoryLength = modules.reduce(
      (a, b) => (a.category.length > b.category.length ? a : b),
    ).category.length;

    const maxNameLength = modules.reduce(
      (a, b) => (a.rawName.length > b.rawName.length ? a : b),
    ).rawName.length;

    const maxIdLength = modules.reduce(
      (a, b) => (a.id.length > b.id.length ? a : b),
    ).id.length;


    let options = modules.map(
      module => `  ${module.category.padEnd(maxCategoryLength + 2, ' ')} ${module.rawName.padEnd(maxNameLength + 2, ' ')} ${module.id.padEnd(maxIdLength)} ${module.shortcut ? `(${module.shortcut})` : ''}`,
    );
    if (modules.length === 0) options = [`\tUnable to find module "${args[0]}"`];

    if (modules.length === 1) {
      console.log(`
${options}
      
  ${modules[0].description}
      `);
      return;
    }

    console.log(`
Usage: 
  
  efc [id]
  
  id: the id of the command you want to execute directly
      
Available modules:
  
${options.join('\n')}
    `);

    const answers = await prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Get more help in the browser ?',
      },
    ]);
    if (answers.confirm) {
      opn('https://electronforconstruct.armaldio.xyz');
    }
  }
};
