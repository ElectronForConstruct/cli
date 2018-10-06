const inquirer = require('inquirer');
const exec     = require('child_process').exec;
const path     = require('path');
const fs       = require('fs');
const opn      = require('opn');
const os       = require('os');

const isDev = !process.pkg;

module.exports = {
  previewC2() {
    console.log('To preview a Construct 2 project, please follow instructions here: https://github.com/ElectronForConstruct/template');
    return this.beforeExit();
  },
  previewC3() {
    console.log('To preview your Construct 3 project in Electron, you need a valid subscription to Construct 3');
    console.log('Then, go to the preview menu and hit "Remote preview" and paste the link that appear here');
    inquirer.prompt([
      {
        type    : 'input',
        name    : 'previewUrl',
        message : 'Enter the Construct 3 preview URL: ',
        validate: function (input) {
          const done = this.async();

          const regex = /https:\/\/preview\.construct\.net\/#.{8}$/;

          if (input.match(regex))
            done(null, true);
          else
            done('Invalid URL');
        }
      }
    ]).then(answers => {
      this.startPreview(answers.previewUrl);
    });
  },
  getProjectRoot() {
    return isDev ? __dirname : path.dirname(process.execPath);
  },
  getPathToConfig() {
    return path.join(this.getProjectRoot(), 'config', 'config.json');
  },
  startPreview(url) {
    console.log(`Starting preview on "${url}"`);
    if (isDev)
      return;

    const npmstart = exec('npm run start -- ' + url, {
      cwd: this.getProjectRoot(),
    });

    npmstart.stdout.on('data', (data) => {
      console.log(data.toString());
    });

    npmstart.stderr.on('data', (data) => {
      console.error('Error: ' + data.toString());
    });

    npmstart.on('exit', (code) => {
      console.log('Electron exited: ' + code.toString());
    });
  },
  showHelp() {
    console.log('To get help, please refer to this link: https://github.com/ElectronForConstruct/template');
    return this.beforeExit();
  },
  reportAnIssue() {
    const msg = `
Configuration:
  - OS: ${os.platform()}
  - Arch: ${os.arch()}
  
Steps to reproduce: 
  - 
    `.trim();

    opn(`https://github.com/ElectronForConstruct/preview-script/issues/new?body=${encodeURI(msg)}`);
    return this.beforeExit();
  },
  showMenu(config) {

    const questions = [];

    questions.push({
      type   : 'list',
      name   : 'editor',
      message: 'What editor are you using?',
      when   : !config.type,
      choices: [ {
        name : 'Construct 2',
        value: 'construct2'
      }, {
        name : 'Construct 3',
        value: 'construct3'
      } ],
    });

    /*
    0 - Preview C2
    1 - Preview C3
    2 - View Help
    3 - Report an issue
    4 - Exit
     */
    questions.push({
      type   : 'list',
      name   : 'action',
      message: 'What do you want to do?',
      choices: (answers) => {
        const type = config.type ? config.type : answers.editor;
        return [
          {
            name : type === 'construct2' ? 'Preview Construct 2' : 'Preview Construct 3',
            value: type === 'construct2' ? 0 : 1
          },
          {
            name : 'View help',
            value: 2
          },
          {
            name : 'Report an issue',
            value: 3
          },
          {
            name : 'Exit',
            value: 4
          }
        ];
      }
    });

    inquirer.prompt(questions).then(answers => {
      if (isDev) {
        console.log(answers);
      }

      // override type if was not previously set
      if (!config.type) {
        config.type = answers.editor;
        fs.writeFileSync(this.getPathToConfig(), JSON.stringify(config, null, '\t'), 'utf8');
      }

      switch (answers.action) {
        case 0:
          this.previewC2();
          break;
        case 1:
          this.previewC3();
          break;
        case 2:
          this.showHelp();
          break;
        case 3:
          this.reportAnIssue();
          break;
        case 4:
          process.exit(0);
          break;
      }
    });
  },
  beforeExit() {
    return inquirer.prompt(
      [
        {
          type   : 'input',
          name   : 'validation',
          message: 'Press enter to exit...'
        }
      ]
    ).then(() => {
      process.exit(0);
    });
  }
};
