import { cosmiconfig } from 'cosmiconfig';
import { Settings } from '../models';

export default class SettingsManager {
  private static instance: SettingsManager;

  private _settings: Settings = {};

  private _path = '';

  static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

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

  async loadConfig(root: string = process.cwd()): Promise<void> {
    const explorerSync = cosmiconfig('cyn');
    const config = await explorerSync.search(root);
    if (config) {
      this.settings = config.config;
      this.path = config.filepath;
    }
  }
}
