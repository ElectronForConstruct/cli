"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/index.ts


var _signale = require('signale');
const createLogger = (options) => {
  const log = new (0, _signale.Signale)(options);
  log.config({
    displayLabel: false
  });
  return log;
};
const createScopedLogger = (scope, options = {}) => {
  options.scope = scope;
  return createLogger(options);
};



exports.createLogger = createLogger; exports.createScopedLogger = createScopedLogger;
