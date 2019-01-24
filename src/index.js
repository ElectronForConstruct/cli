import isDev from './isDev';
import { showMenu } from './actions';

if (isDev) {
  console.log('Running in developement mode');
} else {
  console.log(`
  ___ _        _                       
 | __| |___ __| |_ _ _ ___ _ _         
 | _|| / -_) _|  _| '_/ _ \\ ' \\        
 |___|_\\___\\__|\\__|_| \\___/_||_|       
      / _|___ _ _                      
     |  _/ _ \\ '_|                     
   __|_| \\___/_|   _               _   
  / __|___ _ _  __| |_ _ _ _  _ __| |_ 
 | (__/ _ \\ ' \\(_-<  _| '_| || / _|  _|
  \\___\\___/_||_/__/\\__|_|  \\_,_\\__|\\__|

`);
}

const config = {};

/* if (argv[ 'preview-c3' ]) {
  actions.startPreview(argv[ 'preview-c3' ]);
  actions.beforeExit();
} else if (argv[ '_' ][ 0 ]) {
  const arg   = argv[ '_' ][ 0 ];
  const regex =
  /(https?:\/\/)?((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.)
  {3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|localhost):\d*\/?$/;
  if (arg.match(regex)) {
    actions.startPreview(arg);
  } else {
    console.log('Invalid url');
  }
} */
showMenu(config);
