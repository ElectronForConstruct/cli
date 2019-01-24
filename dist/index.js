"use strict";

var _isDev = _interopRequireDefault(require("./isDev"));

var _actions = require("./actions");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (_isDev.default) {
  console.log('Running in developement mode');
} else {
  console.log("\n  ___ _        _                       \n | __| |___ __| |_ _ _ ___ _ _         \n | _|| / -_) _|  _| '_/ _ \\ ' \\        \n |___|_\\___\\__|\\__|_| \\___/_||_|       \n      / _|___ _ _                      \n     |  _/ _ \\ '_|                     \n   __|_| \\___/_|   _               _   \n  / __|___ _ _  __| |_ _ _ _  _ __| |_ \n | (__/ _ \\ ' \\(_-<  _| '_| || / _|  _|\n  \\___\\___/_||_/__/\\__|_|  \\_,_\\__|\\__|\n\n");
}

var config = {};
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

(0, _actions.showMenu)(config);