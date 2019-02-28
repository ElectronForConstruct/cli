import path from 'path';
import process from 'process';
import shelljs from 'shelljs';
import zip from 'zip-a-folder';
import generateElectronProject from './generateElectronProject';
import Command from '../Command';
import { isNewTemplateVersionAvailable } from '../updateCheck';

export default class extends Command {
  constructor() {
    super('update', 'Update current template', 'u');
    this.setCategory('Utility');
  }

  async onLoad() {
    const newVersion = await isNewTemplateVersionAvailable();

    if (newVersion) this.name += ` (${newVersion.local} -> ${newVersion.remote})`;
  }

  async run() {
    console.log('Preparing ...');

    const fullDirectoryPath = process.cwd();
    const folderName = path.basename(process.cwd());

    shelljs.cd('..');

    // remove node_modules
    shelljs.rm('-rf', path.join(fullDirectoryPath, 'node_modules'));

    // move files to bak dir
    shelljs.cp('-r', fullDirectoryPath, `${fullDirectoryPath}.bak`);

    // make a zip backup
    await zip.zip(fullDirectoryPath, `${fullDirectoryPath}-${Date.now().toString()}.zip`);

    // remove original folder
    shelljs.rm('-rf', `${fullDirectoryPath}/*`);

    // download new template
    // eslint-disable-next-line
    const config = require(path.join(`${fullDirectoryPath}.bak`, 'config.js'));
    await generateElectronProject(folderName);

    // move new template files to old directory

    shelljs.cp('-R', [
      path.join(`${fullDirectoryPath}.bak`, 'config.js'),
      path.join(`${fullDirectoryPath}.bak`, 'app'),
      path.join(`${fullDirectoryPath}.bak`, 'build'),
    ], fullDirectoryPath);

    // install deps

    // cleanup
    shelljs.rm('-rf', `${fullDirectoryPath}.bak`);

    // profit
  }
}
