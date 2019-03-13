const { Command } = require('@efc/core');
const ConfigLoader = require('../src/classes/ConfigLoader');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  Command,
  ConfigLoader,
  isDev: !isProd,
  isProd,
};
