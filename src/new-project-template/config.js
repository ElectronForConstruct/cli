// Happy with ElectronForConstruct ? ► Donate: https://armaldio.xyz/donations ♥

module.exports = isProd => ({
  // add your own configuration

  electron: '6.0.1',
  errorLogging: true,
  singleInstance: false,
  window: {
    width: 800,
    height: 600,
    fullscreen: isProd,
    frame: true,
    transparent: false,
    toolbar: true,
    alwaysOnTop: false,
  },
  debug: {
    showConfig: false,
  },
  developer: {
    showConstructDevTools: !isProd,
    autoClose: !isProd,
    autoReload: !isProd,
    showChromeDevTools: !isProd,
    overlay: null,
  },
  project: {
    name: 'MyName',
    description: 'MyDescription',
    author: 'Me',
    version: '0.0.0',
  },
  switches: [],
});
