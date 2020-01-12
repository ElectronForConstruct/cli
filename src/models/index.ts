import mri from 'mri';
import { Options as BuildSettings } from 'electron-packager';

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
  default?: boolean;
  boolean?: boolean;
}

export interface CynModule {
  id?: string;

  name: string;
  description: string;

  modules?: CynModule[];
  cli?: CliObject[];
  config?: object;

  run: run;
  onPreBuild?: onPreBuild;
  onPostBuild?: onPostBuild;
  onPostInstaller?: onPostInstaller;

  logger?: any;
  iLogger?: any;
  Utils?: any;
}

export type run = (args: mri.Argv, settings: Settings) => Promise<boolean> | boolean
export type onPreBuild = (args: mri.Argv, settings: any, tmpdir: string)
  => Promise<boolean>
export type onPostBuild = (args: mri.Argv, settings: any, out: string)
  => Promise<boolean>
export type onPostInstaller = (args: mri.Argv, settings: any, folder: string)
  => Promise<boolean>
