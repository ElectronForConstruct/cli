#!/usr/bin/env node
'use strict';

process.env.NODE_ENV = "production";

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('@babel/polyfill');
var chalk = _interopDefault(require('chalk'));
var boxen = _interopDefault(require('boxen'));
var request = _interopDefault(require('request'));
var semver = _interopDefault(require('semver'));
var enquirer = require('enquirer');
var child_process = require('child_process');
var path = _interopDefault(require('path'));
var fs = _interopDefault(require('fs'));
var zip = _interopDefault(require('zip-a-folder'));
var opn = _interopDefault(require('opn'));
var rimraf = _interopDefault(require('rimraf'));
var os = _interopDefault(require('os'));
var ghdownload = _interopDefault(require('github-download'));
var ora = _interopDefault(require('ora'));
var process$1 = _interopDefault(require('process'));
var tmp = _interopDefault(require('tmp'));
var got = _interopDefault(require('got'));
var eb = require('electron-builder');
var shelljs = _interopDefault(require('shelljs'));

var box = (function (input) {
  return boxen(input, {
    padding: 1,
    margin: 1,
    float: 'center',
    align: 'center',
    borderStyle: 'double'
  });
});

var name = "@electronforconstruct/cli";
var version = "1.0.13";
var description = "A small utility to manage your Construct Electron projects";
var scripts = {
	build: "rollup -c",
	start: "babel-node src/index.js",
	release: "yarn publish --access public"
};
var preferGlobal = true;
var bin = {
	e4c: "dist/bundle.js"
};
var author = "Armaldio <armaldio@gmail.com>";
var license = "MIT";
var dependencies = {
	"@babel/polyfill": "^7.2.5",
	"@babel/runtime": "^7.3.1",
	boxen: "^2.1.0",
	chalk: "^2.4.2",
	"electron-builder": "^20.38.5",
	enquirer: "^2.3.0",
	"github-download": "^0.5.0",
	got: "^9.6.0",
	inquirer: "^6.2.0",
	lowdb: "^1.0.0",
	minimist: "^1.2.0",
	opn: "^5.4.0",
	ora: "^3.0.0",
	request: "^2.88.0",
	rimraf: "^2.6.3",
	semver: "^5.6.0",
	shelljs: "^0.8.3",
	tmp: "^0.0.33",
	"update-check": "^1.5.3",
	uuid: "^3.3.2",
	yargs: "^12.0.5",
	"zip-a-folder": "^0.0.7"
};
var devDependencies = {
	"@babel/cli": "^7.2.3",
	"@babel/core": "^7.2.2",
	"@babel/node": "^7.2.2",
	"@babel/plugin-proposal-class-properties": "^7.3.0",
	"@babel/plugin-proposal-object-rest-spread": "^7.3.1",
	"@babel/plugin-transform-runtime": "^7.2.0",
	"@babel/preset-env": "^7.3.1",
	"babel-loader": "^8.0.5",
	"babel-plugin-transform-runtime": "^6.23.0",
	eslint: "^5.12.1",
	"eslint-config-airbnb": "^17.1.0",
	"eslint-plugin-import": "^2.15.0",
	"eslint-plugin-jsx-a11y": "^6.1.2",
	"eslint-plugin-react": "^7.12.4",
	nodemon: "^1.18.9",
	np: "^4.0.1",
	rollup: "^1.1.2",
	"rollup-plugin-babel": "^4.3.2",
	"rollup-plugin-json": "^3.1.0",
	"rollup-plugin-node-resolve": "^4.0.0",
	webpack: "^4.29.0",
	"webpack-cli": "^3.2.1"
};
var pkg = {
	name: name,
	version: version,
	description: description,
	scripts: scripts,
	preferGlobal: preferGlobal,
	bin: bin,
	author: author,
	license: license,
	dependencies: dependencies,
	devDependencies: devDependencies
};

var checkForUpdate = (function () {
  return new Promise(function (resolve, reject) {
    request('https://api.npms.io/v2/package/@electronforconstruct%2fcli', {
      json: true
    }, function (error, response, body) {
      if (error) reject(error);
      var metadata = body.collected.metadata;
      if (semver.lt(pkg.version, metadata.version)) resolve(metadata);
      resolve(false);
    });
  });
});

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

var npm = process$1.platform === 'win32' ? 'npm.cmd' : 'npm'; // const electron = (process.platform === 'win32' ? 'electron.cmd' : 'npm');

