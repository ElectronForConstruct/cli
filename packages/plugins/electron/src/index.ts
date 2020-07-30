import dev from './dev'
import packageApp from './package'
import setup from './setup'

export default {
  name: 'electron',
  tasks: [
    dev,
    packageApp,
    setup,
  ]
}