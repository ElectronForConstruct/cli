import * as os from 'os';
import got from 'got';
import pkg from '../package.json';

interface ErrorFrame {
  filename: string;
  lineno: string;
  colno: string;
  method: string;
}

export default {
  /**
   * Report an error to rollbar
   * @param {Error} error
   * @param {Object} config
   * @param args
   * @return {Promise<number>}
   */
  async report(error: Error, config: object, args: any): Promise<number> {
    const stack = error.stack?.split('\n')
      .map((x) => x.trim());

    const frames: ErrorFrame[] = [];
    if (stack) {
      stack.shift();

      stack.forEach((line) => {
        const match = new RegExp(/at (.*) \((.*):(\d*?):(\d*?)\)/gi).exec(line);
        if (!match) {
          return;
        }
        frames.push({
          filename: match[2],
          lineno: match[3],
          colno: match[4],
          method: match[1],
        });
      });
    }

    const platform = os.platform();
    const arch = os.arch();
    const hostname = os.hostname();
    const cliVersion = pkg.version;

    const { body } = await got.post({
      url: 'https://api.rollbar.com/api/1/item/',
      json: {
        // eslint-disable-next-line
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
            // eslint-disable-next-line
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
    }).json();

    return body.result.uuid;
  },
};
