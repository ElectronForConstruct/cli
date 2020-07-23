"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/index.ts
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fsextra = require('fs-extra'); var _fsextra2 = _interopRequireDefault(_fsextra);
var _glob = require('glob'); var _glob2 = _interopRequireDefault(_glob);
var _terser = require('terser'); var _terser2 = _interopRequireDefault(_terser);
var _slash = require('slash'); var _slash2 = _interopRequireDefault(_slash);
var _utils = require('@cyn/utils');
const config = {
  files: []
};
var src_default = {
  name: "minify",
  tasks: [
    {
      description: "Minify source files",
      name: "minify",
      config,
      run: function run({workingDirectory, taskSettings}) {
        const logger = _utils.createScopedLogger.call(void 0, "minify", {
          interactive: true
        });
        const {files: patterns} = taskSettings;
        logger.info("Minifying...");
        let minified = 0;
        const files = [];
        patterns.forEach((pattern) => {
          const matchedFiles = _glob2.default.sync(pattern, {
            cwd: _slash2.default.call(void 0, workingDirectory),
            nodir: true
          });
          files.push(...matchedFiles.map((file) => _path2.default.resolve(workingDirectory, file)));
        });
        files.forEach((file) => {
          try {
            const fileContent = _fsextra2.default.readFileSync(file, "utf8");
            const {code, error} = _terser2.default.minify(fileContent, {
              toplevel: true,
              compress: true
            });
            if (error) {
              throw error;
            }
            if (!code) {
              throw new Error("Empty code");
            }
            _fsextra2.default.writeFileSync(file, code, "utf8");
            minified += 1;
            logger.await(`Minified ${file}`);
            return true;
          } catch (e) {
            logger.error(`Failed minifying ${file}`);
            return false;
          }
          return true;
        });
        logger.success(`Successfully minified ${minified} files!`);
        return {
          sources: [workingDirectory]
        };
      }
    }
  ]
};


exports.default = src_default;
