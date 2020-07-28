#!/usr/bin/env node

import * as path from 'path'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {Plop, run,} from 'plop';
import minimist from 'minimist';

const args = process.argv.slice(2);
const argv = minimist(args)

console.log('argv', argv)

Plop.launch({
  cwd: argv.cwd,
  configPath: path.join(__dirname, 'plopfile.js'),
  require: argv.require,
  completion: argv.completion
}, (env: any) => {
  console.log('process.cwd()', process.cwd())
  const options = {
    ...env,
    dest: process.cwd()
  }
  return run(options, undefined, true)
});