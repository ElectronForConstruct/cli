import dev from './dev'
import packageApp from './package'
import setup from './setup'
import { Plugin } from '@cyn/utils'

export default {
  name: 'tauri',
  modules: [
    dev,
    packageApp,
    setup
  ]
} as Plugin