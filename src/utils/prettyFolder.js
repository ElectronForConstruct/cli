const Console = require('./console');

const log = Console.normal('build');

module.exports = (folders) => {
  for (let i = 0; i < folders.length; i += 1) {
    const folder = folders[i];
    if (i === folders.length - 1) {
      log.log(`└── ${folder}`);
    } else {
      log.log(`├── ${folder}`);
    }
  }
};
