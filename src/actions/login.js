const path = require('path');
const fs = require('fs');
const got = require('got');
const { prompt } = require('enquirer');
const logger = require('../utils/console').normal('login');

/**
 * @type EFCModule
 */
module.exports = {
  name: 'login',
  description: 'Super secret command ;)',

  async run() {
    const question = [
      {
        type: 'input',
        name: 'email',
        message: 'Enter your e-mail',
        validate(value) {
          if (value === '') {
            return 'E-mail cannot be empty!';
          }
          return true;
        },
      },
      {
        type: 'password',
        name: 'token',
        message: 'Enter your token',
        hint: 'Token can be found at https://xxx.com/account',
        validate(value) {
          if (value === '') {
            return 'Token cannot be empty!';
          }
          return true;
        },
      },
    ];

    const answers = await prompt(question);

    try {
      const { body } = await got.post('https://us-central1-electronforconstruct.cloudfunctions.net/verifyToken', {
        body: {
          token: answers.token,
        },
        json: true,
      });

      if (body.error) {
        logger.error(body.error);
        return false;
      }

      if (body.email === answers.email) {
        const homedir = require('os').homedir();
        const tokenFile = 'efc.conf';

        fs.writeFileSync(path.join(homedir, tokenFile), JSON.stringify({
          token: answers.token,
        }));
        logger.success('Successfully logged in! Welcome back.');
        return true;
      }
      logger.error('Invalid email');
      return false;
    } catch (error) {
      logger.error(error);
      return false;
    }
  },
};
