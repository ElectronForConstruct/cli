module.exports = {
  name: 'debug',
  description: 'Show current configuration',

  run(args, config) {
    console.log(config);
  },
};
