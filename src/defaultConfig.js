const { version, name } = require('../package');

const isDev = require('./utils/isDev');

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
    'preview-c2',
    'preview-c3',
    'preview-folder',
    'quit',
    'donate',
    'new',
    'report-issue',
    'help',
    'update',
    'config',
    'debug',
    'packager',
  ],
  developer: {
    showConstructDevTools: isDev,
    autoClose: isDev,
    autoReload: isDev,
    showChromeDevTools: isDev,
  },
  project: {
    name: 'My name',
    description: 'My description',
    author: 'Me',
    branch: 'master',
    version: '0.0.0',
  },
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
      '!node_modules/greenworks/!**',
      '!node_modules/app-builder-bin/!**',
      '!node_modules/app-builder-lib/!**',
    ],
  },
  greenworks: {
    steamId: 480,
    sdkPath: 'steam_sdk',
    useLocalBuild: false,
  },
  packager: {
    dir: '.',
    asar: true,
    out: 'packaged',
  },
};
