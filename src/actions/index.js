const build = require('./build');
const debug = require('./debug');
const donate = require('./donate');
const help = require('./help');
const _new = require('./new');
const preview = require('./preview');
const reportAnIssue = require('./report-an-issue');
const plugin = require('./plugin');
const config = require('./config');

module.exports = {
  build,
  help,
  debug,
  donate,
  _new,
  preview,
  reportAnIssue,
  plugin,
  config,
};
