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
          // logger.info('Just passing by!')
          return {
              source: workingDirectory,
          };
      },
  }]
}