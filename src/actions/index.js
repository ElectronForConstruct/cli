const build = require('./build');
const crashReporter = require('./crash-reporter');
const debug = require('./debug');
const donate = require('./donate');
const greenworks = require('./greenworks');
const help = require('./help');
const installer = require('./installer');
const itch = require('./itch');
const minify = require('./minify');
const _new = require('./new');
const preview = require('./preview');
const reportAnIssue = require('./report-an-issue');

module.exports = {
  build,
  help,
  crashReporter,
  debug,
  donate,
  greenworks, // greenworks run before installer
  installer,
  itch,
  minify,
  _new,
  preview,
  reportAnIssue,
};
