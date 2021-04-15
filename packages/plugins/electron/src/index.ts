import dev from './dev'
import packageApp from './package'
import setup from './wrap'

import { Plugin } from '@cyn/utils'

export default {
  'electron/dev': dev,
  'electron/package': packageApp,
  'electron/setuptask': setup,
} as Plugin