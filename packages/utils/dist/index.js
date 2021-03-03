"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = exports.TaskManagerFactory = exports.yarn = exports.createScopedLogger = exports.createLogger = void 0;
const signale_1 = require("signale");
const path_1 = __importDefault(require("path"));
const listr2_1 = require("listr2");
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
exports.yarn = path_1.default.join(__dirname, '..', 'lib', 'yarn.js');
function TaskManagerFactory(override) {
    const myDefaultOptions = {
        concurrent: false,
        exitOnError: false,
        rendererOptions: {
            collapse: false,
            collapseSkips: false
        }
    };
    return new listr2_1.Manager({ ...myDefaultOptions, ...override });
}
exports.TaskManagerFactory = TaskManagerFactory;
class Task {
    constructor() {
        this.config = {};
    }
}
exports.Task = Task;
