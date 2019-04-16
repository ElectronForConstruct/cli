module.exports = {
  name: 'new',
  description: 'Bootstrap a new project',
  usage: 'new -n name [ [ -g ] [ -p ] ]',
  cli: {
    name: {
      shortcut: 'n',
    },
    git: {
      boolean: true,
      default: true,
    },
    preview: {
      boolean: true,
      default: true,
    },
  },

  async run(args, config) {
    if (config.isProject) {
      console.log('This project is already configured');
    }

    if (!args.name) {
      console.log('A name is required in order to create a project');
    }

    const fs = require('fs');
    const path = require('path');
    const shelljs = require('shelljs');
    const downloadPreview = require('../utils/downloadPreview');

    const fullPath = path.join(process.cwd(), args.name);
    if (fs.existsSync(fullPath)) {
      console.log('This path already exist!');
      return;
    }

    console.log('Bootstrapping project...');

    shelljs.mkdir('-p', fullPath);
    shelljs.cp('-R', [
      path.join(__dirname, '../../', 'new-project-template', '*'), // regular files
      path.join(__dirname, '../../', 'new-project-template', '.*'), // hidden files (.gitignore, etc)
    ], fullPath);

    if (!args.git && fs.existsSync(path.join(fullPath, '.gitignore'))) {
      fs.unlinkSync(path.join(fullPath, '.gitignore'));
    }

    if (args.preview) {
      await downloadPreview(fullPath);
    }

    console.log('Downloaded');
    console.log(`\nYou can now go to your project by using "cd ${args.name}"`);
  },
};
