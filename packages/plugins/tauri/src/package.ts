import { createScopedLogger } from '@cyn/utils';

export default class TauriPackage {
  description = 'Package your app'
  id = 'tauri/package'
  config = {
    // electronVersion: '8.0.0',
    dir: process.cwd(),
    asar: true,
    // icon: path.join(process.cwd(), 'build', 'icon'),
    out: 'dist',
    overwrite: true,
    extraResource: [],
    ignore: [
      /preview*/,
      /node_modules\/greenworks/,
      /node_modules\/app-builder-bin/,
      /node_modules\/app-builder-lib/,
    ],
    win32metadata: {},
  }

  async run({ workingDirectory, taskSettings }: any) {
    const logger = createScopedLogger('package');

    const buildSettings: any = taskSettings as any;

    return {
      source: workingDirectory,
    };
  }
}
