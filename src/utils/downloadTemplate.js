const fs = require('fs');
const shelljs = require('shelljs');
const downloadRepo = require('./downloadRepo');

module.exports = async (fullPath, branch) => {
  await downloadRepo('ElectronForConstruct', 'template', branch, `${fullPath}.tmp`);
  if (!fs.existsSync(fullPath)) shelljs.mkdir(fullPath);
  shelljs.cp('-R', `${fullPath}.tmp/template/*`, fullPath);
  shelljs.rm('-rf', `${fullPath}.tmp`);
};
