module.exports = {
  sourceMaps: true,
  presets: [
    ['@babel/env', {
      useBuiltIns: 'usage',
    }],
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties'],
    ['@babel/plugin-proposal-object-rest-spread'],
    ['@babel/plugin-proposal-optional-chaining'],
    ['dynamic-import-node', { noInterop: true }],
  ],
};
