const Prompt = require('enquirer');
const ora = require('ora');
const Command = require('../src/Command');
const ConfigLoader = require('../src/ConfigLoader');

const Environment = process.env.NODE_ENV;

module.exports = {
  Command,
  ConfigLoader,
  Prompt,
  Environment,
  Spinner: ora,
};
