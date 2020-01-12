// https://github.com/mozilla/node-convict

import convict from 'convict';

convict.addFormat({
  name: 'string-array',
  validate(val) {
    if (!Array.isArray(val)) {
      throw new Error('must be of type Array');
    }
    return val.every((v) => typeof v === 'string');
  },
});

export default convict({
  electron: {
    format: String,
    default: '6.0.1',
    doc: 'The version of electron to use',
  },
  errorLogging: {
    format: Boolean,
    default: true,
  },
  singleInstance: {
    format: Boolean,
    default: false,
  },
  window: {
    width: {
      format: Number,
      default: 800,
    },
    height: {
      format: Number,
      default: 600,
    },
    fullscreen: {
      format: Boolean,
      default: false,
    },
    frame: {
      format: Boolean,
      default: true,
    },
    transparent: {
      format: Boolean,
      default: false,
    },
    toolbar: {
      format: Boolean,
      default: true,
    },
    alwaysOnTop: {
      format: Boolean,
      default: false,
    },
  },
  debug: {
    showConfig: {
      format: Boolean,
      default: false,
    },
  },
  developer: {
    showConstructDevTools: {
      format: Boolean,
      default: true,
    },
    autoClose: {
      format: Boolean,
      default: true,
    },
    autoReload: {
      format: Boolean,
      default: true,
    },
    showChromeDevTools: {
      format: Boolean,
      default: true,
    },
    overlay: {
      display: {
        format: Boolean,
        default: false,
      },
      position: {
        format: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        default: 'top-left',
      },
      content: {
        format: String,
        default: '',
      },
    },
  },
  project: {
    name: {
      format: String,
      default: 'MyName',
    },
    description: {
      format: String,
      default: 'MyDescription',
    },
    author: {
      format: String,
      default: 'Me',
    },
    version: {
      format: String,
      default: '0.0.0',
    },
  },
  switches: {
    format: 'string-array',
    default: [],
  },
});
