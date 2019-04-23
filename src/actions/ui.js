const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || false;

function hookStdout(callback) {
  const oldWrite = process.stdout.write;

  process.stdout.write = (function (write) {
    return function (string, encoding, fd) {
      write.apply(process.stdout, arguments);
      callback(string, encoding, fd);
    };
  }(process.stdout.write));

  return function () {
    process.stdout.write = oldWrite;
  };
}

/**
 * @type EFCModule
 */
module.exports = {
  name: 'ui',
  description: 'Super secret command ;)',

  async run(args, settings) {
    const express = require('express');

    const app = express();
    const http = require('http').Server(app);
    const io = require('socket.io')(http);

    const logger = require('../utils/console').normal('ui');

    if (!isDev) {
      app.use(express.static(path.join(__dirname, '..', '..', 'dist-dashboard')));
    }

    io.on('connection', (socket) => {
      const unhook = hookStdout((string, encoding, fd) => {
        socket.emit('log', string);
      });

      logger.log('an user connected');

      socket.on('disconnect', () => {
        logger.log('user disconnected');
        unhook();
      });

      socket.on('build', async () => {
        const build = this.modules.find(m => m.name === 'build');

        if (typeof build.run === 'function') {
          const done = await build.run(args, settings);
          if (!done) {
            logger.fatal('Task aborted! Some task did not complete succesfully');
          }
        }
      });
    });

    //          efc
    http.listen(56342, () => {
      logger.log('listening on *:56342');
    });
  },
};
