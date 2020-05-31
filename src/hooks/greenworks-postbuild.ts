export default {
  description: 'Run on the post build step',
  name: 'greenworks_post_build',
  run(): Promise<boolean> {
    return Promise.resolve(true);
  },
};
