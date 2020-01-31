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

  build?: BuildSettings;

  profiles?: Record<string, Settings>;
}

export interface ProfileSettings {
  profiles?: Record<string, Settings>;
}

export type Settings = RawSettings & ProfileSettings

export interface CliObject {
  name: string;
  shortcut?: string;
  description?: string;
  default?: string;
  boolean?: boolean;
}

export type moduleRun = (args: mri.Argv, settings: Settings) => Promise<boolean> | boolean
export type hookRun = (hookArguments: unknown) => Promise<boolean>
export type onPreBuild = (args: mri.Argv, settings: any, tmpdir: string)
  => Promise<boolean>
export type onPostBuild = (args: mri.Argv, settings: any, out: string)
  => Promise<boolean>
export type onPostInstaller = (args: mri.Argv, settings: any, folder: string)
  => Promise<boolean>
