const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

async function npmStart() {
  const { stdout, stderr } = await exec('npm run start -- ' + process.argv[2], {
    cwd: path.dirname(process.execPath)
  });
  console.log('stdout:', stdout);
  console.log('----------------------------------------------------');
  console.log('stderr:', stderr);
  console.log('----------------------------------------------------');
}

(async () => {
  try {
    await npmStart();
  } catch (e) {
    console.log("Error", e);
  }
  require('readline')
    .createInterface(process.stdin, process.stdout)
    .question('Press [Enter] to exit...', function () {
      process.exit();
    });
})();
