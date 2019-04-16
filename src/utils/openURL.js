module.exports = (url) => {
  // eslint-disable-next-line
  const start = (process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open');
  require('child_process').exec(`${start} ${url}`);
};
