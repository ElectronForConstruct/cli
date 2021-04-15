import dev from './dev'
import packageApp from './package'
import setup from './setup'
import { Plugin } from '@cyn/utils'

export default {
  'tauri/dev': dev,
  'tauri/package': packageApp,
  'tauri/setup': setup
} as Plugin