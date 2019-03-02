const npm = (process.platform === 'win32' ? 'npm.cmd' : 'npm');
const electron = (process.platform === 'win32' ? 'electron.cmd' : 'electron');

module.exports = {
  npm,
  electron,
};