var installDeps =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", new Promise(function (resolve) {
              var spinner = ora('Installing dependencies... This may take a while, relax and take a coffe').start();
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
                resolve(true);
              });
            }));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function installDeps() {
    return _ref.apply(this, arguments);
  };
}();

var startPreview = function startPreview(url) {
  console.log("Starting preview on \"".concat(url, "\""));
  var command;

  if (url) {
    command = "".concat(npm, " run start -- ").concat(url);
  } else {
    command = "".concat(npm, " run start");
  }

  var npmstart = child_process.exec(command, {
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

var previewAppFolder =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            startPreview();

          case 1:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function previewAppFolder() {
    return _ref2.apply(this, arguments);
  };
}();

var previewC2 =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            opn('https://electronforconstruct.netlify.com/intro/using-the-module.html#previewing-a-construct-2-project');

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function previewC2() {
    return _ref3.apply(this, arguments);
  };
}();

var previewC3 =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4() {
    var answers;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            console.log('To preview your Construct 3 project in Electron, you need a valid subscription to Construct 3');
            console.log('Go to the preview menu, hit "Remote preview" and paste the link that appear here');
            _context4.next = 4;
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
            answers = _context4.sent;
            startPreview(answers.url);

          case 6:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function previewC3() {
    return _ref4.apply(this, arguments);
  };
}();

var showHelp =
/*#__PURE__*/
function () {
  var _ref5 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee5() {
    var answers;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            console.log('Version: ', pkg.version);
            console.log('To get help, please refer to this link: https://electronforconstruct.netlify.com');
            _context5.next = 4;
            return enquirer.prompt([{
              type: 'confirm',
              name: 'confirm',
              message: 'Open browser ?'
            }]);

          case 4:
            answers = _context5.sent;

            if (answers.confirm) {
              opn('https://electronforconstruct.netlify.com');
            }

          case 6:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function showHelp() {
    return _ref5.apply(this, arguments);
  };
}();

var reportAnIssue = function reportAnIssue() {
  var msg = "\nConfiguration:\n- OS: ".concat(os.platform(), "\n- Arch: ").concat(os.arch(), "\n\nSteps to reproduce: \n- \n  ").trim();
  opn("https://github.com/ElectronForConstruct/preview/issues/new?body=".concat(encodeURI(msg)));
};

var downloadPreview =
/*#__PURE__*/
function () {
  var _ref6 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee6(fullPath) {
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            return _context6.abrupt("return", new Promise(function (resolve) {
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
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function downloadPreview(_x) {
    return _ref6.apply(this, arguments);
  };
}();

var downloadTemplate =
/*#__PURE__*/
function () {
  var _ref7 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee8(fullPath) {
    var branch,
        _args8 = arguments;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            branch = _args8.length > 1 && _args8[1] !== undefined ? _args8[1] : 'master';
            return _context8.abrupt("return", new Promise(function (resolve) {
              ghdownload({
                user: 'ElectronForConstruct',
                repo: 'template',
                ref: branch
              }, fullPath).on('error', function (err) {
                console.error('err', err);
              }).on('end',
              /*#__PURE__*/
              _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee7() {
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        if (!(process$1.platform === 'win32')) {
                          _context7.next = 3;
                          break;
                        }

                        _context7.next = 3;
                        return downloadPreview(fullPath);

                      case 3:
                        resolve(true);

                      case 4:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7, this);
              })));
            }));

          case 2:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8, this);
  }));

  return function downloadTemplate(_x2) {
    return _ref7.apply(this, arguments);
  };
}();

