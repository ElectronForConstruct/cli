module.exports = (api) => {
  api.cache(false);

  const presets = [
    ['@babel/env'],
  ];

  const plugins = [
    ['@babel/plugin-proposal-class-properties'],
    ['@babel/plugin-proposal-object-rest-spread'],
    ['@babel/plugin-proposal-optional-chaining'],
    ['dynamic-import-node', { noInterop: true }],
  ];

  return {
    presets,
    plugins,
    sourceMaps: true,
  };
};
