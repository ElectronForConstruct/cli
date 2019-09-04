const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const ghTree = require('github-trees');
const GithubContent = require('github-content');
const shelljs = require('shelljs');

function getFiles(owner, repo, paths) {
  const client = new GithubContent({
    owner,
    repo,
    branch: 'master',
  });

  // Call with client as `this`
  return promisify(client.files)
    .call(client, paths);
}

async function download({
  owner, repo, directory, outputPath, options = {},
}) {
  const { tree } = await ghTree(owner, repo, {
    recursive: true,
  });

  const paths = tree
    .filter((node) => node.path.startsWith(directory) && node.type === 'blob')
    .map((node) => node.path);

  const files = await getFiles(owner, repo, paths);

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];

    const filepath = path.join(outputPath, file.path);
    shelljs.mkdir('-p', path.dirname(filepath));

    fs.writeFileSync(filepath, file.contents, 'utf-8');
  }

  return path.join(outputPath, directory);
}

module.exports = download;