var generateElectronProject =
/*#__PURE__*/
function () {
  var _ref9 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee9() {
    var projectName,
        answers,
        dir,
        name$$1,
        branch,
        branches,
        choices,
        questions,
        _answers,
        fullPath,
        spinner,
        _args9 = arguments;

    return regeneratorRuntime.wrap(function _callee9$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            projectName = _args9.length > 0 && _args9[0] !== undefined ? _args9[0] : null;
            answers = {};
            dir = process$1.cwd();
            name$$1 = projectName;
            branch = 'master';
            _context9.prev = 5;

            if (projectName) {
              _context9.next = 25;
              break;
            }

            branches = [];
            _context9.prev = 8;
            _context9.next = 11;
            return got('https://api.github.com/repos/electronforconstruct/template/branches', {
              json: true
            });

          case 11:
            branches = _context9.sent;
            _context9.next = 17;
            break;

          case 14:
            _context9.prev = 14;
            _context9.t0 = _context9["catch"](8);
            console.log(_context9.t0);

          case 17:
            choices = branches.body.map(function (b) {
              return {
                message: b.name === 'master' ? chalk.green("".concat(b.name, " (recommended)")) : chalk.yellow(b.name),
                name: b.name,
                value: b.name
              };
            });
            questions = [{
              type: 'select',
              name: 'branch',
              message: 'What channel do you want to use ?',
              initial: 'master',
              choices: choices,
              result: function result() {
                return this.focused.value;
              }
            }, {
              type: 'input',
              name: 'name',
              message: 'What is the name of your project?',
              initial: function initial() {
                return 'MyGame';
              },
              format: function format(typedName) {
                return path.join(dir, typedName);
              },
              validate: function validate(typedName) {
                if (fs.existsSync(path.join(dir, typedName))) {
                  return 'This path already exist!';
                }

                return true;
              }
            }];
            _context9.next = 21;
            return enquirer.prompt(questions);

          case 21:
            answers = _context9.sent;
            _answers = answers;
            name$$1 = _answers.name;
            branch = _answers.branch;

          case 25:
            fullPath = path.join(dir, name$$1);
            spinner = ora("Downloading template from ".concat(branch, " channel...")).start();
            _context9.next = 29;
            return downloadTemplate(fullPath);

          case 29:
            spinner.succeed('Downloaded');
            if (!projectName) console.log("\nYou can now go to your project by using ".concat(chalk.underline("cd ".concat(name$$1)), " and install dependencies with either ").concat(chalk.underline('npm install'), " or ").concat(chalk.underline('yarn install')));
            _context9.next = 36;
            break;

          case 33:
            _context9.prev = 33;
            _context9.t1 = _context9["catch"](5);
            console.log('Aborted');

          case 36:
          case "end":
            return _context9.stop();
        }
      }
    }, _callee9, this, [[5, 33], [8, 14]]);
  }));

  return function generateElectronProject() {
    return _ref9.apply(this, arguments);
  };
}();

var updateApp =
/*#__PURE__*/
function () {
  var _ref10 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee10() {
    var fullDirectoryPath, folderName, tmpobj;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            tmp.setGracefulCleanup();
            shelljs.set('-v');
            fullDirectoryPath = process$1.cwd();
            folderName = path.basename(process$1.cwd());
            shelljs.cd('..'); // create a temporary directory for saving files

            tmpobj = tmp.dirSync();
            console.log('Creating temp directory: ', tmpobj.name); // move files to it (config.js + app folder)

            shelljs.cp('-r', path.join(fullDirectoryPath, 'config.js'), path.join(fullDirectoryPath, 'app'), tmpobj.name);
            console.log("Moving config.js + app folder to ".concat(tmpobj.name)); // make a backup
            // shelljs.mv(`${fullDirectoryPath}/**`, `${fullDirectoryPath}_backup`);

            _context10.next = 11;
            return zip.zip(fullDirectoryPath, "".concat(fullDirectoryPath, ".zip"));

          case 11:
            console.log("Making a backup to ".concat(fullDirectoryPath, ".zip"));
            rimraf(fullDirectoryPath, function (a, b, c) {
              console.log(a, b, c);
            });
            console.log("Removing ".concat(folderName)); // remove folder
            // shelljs.rm('-r', fullDirectoryPath);
            // download new template
            // await generateElectronProject(folderName);
            // move new template files to old directory
            // install deps
            // move saved files in temp to old directory
            // profit
            // tmpobj.removeCallback();

          case 14:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10, this);
  }));

  return function updateApp() {
    return _ref10.apply(this, arguments);
  };
}();

var exit = function exit() {};

