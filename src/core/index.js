const Command = require('./Command');
const ConfigLoader = require('./ConfigLoader');
const PluginManager = require('./PluginManager');
const isDev = require('./isDev');

module.exports = {
  Command,
  PluginManager,
  ConfigLoader,
  isDev,
  isProd: !isDev,
};
