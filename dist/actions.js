"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.showMenu = exports.reportAnIssue = exports.showHelp = exports.getPathToConfig = exports.previewC3 = exports.previewC2 = exports.startPreview = exports.installDeps = void 0;

var _enquirer = require("enquirer");

var _child_process = require("child_process");

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _opn = _interopRequireDefault(require("opn"));

var _os = _interopRequireDefault(require("os"));

var _githubDownload = _interopRequireDefault(require("github-download"));

var _request = _interopRequireDefault(require("request"));

var _ora = _interopRequireDefault(require("ora"));

var _chalk = _interopRequireDefault(require("chalk"));

var _process = _interopRequireDefault(require("process"));

var _isDev = _interopRequireDefault(require("./isDev"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var installDeps = function installDeps() {
  var spinner = (0, _ora.default)('Installing dependencies...').start();
  var npm = _process.default.platform === 'win32' ? 'npm.cmd' : 'npm';
  var npmstart = (0, _child_process.spawn)(npm, ['install', '--no-package-lock']);
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

exports.installDeps = installDeps;

var startPreview = function startPreview(url) {
  console.log("Starting preview on \"".concat(url, "\""));
  var npmstart = (0, _child_process.exec)("npm run start -- ".concat(url), {
    cwd: _process.default.cwd()
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

exports.startPreview = startPreview;

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

exports.previewC2 = previewC2;

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
            return (0, _enquirer.prompt)([{
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

exports.previewC3 = previewC3;

var getPathToConfig = function getPathToConfig() {
  return _path.default.join(_process.default.cwd(), 'config.json');
};

exports.getPathToConfig = getPathToConfig;

var showHelp = function showHelp() {
  console.log('To get help, please refer to this link: https://github.com/ElectronForConstruct/template');
};

exports.showHelp = showHelp;

var reportAnIssue = function reportAnIssue() {
  var msg = "\nConfiguration:\n- OS: ".concat(_os.default.platform(), "\n- Arch: ").concat(_os.default.arch(), "\n\nSteps to reproduce: \n- \n  ").trim();
  (0, _opn.default)("https://github.com/ElectronForConstruct/preview-script/issues/new?body=".concat(encodeURI(msg)));
};

exports.reportAnIssue = reportAnIssue;

var generateElectronProject =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3() {
    var dir, questions, answers, fullPath, spinner;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            dir = _process.default.cwd();
            questions = {
              type: 'input',
              name: 'name',
              message: 'What is the name of your project?',
              initial: function initial() {
                return 'MyGame';
              },
              format: function format(name) {
                return _path.default.join(dir, name);
              },
              validate: function validate(name) {
                if (_fs.default.existsSync(_path.default.join(dir, name))) {
                  return 'This path already exist!';
                }

                return true;
              }
            };
            answers = {};
            _context3.prev = 3;
            _context3.next = 6;
            return (0, _enquirer.prompt)(questions);

          case 6:
            answers = _context3.sent;
            fullPath = _path.default.join(dir, answers.name);
            spinner = (0, _ora.default)('Downloading template...').start();
            (0, _githubDownload.default)({
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
            }).on('end', function () {
              var isWin = _process.default.platform === 'win32';
              var isLinux = _process.default.platform === 'linux';
              var isMac = _process.default.platform === 'darwin';
              var name;

              if (isWin) {
                name = 'preview-win.exe';
              } else if (isLinux) {
                name = 'preview-linux';
              } else if (isMac) {
                name = 'preview-macos';
              } else {
                throw new Error('Unknown OS');
              }

              (0, _request.default)({
                url: 'https://api.github.com/repos/ElectronForConstruct/preview-script/releases/latest',
                headers: {
                  'User-Agent': 'ElectronForContruct'
                }
              }, function (error, response, body) {
                var json = JSON.parse(body);
                /* console.log(json);
                                    console.log(json.assets);
                                    console.log(json.assets.find(asset => asset.name === name)); */

                var assetUrl = json.assets.find(function (asset) {
                  return asset.name === name;
                }).browser_download_url;
                (0, _request.default)(assetUrl).pipe(_fs.default.createWriteStream(_path.default.join(fullPath, "preview".concat(isWin ? '.exe' : '')))).on('finish', function () {
                  spinner.succeed('Downloaded');
                  console.log("\nYou can now go to your project by using \"cd ".concat(answers.name, "\" and install dependencies with either \"npm install\" or \"yarn install\"\n"));
                });
              });
            });
            _context3.next = 15;
            break;

          case 12:
            _context3.prev = 12;
            _context3.t0 = _context3["catch"](3);
            console.log('Aborted');

          case 15:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[3, 12]]);
  }));

  return function generateElectronProject() {
    return _ref3.apply(this, arguments);
  };
}();

var showMenu =
/*#__PURE__*/
function () {
  var _ref4 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee4() {
    var dependenciesInstalled, isCorrectElectronFolder, choices, questions, answers;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (_isDev.default) _process.default.chdir('MyGame');
            dependenciesInstalled = true;
            isCorrectElectronFolder = false; // check node_modules

            if (!_fs.default.existsSync('./node_modules')) {
              dependenciesInstalled = false;
              console.log("\n".concat(_chalk.default.yellow('Oopsie! Dependencies are not installed!'), "\nPlease install them using ").concat(_chalk.default.underline('npm install'), " or ").concat(_chalk.default.underline('yarn install'), "\n\n"));
            } // check configuration


            if (_fs.default.existsSync('./config.js') && _fs.default.existsSync('./preview.exe')) {
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
              value: _chalk.default.dim('────')
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
            _context4.prev = 10;
            _context4.next = 13;
            return (0, _enquirer.prompt)(questions);

          case 13:
            answers = _context4.sent;

            if (_isDev.default) {
              console.log(answers);
            } // override type if was not previously set


            _context4.t0 = answers.action;
            _context4.next = _context4.t0 === 0 ? 18 : _context4.t0 === 1 ? 20 : _context4.t0 === 2 ? 22 : _context4.t0 === 3 ? 24 : _context4.t0 === 4 ? 26 : _context4.t0 === 5 ? 28 : _context4.t0 === 6 ? 30 : 32;
            break;

          case 18:
            previewC2();
            return _context4.abrupt("break", 34);

          case 20:
            previewC3();
            return _context4.abrupt("break", 34);

          case 22:
            generateElectronProject();
            return _context4.abrupt("break", 34);

          case 24:
            showHelp();
            return _context4.abrupt("break", 34);

          case 26:
            reportAnIssue();
            return _context4.abrupt("break", 34);

          case 28:
            _process.default.exit(0);

            return _context4.abrupt("break", 34);

          case 30:
            installDeps();
            return _context4.abrupt("break", 34);

          case 32:
            console.log('unexpected case');
            return _context4.abrupt("break", 34);

          case 34:
            _context4.next = 39;
            break;

          case 36:
            _context4.prev = 36;
            _context4.t1 = _context4["catch"](10);
            console.log('Aborted');

          case 39:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, this, [[10, 36]]);
  }));

  return function showMenu() {
    return _ref4.apply(this, arguments);
  };
}();

exports.showMenu = showMenu;