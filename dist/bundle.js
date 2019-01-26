#!/usr/bin/env node
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('@babel/polyfill');
var enquirer = require('enquirer');
var child_process = require('child_process');
var path = _interopDefault(require('path'));
var fs = _interopDefault(require('fs'));
var opn = _interopDefault(require('opn'));
var os = _interopDefault(require('os'));
var ghdownload = _interopDefault(require('github-download'));
var request = _interopDefault(require('request'));
var ora = _interopDefault(require('ora'));
var chalk = _interopDefault(require('chalk'));
var process$1 = _interopDefault(require('process'));

var isDev = process.env.NODE_ENV !== 'production';

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

var installDeps = function installDeps() {
  var spinner = ora('Installing dependencies...').start();
  var npm = process$1.platform === 'win32' ? 'npm.cmd' : 'npm';
  var npmstart = child_process.spawn(npm, ['install', '--no-package-lock']);
  /* , {
  stdio: 'inherit',
  cwd: process.cwd(),
  detached: true,
  }); */

  npmstart.stdout.on('data', function (data) {
    spinner.text = data.toString();
  });
  npmstart.stderr.on('data', function (data) {
    spinner.warn("Error: ".concat(data.toString())).start();
  });
  npmstart.on('exit', function ()
  /* code */
  {
    spinner.succeed('Dependencies successfully installed');
  });
};
var startPreview = function startPreview(url) {
  console.log("Starting preview on \"".concat(url, "\""));
  var npmstart = child_process.exec("npm run start -- ".concat(url), {
    cwd: process$1.cwd()
  });
  npmstart.stdout.on('data', function (data) {
    console.log(data.toString());
  });
  npmstart.stderr.on('data', function (data) {
    console.error("Error: ".concat(data.toString()));
  });
  npmstart.on('exit', function (code) {
    console.log("Electron exited: ".concat(code.toString()));
  });
};
var previewC2 =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            console.log('To preview a Construct 2 project, please follow instructions here: https://github.com/ElectronForConstruct/template');

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function previewC2() {
    return _ref.apply(this, arguments);
  };
}();
var previewC3 =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    var answers;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            console.log('To preview your Construct 3 project in Electron, you need a valid subscription to Construct 3');
            console.log('Then, go to the preview menu and hit "Remote preview" and paste the link that appear here');
            _context2.next = 4;
            return enquirer.prompt([{
              type: 'input',
              name: 'url',
              message: 'Enter the Construct 3 preview URL: ',
              validate: function validate(url) {
                var regex = /https:\/\/preview\.construct\.net\/#.{8}$/;

                if (url.match(regex)) {
                  return true;
                }

                return "Invalid URL: ".concat(url);
              }
            }]);

          case 4:
            answers = _context2.sent;
            startPreview(answers.url);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function previewC3() {
    return _ref2.apply(this, arguments);
  };
}();
var showHelp = function showHelp() {
  console.log('To get help, please refer to this link: https://github.com/ElectronForConstruct/template');
};
var reportAnIssue = function reportAnIssue() {
  var msg = "\nConfiguration:\n- OS: ".concat(os.platform(), "\n- Arch: ").concat(os.arch(), "\n\nSteps to reproduce: \n- \n  ").trim();
  opn("https://github.com/ElectronForConstruct/preview-script/issues/new?body=".concat(encodeURI(msg)));
};

var downloadPreview =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(fullPath) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt("return", new Promise(function (resolve) {
              request({
                url: 'https://api.github.com/repos/ElectronForConstruct/preview/releases/latest',
                headers: {
                  'User-Agent': 'ElectronForContruct'
                }
              }, function (error, response, body) {
                var json = JSON.parse(body);
                var assetUrl = json.assets.find(function (asset) {
                  return asset.name === 'preview.exe';
                }).browser_download_url;
                request(assetUrl).pipe(fs.createWriteStream(path.join(fullPath, 'preview.exe'))).on('finish', function () {
                  resolve(true);
                });
              });
            }));

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function downloadPreview(_x) {
    return _ref3.apply(this, arguments);
  };
}();

