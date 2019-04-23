module.exports = isProd => ({
  electron: '3.1.6',
  errorLogging: true,
  singleInstance: false,
  window: {
    width: 800,
    height: 600,
    fullscreen: false,
    frame: true,
    transparent: false,
    toolbar: true,
    alwaysOnTop: false,
  },
  debug: {
    showConfig: false,
  },
  developer: {
    showConstructDevTools: true,
    autoClose: true,
    autoReload: true,
    showChromeDevTools: true,
    overlay: null,
  },
  project: {
    name: 'MyName',
    description: 'MyDescription',
    author: 'Me',
    version: '0.0.0',
  },
  plugins: [
    'build', 'preview', 'debug', 'donate', 'new', 'report-issue', 'help', 'ui',
  ],
  switches: [],
});
