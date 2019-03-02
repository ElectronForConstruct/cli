const ghdownload = require('github-download');

module.exports = (user, repo, branch, outputDir) => new Promise((resolve, reject) => {
  ghdownload({
    user,
    repo,
    ref: branch,
  }, outputDir)
    .on('error', (err) => {
      reject(err);
    })
    .on('end', () => {
      resolve(outputDir);
    });
});
