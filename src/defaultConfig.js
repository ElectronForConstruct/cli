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
  dependencies: [],
  plugins: [
    'build',
    'preview-c2',
    'preview-c3',
    'preview-folder',
    'quit',
    'donate',
    'new-project',
    'install-deps',
    'report-issue',
    'help',
    'update',
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
    mac: {
      category: 'public.app-category.developer-tools (see: http://lnk.armaldio.xyz/AppleCategoryList)',
      target: 'default',
    },
    win: {
      target: [
        {
          target: 'nsis',
          arch: [
            'x64',
            'ia32',
          ],
        },
        {
          target: 'portable',
          arch: [
            'x64',
            'ia32',
          ],
        },
      ],
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      perMachine: true,
    },
  },
};
