import { cosmiconfig } from 'cosmiconfig';
import deepmerge from 'deepmerge';
import path from 'path';
import fs from 'fs-extra';
import {
  ComputedTask,
  taskSettings, ComplexConfig, Settings, ComputedSettings,
} from '../models/index';
import TaskManager from './tasksManager';

const defaultConfigPath = path.join(process.cwd(), 'cyn.yml');

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

  computeSettings(): ComputedSettings {
    const settings: ComputedSettings = {};
    const { tasks } = this._settings;

    if (!tasks) {
      throw new Error('No tasks found');
    }

    const taskEntries = Object.entries(tasks);

    taskEntries.forEach(([taskName, task]) => {
      const computedTask: ComputedTask = { ...task };

      const { steps } = task;
      steps.forEach((step, index) => {
        const { name, config: stepConfig } = step;

        // Check if config key exist
        if (!stepConfig) {
        // if (!config || !config?.[stepConfig]) {
          throw new Error(`No config entry "${name}" found for ${taskName}`);
        }
        // Set default config
        let computedSettings: any = TaskManager.getInstance().get(name)?.config ?? {};

        // Get the default key
        computedSettings = deepmerge.all([computedSettings, stepConfig ?? {}]);

        // Merge default with current profile
        if (this.profile) {
          computedSettings = deepmerge.all(
            [
              computedSettings,
              // @ts-ignore
              stepConfig?.[this.profile] ?? {},
            ],
          );
        }

        // computedSettings = deepmerge.all([]);
        computedTask.steps[index].config = { ...computedSettings };
      });

      // const resolvedConfig = this.resolveConfig(task, config);

      settings[taskName] = { ...task };
    });

    return settings;
  }

  async loadConfig(profile = '', directPath: string = defaultConfigPath): Promise<void> {
    const explorerSync = cosmiconfig('cyn');
    const exists = await fs.pathExists(directPath);
    if (exists) {
      const config = await explorerSync.load(directPath);
      if (config) {
        this.settings = config.config as Partial<Settings>;
        this.path = config.filepath;
        this.profile = profile;
      }
    }
  }
}