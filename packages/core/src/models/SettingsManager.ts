import { cosmiconfig } from 'cosmiconfig';
import path from 'path';
import fs from 'fs-extra';
import { Settings } from '@cyn/utils';

const defaultConfigPath = path.join(process.cwd(), 'cyn.yml');

export default class SettingsManager {
  private _settings: Settings = {
    input: './src',
  };

  private _path = '';

  // private _profile = ''

  get path(): string {
    return this._path;
  }

  set path(value: string) {
    this._path = value;
  }

  get settings(): Settings {
    return this._settings;
  }

  set settings(value: Settings) {
    this._settings = value;
  }

  /* get profile(): string {
    return this._profile;
  }

  set profile(value: string) {
    this._profile = value;
  } */

  async loadConfig(profile = '', directPath: string = defaultConfigPath): Promise<void> {
    const explorerSync = cosmiconfig('cyn');
    const exists = await fs.pathExists(directPath);
    if (exists) {
      const config = await explorerSync.load(directPath);
      if (config) {
        this.settings = config.config as Settings;
        this.path = config.filepath;
        // this.profile = profile;
      }
    }
  }
}
