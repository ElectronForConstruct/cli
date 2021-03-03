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

export interface TaskStep<T = unknown> {
  name: string
  config: T
}

export interface taskSettings {
  description: string
  // steps: (string | TaskStep)[]
  steps: TaskStep[]
}

export type TasksSettings = Record<string, taskSettings>

export interface ComplexConfig {
  [index: string]: unknown
}

export type SimpleConfig = unknown

export interface Settings {
  // config: Record<string, ComplexConfig>
  // config: Record<string, SimpleConfig> | Record<string, ComplexConfig>

  tasks?: TasksSettings
  // extends?: string[]
  plugins?: string[]

  // Root source folder
  input: string;
}

export interface InternalSettings {
  settings: Settings
  configFilePath: string
}

export interface ComputedTask {
  description: string;
  steps: {
    name: string;
    config: unknown
  }[]
}

export interface ComputedSettings {
  [task: string]: ComputedTask
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
  p: string;
  profile: string

  c: string;
  config: string

  d: boolean
  debug: boolean

  w: boolean
  watch: boolean
}
