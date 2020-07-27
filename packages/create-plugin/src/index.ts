import * as path from 'path'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Plop, run,} from 'plop';
import minimist from 'minimist';

const args = process.argv.slice(2);
const argv = minimist(args)

Plop.launch({
  cwd: argv.cwd,
  configPath: path.join(__dirname, 'plopfile.js'),
  require: argv.require,
  completion: argv.completion
}, (env: any) => {
  const options = {
    ...env,
    dest: process.cwd()
  }
  return run(options, undefined, true)
});