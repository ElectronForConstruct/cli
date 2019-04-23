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
**/

/**
 * The complete EFC module definition.
 * @typedef {Object} EFCModule
 * @property {string} name - Indicates whether the Courage component is present.
 * @property {string} description
 * @property {Array<EFCModule>} modules
 * @type {Object} cli
 * @property {Object} config
 * @property {run} run
 * @property {onPreBuild} onPreBuild
 * @property {onPostBuild} onPostBuild
 */

/**
 * This is the complete definition of the run command.
 * @typedef {function} run
 * @async
 * @param {Object} args
 * @param {Object} settings
 * @return {boolean}
 */

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
