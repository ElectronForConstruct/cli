module.exports = {
  /**
   * Report an error to rollbar
   * @param {Error} error
   * @param {Object} config
   * @param args
   * @return {Promise<number>}
   */
  async report(error, config, args) {
    const os = require('os');
    const got = require('got');
    const pkg = require('../package.json');

    const stack = error.stack.split('\n').map(x => x.trim());

    stack.shift();

    const frames = [];
    stack.forEach((line) => {
      const match = new RegExp(/at (.*) \((.*):(\d*?):(\d*?)\)/gi).exec(line);
      frames.push({
        filename: match[2],
        lineno: match[3],
        colno: match[4],
        method: match[1],
      });
    });

    const platform = os.platform();
    const arch = os.arch();
    const hostname = os.hostname();
    const cliVersion = pkg.version;

    const { body } = await got('https://api.rollbar.com/api/1/item/', {
      body: {
        access_token: 'f7bc938132944f90bf6c12c9088fbe0b',
        data: {
          environment: 'development',
          body: {
            trace: {
              frames,
              exception: {
                class: error.name,
                message: error.message,
              },
            },
            code_version: cliVersion,
            platform,
            language: 'javascript',
            arch,
            hostname,
            config,
            args,
          },
        },
      },
      json: true,
    });

    return body.result.uuid;
  },
};
