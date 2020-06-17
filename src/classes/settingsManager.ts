import { cosmiconfig } from 'cosmiconfig';
import deepmerge from 'deepmerge';
import { Settings, ComputedRawSettings } from '../models';

export default class SettingsManager {
  private static instance: SettingsManager

  private _settings: Partial<Settings> = {};

  private _path = '';

  private _profile = ''

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

  get settings(): Partial<Settings> {
    return this._settings;
  }

  set settings(value: Partial<Settings>) {
    this._settings = value;
  }

  get profile(): string {
    return this._profile;
  }

  set profile(value: string) {
    this._profile = value;
  }

  computeSettings(): Partial<ComputedRawSettings> {
    let settings: Partial<ComputedRawSettings> = {};
    const { profiles, on, ...rest } = this._settings;
    if (this.profile && profiles) {
      settings = deepmerge.all([rest, profiles[this.profile]]);
    } else {
      settings = rest;
    }

    if (this._settings.on) {
      settings.on = {};
      const hooks = Object.entries(this._settings.on);
      hooks.forEach(([key, hook]) => {
        const { steps } = hook;

        // @ts-ignore
        settings.on[key] = {};
        settings.on[key].description = hook.description;
        settings.on[key].steps = [];

        steps.forEach((step) => {
          // if (typeof step === 'string') {
          //   // @ts-ignore
          //   settings.on[key].steps.push({
          //     config: {},
          //     step,
          //   });
          // } else {
          // @ts-ignore
          settings.on[key].steps.push(step);
          // }
        });
      });
    }

    return settings;
  }

  async loadConfig(profile = '', root: string = process.cwd()): Promise<void> {
    const explorerSync = cosmiconfig('cyn');
    const config = await explorerSync.search(root);
    // console.log('config', config);
    if (config) {
      this.settings = config.config as Partial<Settings>;
      this.path = config.filepath;
      this.profile = profile;
    }
  }
}
