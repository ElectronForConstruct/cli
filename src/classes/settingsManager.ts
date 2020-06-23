import { cosmiconfig } from 'cosmiconfig';
import deepmerge from 'deepmerge';
import {
  ComputedTask,
  HookSettings, ComplexConfig, Settings, ComputedSettings,
} from '../models/index';

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

  private resolveConfig(
    task: HookSettings,
    config: Record<string, ComplexConfig> | undefined,
  ): unknown {
    const resultConfig = {};

    return resultConfig;
  }

  computeSettings(): ComputedSettings {
    const settings: ComputedSettings = {};
    const { tasks, config } = this._settings;

    if (!tasks) {
      throw new Error('No tasks found');
    }

    const taskEntries = Object.entries(tasks);

    taskEntries.forEach(([taskName, task]) => {
      const computedTask: ComputedTask = { ...task };
      console.log('key', taskName);
      console.log('task', task);

      const { steps } = task;
      steps.forEach((step, index) => {
        console.log('step', step);
        const { name, config: stepConfig } = step;

        // Check if config key exist
        if (!config || (config && !config[stepConfig] && !config[stepConfig].defaults)) {
          throw new Error(`No config entry "${stepConfig}" found for ${taskName}`);
        }
        // Get the default key
        let computedSettings: any = !config[stepConfig].defaults as any;
        // Merge default with current profile
        if (this.profile) {
          computedSettings = deepmerge.all([computedSettings, config[stepConfig][this.profile]]);
        }

        computedSettings = deepmerge.all([]);
        computedTask.steps[index].config = computedSettings;
      });

      // const resolvedConfig = this.resolveConfig(task, config);

      settings[taskName] = task;
    });

    console.log('finalSettings', JSON.stringify(settings, null, 2));

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
