import dev from './dev'
import packageApp from './package'
import setup from './wrap'

import { Plugin } from '@cyn/core'

export default {
  Dev: dev,
  Package: packageApp,
  SetupTask: setup,
} as Plugin