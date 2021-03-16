import { Module } from '@cyn/utils';

export default {
  description: 'Package your app',
  id: 'tauri/package',
  config: {
  },

  tasks: [{
    title: 'Package',
    task(ctx, task) {
      task.output = 'OK'
    }
  }]
} as Module
