import { Module } from '@cyn/utils';

export default class extends Module<any, any> {
  description = 'Package your app'

  inputs = {}

  run(ctx: any) {
      console.log('ok')
  }
}
