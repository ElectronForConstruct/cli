import fs from 'fs';
import path from 'path';
import actions from './actions';
import yargs from 'yargs';

const isDev = !process.pkg;

if (isDev) {
  console.log('Running in developement mode');
  console.log(`Searching for configuration at "${actions.getPathToConfig()}"...`);
}

const isProjectConfigured = fs.existsSync(actions.getPathToConfig());

if (!isDev) {
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

// If project is configured, pass, otherwise throw an error
if (!isProjectConfigured) {
  console.log('Your project is not configured yet, please download the associated Toolbox App (https://github.com/ElectronForConstruct/toolbox-app)');
  actions.beforeExit();
}

// Try to read the config file
let config;
try {
  config = JSON.parse(fs.readFileSync(actions.getPathToConfig()));
} catch (e) {
  console.log('There was an error reading your configuration file.');
  actions.beforeExit();
}

if (isDev)
  console.dir(argv);

// yargs
const argv = yargs
  .command('build [-c build_config.json]', 'Build you game using configuration file', () => yargs.option('config', {
    alias  : 'c',
    default: 'here',
    type   : 'string',
  }))
  .option('c', {
    alias       : 'config',
    demandOption: false,
    default     : path.join(__dirname, 'config'),
    describe    : 'Directory where configuration files are located',
    type        : 'string',
  })
  .help('help')
  .argv;

if (argv[ 'preview-c3' ]) {
  actions.startPreview(argv[ 'preview-c3' ]);
  actions.beforeExit();
} else if (argv[ '_' ][ 0 ]) {
  const arg   = argv[ '_' ][ 0 ];
  const regex = /(https?:\/\/)?((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])|localhost):\d*\/?$/;
  if (arg.match(regex)) {
    actions.startPreview(arg);
  } else {
    console.log('Invalid url');
  }
} else {
  actions.showMenu(config);
}