var generateElectronProject =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5() {
    var dir, questions, answers, fullPath, spinner;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            dir = process$1.cwd();
            questions = {
              type: 'input',
              name: 'name',
              message: 'What is the name of your project?',
              initial: function initial() {
                return 'MyGame';
              },
              format: function format(name) {
                return path.join(dir, name);
              },
              validate: function validate(name) {
                if (fs.existsSync(path.join(dir, name))) {
                  return 'This path already exist!';
                }

                return true;
              }
            };
            answers = {};
            _context5.prev = 3;
            _context5.next = 6;
            return enquirer.prompt(questions);

          case 6:
            answers = _context5.sent;
            fullPath = path.join(dir, answers.name);
            spinner = ora('Downloading template...').start();
            ghdownload({
              user: 'ElectronForConstruct',
              repo: 'template',
              ref: 'develop'
            }, fullPath).on('dir', function ()
            /* dir */
            {// onsole.log('dir', dir);
            }).on('file', function ()
            /* file */
            {// console.log('file', file);
            }) // only emitted if Github API limit is reached and the zip file is downloaded
            .on('zip', function ()
            /* zipUrl */
            {// console.log('zipUrl', zipUrl);
            }).on('error', function (err) {
              console.error('err', err);
            }).on('end',
            /*#__PURE__*/
            _asyncToGenerator(
            /*#__PURE__*/
            regeneratorRuntime.mark(function _callee4() {
              return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      if (!(process$1.platform === 'win32')) {
                        _context4.next = 3;
                        break;
                      }

                      _context4.next = 3;
                      return downloadPreview(fullPath);

                    case 3:
                      spinner.succeed('Downloaded');
                      console.log("\nYou can now go to your project by using \"cd ".concat(answers.name, "\" and install dependencies with either \"npm install\" or \"yarn install\"\n"));

                    case 5:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee4, this);
            })));
            _context5.next = 15;
            break;

          case 12:
            _context5.prev = 12;
            _context5.t0 = _context5["catch"](3);
            console.log('Aborted');

          case 15:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this, [[3, 12]]);
  }));

  return function generateElectronProject() {
    return _ref4.apply(this, arguments);
  };
}();

var showMenu =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6() {
    var dependenciesInstalled, isCorrectElectronFolder, choices, questions, answers;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (isDev && fs.existsSync('MyGame')) process$1.chdir('MyGame');
            dependenciesInstalled = true;
            isCorrectElectronFolder = false; // check node_modules

            if (!fs.existsSync('./node_modules')) {
              dependenciesInstalled = false;
              console.log("\n".concat(chalk.yellow('Oopsie! Dependencies are not installed!'), "\nPlease install them using ").concat(chalk.underline('npm install'), " or ").concat(chalk.underline('yarn install'), "\n\n"));
            } // check configuration


            if (fs.existsSync('./config.js') && fs.existsSync('./preview.exe')) {
              isCorrectElectronFolder = true;
            }

            choices = []; // if the folder is a valid supported electron project

            if (isCorrectElectronFolder) {
              // and deps are installed
              if (dependenciesInstalled) {
                choices.push({
                  message: 'Preview C2',
                  name: 0
                }, {
                  message: 'Preview C3',
                  name: 1
                });
              } else {
                // but deps not installed
                choices.push({
                  message: 'Install dependencies',
                  name: 6
                });
              }
            } else {
              // if the folder i not a upported electron project
              choices.push({
                message: 'Generate a new Electron project',
                name: 2
              });
            }

            choices.push({
              role: 'separator',
              value: chalk.dim('────')
            }, {
              message: 'View help',
              name: 3
            }, {
              message: 'Report an issue',
              name: 4
            }, {
              message: 'Exit',
              name: 5
            });
            questions = {
              type: 'select',
              name: 'action',
              message: 'What do you want to do?',
              choices: choices
            };
            answers = {};
            _context6.prev = 10;
            _context6.next = 13;
            return enquirer.prompt(questions);

          case 13:
            answers = _context6.sent;

            if (isDev) {
              console.log(answers);
            } // override type if was not previously set


            _context6.t0 = answers.action;
            _context6.next = _context6.t0 === 0 ? 18 : _context6.t0 === 1 ? 20 : _context6.t0 === 2 ? 22 : _context6.t0 === 3 ? 24 : _context6.t0 === 4 ? 26 : _context6.t0 === 5 ? 28 : _context6.t0 === 6 ? 30 : 32;
            break;

          case 18:
            previewC2();
            return _context6.abrupt("break", 34);

          case 20:
            previewC3();
            return _context6.abrupt("break", 34);

          case 22:
            generateElectronProject();
            return _context6.abrupt("break", 34);

          case 24:
            showHelp();
            return _context6.abrupt("break", 34);

          case 26:
            reportAnIssue();
            return _context6.abrupt("break", 34);

          case 28:
            process$1.exit(0);
            return _context6.abrupt("break", 34);

          case 30:
            installDeps();
            return _context6.abrupt("break", 34);

          case 32:
            console.log('unexpected case');
            return _context6.abrupt("break", 34);

          case 34:
            _context6.next = 39;
            break;

          case 36:
            _context6.prev = 36;
            _context6.t1 = _context6["catch"](10);
            console.log('Aborted');

          case 39:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6, this, [[10, 36]]);
  }));

  return function showMenu() {
    return _ref6.apply(this, arguments);
  };
}();

if (isDev) {
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

showMenu(config);