var build =
/*#__PURE__*/
function () {
  var _ref11 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee11() {
    var config, result;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            if (!(!fs.existsSync(path.join(process$1.cwd(), 'app', 'data.js')) && !fs.existsSync(path.join(process$1.cwd(), 'app', 'data.json')))) {
              _context11.next = 4;
              break;
            }

            console.warn('It seems that there ins\'t any Construct game inside the app folder. Did you forgot to export ?');
            _context11.next = 15;
            break;

          case 4:
            _context11.prev = 4;
            // eslint-disable-next-line
            config = require(path.join(process$1.cwd(), 'config.js'));
            _context11.next = 8;
            return eb.build(config.buil);

          case 8:
            result = _context11.sent;
            console.log(result);
            _context11.next = 15;
            break;

          case 12:
            _context11.prev = 12;
            _context11.t0 = _context11["catch"](4);
            console.log('There was an error building your project:', _context11.t0);

          case 15:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11, this, [[4, 12]]);
  }));

  return function build() {
    return _ref11.apply(this, arguments);
  };
}(); // eslint-disable-next-line


var showMenu =
/*#__PURE__*/
function () {
  var _ref12 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee12() {
    var dependenciesInstalled, isCorrectElectronFolder, choices, questions, answers, actions;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            if (isDev && fs.existsSync('MyGame')) process$1.chdir('MyGame');
            dependenciesInstalled = true;
            isCorrectElectronFolder = false; // check configuration

            if (fs.existsSync('./config.js')) {
              isCorrectElectronFolder = true; // check node_modules

              if (!fs.existsSync('./node_modules')) {
                dependenciesInstalled = false;
                console.log(box("".concat(chalk.yellow('Whoops! Dependencies are not installed!'), "\nPlease install them using ").concat(chalk.underline('npm install'), " or ").concat(chalk.underline('yarn install'))));
              }
            }

            choices = []; // if the folder is a valid supported electron project

            if (isCorrectElectronFolder) {
              // and deps are installed
              if (dependenciesInstalled) {
                choices.push({
                  name: 'Preview with',
                  disabled: '>',
                  choices: [{
                    name: 'Construct 2',
                    value: 0
                  }, {
                    name: 'Construct 3',
                    value: 1
                  }, {
                    name: 'Exported project',
                    value: 10
                  }]
                }, {
                  name: 'Build',
                  value: 9
                }
                /* {
                  message: 'Update app',
                  name: 7,
                }, */
                );
              } else {
                // but deps not installed
                choices.push({
                  name: 'Dependencies must be installed first!',
                  value: 6,
                  disabled: true
                });
              }
            } else {
              // if the folder i not a upported electron project
              choices.push({
                name: 'Generate a new Electron project',
                value: 2
              });
            }

            choices.push({
              role: 'separator',
              value: chalk.dim('────')
            }, {
              name: 'View help',
              value: 3
            }, {
              name: 'Report an issue',
              value: 4
            }, {
              name: 'Donate',
              value: 8
            }, {
              name: 'Exit',
              value: 5
            });
            questions = {
              type: 'select',
              name: 'action',
              message: 'What do you want to do?',
              choices: choices,
              result: function result() {
                return this.focused;
              }
            };
            answers = {};
            _context12.prev = 9;
            _context12.next = 12;
            return enquirer.prompt(questions);

          case 12:
            answers = _context12.sent;
            actions = [[0, previewC2], [1, previewC3], [2, generateElectronProject], [3, showHelp], [4, reportAnIssue], [5, exit], [6, installDeps], [7, updateApp], [8, function () {
              return opn('https://armaldio.xyz/#/donations');
            }], [9, build], [10, previewAppFolder]];
            console.log(); // just crlf

            _context12.next = 17;
            return actions.find(function (a) {
              return a[0] === answers.action.value;
            })[1]();

          case 17:
            _context12.next = 22;
            break;

          case 19:
            _context12.prev = 19;
            _context12.t0 = _context12["catch"](9);
            console.log('Aborted:', _context12.t0);

          case 22:
            console.log(box('Happy with ElectronForConstruct ? ► Donate: https://armaldio.xyz/#/donations ♥'));

          case 23:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12, this, [[9, 19]]);
  }));

  return function showMenu() {
    return _ref12.apply(this, arguments);
  };
}();

if (isDev) {
  console.log('Running in developement mode');
} // } else {
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


checkForUpdate().then(function (update) {
  if (update) {
    console.log(box("\n  ".concat(chalk.redBright('You are using an outdated version of this tool'), "\n      \n  The latest version is ").concat(chalk.yellow.bold.underline(update.version), ".\n  Update using ").concat(chalk.reset.bold.underline("npm i -g ".concat(update.name)))));
  }

  showMenu();
}).catch(function (e) {
  console.error("Failed to check for updates: ".concat(e));
});
