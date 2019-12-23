import mri = require("mri");

/**
 * @typedef {Object} Settings
 * @property {string} electron
 * @property {boolean} errorLogging
 * @property {boolean} singleInstance
 * @property {Object} window
 * @property {number} window.width
 * @property {number} window.height
 * @property {boolean} window.fullscreen
 * @property {boolean} window.frame
 * @property {boolean} window.transparent
 * @property {boolean} window.toolbar
 * @property {boolean} window.alwaysOnTop
 * @property {Object} debug
 * @property {boolean} debug.showConfig
 * @property {Object} developer
 * @property {boolean} developer.showConstructDevTools
 * @property {boolean} developer.autoClose
 * @property {boolean} developer.autoReload
 * @property {boolean} developer.showChromeDevTools
 * @property {Object} overlay
 * @property {string} overlay.position
 * @property {string} overlay.content
 * @property {Object} project
 * @property {string} project.name
 * @property {string} project.description
 * @property {string} project.author
 * @property {string} project.version
 * @property {Array<string>} plugins,
 * @property {Array<string>} switches,
 *
 * Build
 *
 * @property {Object} build
 * @property {string} build.dir
 * @property {boolean} build.asar
 * @property {string} build.icon
 * @property {string} build.out
 * @property {boolean} build.overwrite
 * @property {Array<string>} build.extraResource
 * @property {Array<string>} build.ignore
 * @property {Object} build.win32metadata
 *
 * Installer
 *
 * @property {Object} installer
 * @property {Object} installer.directories
 *
 * Greenworks
 *
 * @property {Object} greenworks
 * @property {number} greenworks.steamId
 * @property {string} greenworks.sdkPath
 * @property {string} greenworks.localGreenworksPath
 * @property {boolean} greenworks.forceClean
 *
 * Minify
 *
 * @property {Object} minifier
 * @property {Array<string>} ignore,
 * */

export interface CliObject {
  name: string,
  shortcut: string,
  description: string,
  default: boolean
  boolean: boolean
}

export interface EFCModule {
  id?: string
  
  name: string
  description: string

  modules?: EFCModule[]
  cli?: CliObject[]
  config?: object
  run: run
  // onPreBuild: onPreBuild
  // onPostBuild: onPostBuild

  logger?: any
  iLogger?: any
  Utils?: any
}

export type run = (args: mri.Argv, settings: any) => Promise<void>|Promise<boolean>

/**
 * This is the complete definition of the onPreBuild hook.
 * @typedef {function} onPreBuild
 * @async
 * @param {Object} args
 * @param {Object} settings
 * @param {string} tmpdir
 * @return {boolean}
 */

/**
 * This is the complete definition of the onPostBuild hook.
 * @typedef {function} onPostBuild
 * @async
 * @param {Object} args
 * @param {Object} settings
 * @param {string} out
 * @return {boolean}
 */
