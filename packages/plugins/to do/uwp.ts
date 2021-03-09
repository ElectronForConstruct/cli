import * as path from 'path';
// @ts-ignore
import convertToWindowsStore from 'electron-windows-store';
import fs from 'fs-extra';

interface Config {
  files: string[];
}

const config: Config = {
  files: [],
};

export default {
  description: 'Package your app for the windows store',
  name: 'uwp',
  config,
  run: async function run(
    {
      workingDirectory,
      taskSettings,
    }: {
      workingDirectory: string;
      settings: any;
      taskSettings: Config;
    },
  ): Promise<boolean> {
    if (workingDirectory.includes('win32')) {
      // logger.info('Appx packaging started...');

      // create output directory
      const appxOutput = path.join(workingDirectory, '..', 'appx');
      await fs.ensureDir(appxOutput);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      convertToWindowsStore({
        inputDirectory: workingDirectory,
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
};
