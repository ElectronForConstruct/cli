import { createScopedLogger } from './console';

const log = createScopedLogger('package');

export default function (folders: string[]): void {
  for (let i = 0; i < folders.length; i += 1) {
    const folder = folders[i];
    if (i === folders.length - 1) {
      log.log(`└── ${folder}`);
    } else {
      log.log(`├── ${folder}`);
    }
  }
}
