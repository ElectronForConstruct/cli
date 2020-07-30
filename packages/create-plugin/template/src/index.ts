import { createScopedLogger } from '@cyn/utils';

interface Config {
  key1: string[];
  key2: number;
}

const config: Config = {
  key1: [],
  key2: 42
};

export default {
  name: '{{ name }}',
  tasks: [{
      description: 'Description',
      name: '{{ name }}',
      config,
      run({ workingDirectory }: { workingDirectory: string }): any {
          const logger = createScopedLogger('{{ name }}')
          logger.info('Just passing by!')
          return {
              sources: [workingDirectory],
          };
      },
  }]
}