import * as path from 'path';
import { promisify } from 'util';

// eslint-disable-next-line
// @ts-ignore
import ghTree from 'github-trees';

// eslint-disable-next-line
// @ts-ignore
import GithubContent from 'github-content';
import fs from 'fs-extra';

function getFiles(owner: string, repo: string, paths: string[]) {
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
}: { owner: string; repo: string; directory: string; outputPath: string; options?: object }) {
  const { tree }: {
    tree: {
      path: string;
      type: string;
    }[];
  } = await ghTree(owner, repo, {
    recursive: true,
  });

  const paths = tree
    .filter((node) => node.path.startsWith(directory) && node.type === 'blob')
    .map((node) => node.path);

  const files = await getFiles(owner, repo, paths);

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];

    const filepath = path.join(outputPath, file.path);
    await fs.ensureDir(path.dirname(filepath));

    fs.writeFileSync(filepath, file.contents, 'utf-8');
  }

  return path.join(outputPath, directory);
}

export default download;
