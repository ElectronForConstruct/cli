const path = require('path');
const isDev = require('./isDev');

module.exports = {
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
  plugins: [
    'preview',
    'quit',
    'donate',
    'new',
    'report-issue',
    'help',
    'update',
    'config',
    'debug',
    'build',
  ],
  developer: {
    showConstructDevTools: isDev,
    autoClose: isDev,
    autoReload: isDev,
    showChromeDevTools: isDev,
    overlay: null,
  },
  project: {
    name: 'MyName',
    description: 'MyDescription',
    author: 'Me',
    version: '0.0.0',
  },
  switches: [],
  installer: {
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
    localGreenworksPath: null,
    forceClean: false,
  },
  minify: {
    ignore: ['data.js', 'offline.js'],
  },
  build: {
    dir: process.cwd(),
    asar: true,
    icon: path.join(process.cwd(), 'build', 'icon'),
    out: 'dist',
    overwrite: true,
    extraResource: [],
    ignore: [
      'preview*',
      'node_modules/greenworks',
      'node_modules/app-builder-bin',
      'node_modules/app-builder-lib',
    ],
    win32metadata: {},
  },
  'crash-reporter': {
    enable: false,
  },
};
