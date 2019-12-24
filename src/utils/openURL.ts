import { exec } from 'child_process';

export default function (url: string): void {
  let start = '';
  switch (process.platform) {
    case 'linux':
      start = 'xdg-open';
      break;
    case 'darwin':
      start = 'open';
      break;
    case 'win32':
      start = 'start';
      break;
    default:
      return;
  }
  exec(`${start} ${url}`);
}
