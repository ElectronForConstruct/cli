const { version, name } = require('../package');

// Config order:
// Default config < Plugin Configuration < Plugin Runtime configuration < User config

module.exports = {
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
  dependencies: [
    `${name}@${version}`, // always latest cli
    'electron-is-dev',
    'fs-extra',
    'serve-handler',
  ],
  plugins: [
    'build',
    'preview-c2',
    'preview-c3',
    'preview-folder',
    'quit',
    'donate',
    'new',
    'install-deps',
    'report-issue',
    'help',
    'update',
    'config',
  ],
  developer: {
    showConstructDevTools: true,
    autoClose: true,
    autoReload: true,
    showChromeDevTools: true,
  },
  project: {
    name: 'My name',
    description: 'My description',
    author: 'Me',
    branch: 'master',
  },
  type: 'construct3',
  switches: [],
  build: {
    appId: 'com.you.yourapp',
    productName: 'YourAppName',
    copyright: 'Copyright © 2018 You',
    directories: {
      buildResources: 'build',
      output: 'dist',
    },
    files: [
      '!preview.exe',
      '!preview',
    ],
  },
};
