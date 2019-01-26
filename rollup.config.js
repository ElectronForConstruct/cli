import path from 'path';
import babel from 'rollup-plugin-babel';
// import shebang from 'rollup-plugin-preserve-shebang';
// import shebang from 'rollup-plugin-shebang';

console.log(path.resolve(process.cwd(), 'src/index.js'));
export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
  },
  plugins: [
    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**', // only transpile our source code
    }),
  ],
};
