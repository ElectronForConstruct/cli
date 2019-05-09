function hookStdout(callback) {
  const oldWrite = process.stdout.write;

  process.stdout.write = (function (write) {
    return function (string, encoding, fd) {
      // eslint-disable-next-line
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
    const fs = require('fs');
    const path = require('path');
    const io = require('socket.io');

    const homedir = require('os').homedir();
    const logger = require('../utils/console').normal('ui');

    const tokenFile = 'efc.conf';
    const identFile = JSON.parse(fs.readFileSync(path.join(homedir, tokenFile)));

    //          efc
    const ioSocket = io.listen(56342, () => {
      logger.log('listening on *:56342');
    });

    ioSocket.of(identFile.uid).on('connection', (socket) => {
      const unhook = hookStdout((string, encoding, fd) => {
        socket.emit('log', string);
      });

      logger.log('You are connected');

      socket.on('disconnect', () => {
        logger.log('You are disconnected');
        unhook();
      });

      socket.on('build', async () => {
        const build = this.modules.find(m => m.name === 'build');

        if (typeof build.run === 'function') {
          try {
            await build.run(args, settings);
            socket.emit('buildDone');
          } catch (e) {
            logger.fatal('Task aborted! Some task did not complete succesfully', e);
          }
        }
      });
    });
  },
};
