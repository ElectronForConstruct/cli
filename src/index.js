import '@babel/polyfill';
import chalk from 'chalk';
import box from './box';
import checkForUpdate from './updateCheck';
import isDev from './isDev';
import { showMenu } from './actions';

// TODO https://bili.egoist.sh/#/

if (isDev) { console.log('Running in developement mode'); }
// } else {
//   console.log(boxen(`
//   ___ _        _
//  | __| |___ __| |_ _ _ ___ _ _
//  | _|| / -_) _|  _| '_/ _ \\ ' \\
//  |___|_\\___\\__|\\__|_| \\___/_||_|
//       / _|___ _ _
//      |  _/ _ \\ '_|
//    __|_| \\___/_|   _               _
//   / __|___ _ _  __| |_ _ _ _  _ __| |_
//  | (__/ _ \\ ' \\(_-<  _| '_| || / _|  _|
//   \\___\\___/_||_/__/\\__|_|  \\_,_\\__|\\__|


// `, { float: 'center', padding: 2 }));
// }

checkForUpdate()
  .then((update) => {
    if (update) {
      console.log(box(`
  ${chalk.redBright('You are using an outdated version of this tool')}
      
  The latest version is ${chalk.yellow.bold.underline(update.version)}.
  Update using ${chalk.reset.bold.underline(`npm i -g ${update.name}`)}`));
    }

    showMenu();
  })
  .catch((e) => {
    console.error(
      `Failed to check for updates: ${e}`,
    );
  });
