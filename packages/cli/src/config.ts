import { cosmiconfig } from 'cosmiconfig';
import path from 'path';
import fs from 'fs-extra';

const defaultConfigPath = path.join(process.cwd(), 'cyn.yml');

// eslint-disable-next-line import/prefer-default-export
export const loadConfig = async (
  directPath: string = defaultConfigPath,
) => {
  const explorerSync = cosmiconfig('cyn');
  const exists = await fs.pathExists(directPath);
  if (!exists) {
    throw new Error('Config not found');
  } else {
    const config = await explorerSync.load(directPath);
    if (!config) {
      throw new Error('Config can\t be loaded');
    } else {
      return config;
    }
  }
};
