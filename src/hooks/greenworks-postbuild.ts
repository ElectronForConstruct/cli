export default {
  description: 'Run on the post build step',
  name: 'greenworks',
  run(): Promise<boolean> {
    return Promise.resolve(true);
  },
};
