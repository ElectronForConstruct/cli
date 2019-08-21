const path = require('path');
const log = require('../utils/console')
  .normal('uwp');

// help:
// you need https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk
// powershell: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
// https://www.microsoft.com/en-us/p/desktop-app-converter/9nblggh4skzw?activetab=pivot:overviewtab

/**
 * @type EFCModule
 */
module.exports = {
  name: 'uwp',
  cli: [],
  description: 'Package your app for the windows store',
  config: {},
  async onPostBuild(args, settings, out) {
    // todo start the setup once

    const shelljs = require('shelljs');
    const convertToWindowsStore = require('electron-windows-store');

    if (out.includes('win32')) {
      log.info('Appx packaging started...');

      if (!settings.uwp) {
        log.error('It looks like your "uwp" configuration is empty');
        return;
      }

      // create output directory
      const appxOutput = path.join(out, '..', 'appx');
      shelljs.mkdir('-p', appxOutput);

      convertToWindowsStore({
        inputDirectory: out,
        outputDirectory: appxOutput,
        packageVersion: '1.0.0.0',
        packageName: 'Ghost',
        packageDisplayName: 'Ghost Desktop',
        packageDescription: 'Ghost for Desktops',
        packageExecutable: 'app/MyName.exe',
        assets: 'build',
        publisher: 'CN=developmentca',
        windowsKit: 'C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.18362.0\\x64',
        devCert: 'C:\\Users\\quent\\AppData\\Roaming\\electron-windows-store\\developmentca\\developmentca.pfx',
        // certPass: '',
        desktopConverter: 'C:\\Users\\quent\\AppData\\Local\\Microsoft\\WindowsApps\\',
        expandedBaseImage: 'D:\\AppxImages\\Windows_BaseImage_DAC_18362_V1.wim',
      });

      return true;
    }
    return true;
  },
  /**
   * @param args
   * @param {Settings} settings
   * @return {Promise<void>}
   */
  async run(/* args, settings */) {
  },
};
