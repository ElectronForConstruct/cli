"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskManagerFactory = exports.yarn = void 0;
const path_1 = __importDefault(require("path"));
const listr2_1 = require("listr2");
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
