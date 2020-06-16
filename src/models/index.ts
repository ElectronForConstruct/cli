import mri from 'mri';
import { Options as BuildSettings } from 'electron-packager';

export interface Asset {
  name: string;
  browser_download_url: string;
}
export interface GHRelease {
  assets: Asset[];
}

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

export interface InternalSettings {
  settings: Settings;
  configFilePath: string;
}

export interface HookSettings {
  step: string;
  config: any;
}

export type BaseHookSettings = Record<string, (HookSettings | string)[]>
export type ComputedBaseHookSettings = Record<string, HookSettings[]>

export type HooksSettings = BaseHookSettings

export interface RawSettings {
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

  profiles?: Record<string, Settings>;

  on?: HooksSettings;
}

export interface ComputedRawSettings {
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

  on?: ComputedBaseHookSettings;
}

export interface ProfileSettings {
  profiles?: Record<string, Settings>;
}

export type Settings = RawSettings & ProfileSettings

export interface SetupDirOptions {
  clearCache?: boolean;
}

export interface CliObject {
  name: string;
  shortcut?: string;
  description?: string;
  default?: string;
  boolean?: boolean;
}

export type moduleRun = (args: mri.Argv) => Promise<boolean> | boolean
export type hookRun = (hookArguments: unknown) => Promise<boolean>
export type onPreBuild = (args: mri.Argv, tmpdir: string)
  => Promise<boolean>
export type onPostBuild = (args: mri.Argv, out: string)
  => Promise<boolean>
export type onPostInstaller = (args: mri.Argv, folder: string)
  => Promise<boolean>
