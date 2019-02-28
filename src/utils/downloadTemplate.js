import fs from 'fs';
import shelljs from 'shelljs';
import downloadPreview from './downloadPreview';
import downloadRepo from './downloadRepo';

export default async (fullPath, branch) => {
  await downloadRepo('ElectronForConstruct', 'template', branch, `${fullPath}.tmp`);
  if (!fs.existsSync(fullPath)) shelljs.mkdir(fullPath);
  shelljs.cp('-R', `${fullPath}.tmp/template/*`, fullPath);
  shelljs.rm('-rf', `${fullPath}.tmp`);

  await downloadPreview(fullPath);
};
