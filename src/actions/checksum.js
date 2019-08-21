const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const log = require('../utils/console')
  .normal('checksum');

const generateChecksum = (str, algorithm, encoding) => crypto
  .createHash(algorithm || 'md5')
  .update(str, 'utf8')
  .digest(encoding || 'hex');
/**
 * @type EFCModule
 */
module.exports = {
  name: 'checksum',
  cli: [],
  description: 'Check if files are not changed before running your game',
  config: {
    filename: 'checksum',
    files: [],
  },
  async onPreBuild(args, settings, tmpdir) {
    const { checksum: checksumSettings } = settings;
    const { files } = checksumSettings;

    const checksums = [];

    files.forEach((file) => {
      const filepath = path.join(tmpdir, file);
      console.log(filepath);
      const content = fs.readFileSync(filepath, 'utf8');
      const checksum = generateChecksum(content);
      checksums.push({ file, checksum });
    });

    fs.writeFileSync(path.join(tmpdir, checksumSettings.filename), JSON.stringify(checksums, null, '  '), 'utf8');
  },
  /**
   * @param args
   * @param {Settings} settings
   * @return {Promise<void>}
   */
  async run(/* args, settings */) {
  },
};
