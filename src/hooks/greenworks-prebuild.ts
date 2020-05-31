export default {
  description: 'Run on the pre build step',
  name: 'greenworks_pre_build',
  run(): Promise<boolean> {
    console.log('calling greenworks pre-build hook');
    return Promise.resolve(true);
  },
};
