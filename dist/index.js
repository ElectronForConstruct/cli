'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var chalk = _interopDefault(require('chalk'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var deepmerge = require('deepmerge');
var deepmerge__default = _interopDefault(deepmerge);
var enquirer = _interopDefault(require('enquirer'));

class Command {
  /**
   * @param {string} id
   * @param {string} name
   * @param {string} shortcut
   */
  constructor(id, name, shortcut) {
    this.name = name;
    this.id = id;
    this.shortcut = shortcut;

    if (this.shortcut) {
      const index = this.name.toLowerCase().indexOf(this.shortcut);
      if (index !== -1) {
        this.name = this.name.replace(new RegExp(this.name[index], 'igm'), `${chalk.underline('$&')}`);
      }
    }

    this.category = 'Other';
    this.config = {};

    /** @type {Array<Command>} */
    this.modules = [];
  }

  /**
   * Set the category of the plugin
   * @param {string} category
   */
  setCategory(category) {
    this.category = category;
  }

  /**
   * Set the configuration context for the plugin
   * @param config
   */
  setConfig(config) {
    this.config = config;
  }

  /**
   * Set loaded modules
   * @param modules
   */
  setModules(modules) {
    this.modules = modules;
  }

  show() {
    return this.config.isReady && this.config.isElectron;
  }

  onLoad() {
    // do nothing
  }

  /**
   * Used to determine if the class is valid when loading commands
   * @returns {boolean}
   */
  isValid() {
    return true;
  }

  async run() {
    throw new Error('You must define an async run command!');
  }
}

var defaultConfig = {
  window: {
    width: 800,
    height: 600,
    fullscreen: false,
    frame: true,
    transparent: false,
    toolbar: true,
    alwaysOnTop: false,
  },
  developer: {
    showConstructDevTools: true,
    autoClose: true,
    autoReload: true,
    showChromeDevTools: true,
  },
  project: {
    name: 'My name',
    description: 'My description',
    author: 'Me',
    branch: 'master',
  },
  type: 'construct3',
  switches: [],
  build: {
    appId: 'com.you.yourapp',
    productName: 'YourAppName',
    copyright: 'Copyright © 2018 You',
    directories: {
      buildResources: 'build',
      output: 'dist',
    },
    mac: {
      category: 'public.app-category.developer-tools (see: http://lnk.armaldio.xyz/AppleCategoryList)',
      target: 'default',
    },
    win: {
      target: [
        {
          target: 'nsis',
          arch: [
            'x64',
            'ia32',
          ],
        },
        {
          target: 'portable',
          arch: [
            'x64',
            'ia32',
          ],
        },
      ],
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      perMachine: true,
    },
  },
};

class ConfigLoader {
  /**
   * Load and merge config files
   * @async
   * @returns {Promise<Object>}
   */
  async load() {
    let customConfig = {};
    if (fs.existsSync(path.join(process.cwd(), 'config.js'))) {
      // eslint-disable-next-line
      customConfig = require(path.join(process.cwd(), 'config.js'));
    }

    const overwriteMerge = (destinationArray, sourceArray) => sourceArray;
    return deepmerge__default(defaultConfig, customConfig, { arrayMerge: overwriteMerge });
  }
}

// eslint-disable-next-line

exports.Prompt = enquirer;
exports.Command = Command;
exports.ConfigLoader = ConfigLoader;
