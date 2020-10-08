"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScopedLogger = exports.createLogger = void 0;
const signale_1 = require("signale");
exports.createLogger = (options) => {
    const log = new signale_1.Signale(options);
    log.config({
        displayLabel: false,
    });
    return log;
};
exports.createScopedLogger = (scope, options = {}) => {
    options.scope = scope;
    return exports.createLogger(options);
};
