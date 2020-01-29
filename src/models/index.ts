import mri from 'mri';
import { Options as BuildSettings } from 'electron-packager';
import { Signale } from 'signale';
import { createLogger } from '../utils/console';
import HooksManager from '../classes/hooksManager';

export interface WindowSettings {
  width: number;
  height: number;
  fullscreen: boolean;
  frame: boolean;
  transparent: boolean;
  toolbar: boolean;
  alwaysOnTop: boolean;
}

export interface DebugSettings {
  showConfig: boolean;
}

export interface DeveloperSettings {
  showConstructDevTools: boolean;
  autoClose: boolean;
  autoReload: boolean;
  showChromeDevTools: boolean;
}

export interface OverlaySettings {
  position: string;
  content: string;
}

export interface ProjectSettings {
  name: string;
  description: string;
  author: string;
  version: string;
}

export interface Settings {
  isProject?: boolean;

  electron?: string;
  errorLogging?: boolean;
  singleInstance?: boolean;
  window?: WindowSettings;
  debug?: DebugSettings;
  developer?: DeveloperSettings;
  overlay?: OverlaySettings;
  project?: ProjectSettings;
  plugins?: string[];
  switches?: string[];

  build?: BuildSettings;
}

export interface CliObject {
  name: string;
  shortcut?: string;
  description?: string;
  default?: string;
  boolean?: boolean;
}

export interface CynModuleWrapper {
  alias: Record<string, string>;
  boolean: string[];
  default: Record<string, string>;
  command: CynModule;
}

export abstract class Hook {
  abstract name: string;

  abstract description: string;

  abstract hookName: string

  abstract run: run;
}

export abstract class CynModule {
  abstract name: string;

  abstract description: string;

  cli?: CliObject[];

  config?: object;

  abstract run: run;

  createLogger(interactive = false): Signale {
    return createLogger({
      scope: this.name,
      interactive,
    });
  }

  dispatchHook(): Promise<boolean> | boolean {
    return HooksManager.getInstance().dispatch();
  }
}

export type run = (args: mri.Argv, settings: Settings) => Promise<boolean> | boolean
export type onPreBuild = (args: mri.Argv, settings: any, tmpdir: string)
  => Promise<boolean>
export type onPostBuild = (args: mri.Argv, settings: any, out: string)
  => Promise<boolean>
export type onPostInstaller = (args: mri.Argv, settings: any, folder: string)
  => Promise<boolean>
