export interface Asset {
  name: string
  // eslint-disable-next-line camelcase
  browser_download_url: string
}
export interface GHRelease {
  assets: Asset[]
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

export interface InternalSettings {
  settings: Settings
  configFilePath: string
}

export interface HookStep {
  name: string
  config: string
}

export interface HookSettings {
  description: string
  // steps: (string | HookStep)[]
  steps: HookStep[]
}

export type HooksSettings = Record<string, HookSettings>

export interface ComplexConfig {
  defaults: unknown
  [index: string]: unknown
}

export type SimpleConfig = unknown

export interface Settings {
  config: Record<string, ComplexConfig>
  // config: Record<string, SimpleConfig> | Record<string, ComplexConfig>

  tasks?: HooksSettings
}

export interface ComputedSettings {
  [task: string]: {
    description: string;
    steps: {
      name: string;
      config: unknown
    }[]
  }
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

export interface RunArguments {
  workingDirectory: string
  settings: unknown
  hookSettings: unknown
}

export interface hookRunResult {
  error?: Error,
  sources: string[]
}
