const { prompt } = require('enquirer');
const startPreview = require('../utils/startPreview');

const Command = require('../Command');

module.exports = class extends Command {
  constructor() {
    super('preview-c3', 'Construct 3', '3');
    this.setCategory('Preview');
  }

  async run() {
    console.log('To preview your Construct 3 project in Electron, you need a valid subscription to Construct 3');
    console.log('Go to the preview menu, hit "Remote preview" and paste the link that appear here');
    const answers = await prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Enter the Construct 3 preview URL: ',
        validate: (url) => {
          const regex = /https:\/\/preview\.construct\.net\/#.{8}$/;
          if (url.match(regex)) {
            return true;
          }
          return `Invalid URL: ${url}`;
        },
      },
    ]);
    await startPreview(answers.url);
  }
};
