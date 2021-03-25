import dev from './dev'
import packageApp from './package'
import setup from './wrap'

import { Plugin } from '@cyn/utils'

export default {
  name: 'electron',
  modules: [
    dev,
    packageApp,
    setup,
  ]
} as Plugin