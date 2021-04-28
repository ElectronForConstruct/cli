// eslint-disable-next-line max-classes-per-file
import { Ctx, AModule, Settings } from '@cyn/utils';
import { Step as CoreStep } from '@cyn/core/dist/models/step';
import { Command as CoreCommand } from '@cyn/core/dist/models/command';
import { Core as CoreCore } from '@cyn/core';

export interface CLICtx extends Ctx {
  outputs: Record<string, any>
}

export class CLIStep<Input, Output> extends CoreStep<Input, Output> {
  id: string;

  constructor(plugin: AModule<Input, Output>, id: string, settings: Settings) {
    super(plugin, settings);

    this.id = id;
  }
}

export class CLICommand extends CoreCommand {
  createCLIStep<I, O>(module: AModule<I, O>, id: string) {
    const step = new CLIStep<I, O>(module, id, this.settings);
    return step;
  }
}

export class CLICore extends CoreCore {
  createCLICommand(name: string) {
    return new CLICommand(name, this.settings);
  }
}

export interface WindowSettings {
  width: number
  height: number
  fullscreen: boolean
  frame: boolean
  transparent: boolean
  toolbar: boolean
  alwaysOnTop: boolean
}

export interface DebugSettings {
  showConfig: boolean
}

export interface DeveloperSettings {
  showConstructDevTools: boolean
  autoClose: boolean
  autoReload: boolean
  showChromeDevTools: boolean
}

export interface OverlaySettings {
  position: string
  content: string
}

export interface ProjectSettings {
  name: string
  description: string
  author: string
  version: string
}

export interface ComplexConfig {
  [index: string]: unknown
}

export type SimpleConfig = unknown

export interface InternalSettings {
  settings: Settings
  configFilePath: string
}

export interface SetupDirOptions {
  clearCache?: boolean
}

export interface CliObject {
  name: string
  shortcut?: string
  description?: string
  default?: string
  boolean?: boolean
}

export interface Args {
  // p: string;
  // profile: string

  c: string;
  config: string

  d: boolean
  debug: boolean

  w: boolean
  watch: boolean
}
