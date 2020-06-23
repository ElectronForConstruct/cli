const path = require('path');

module.exports = {
  'extends': [
    'airbnb-base',
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  plugins: ['import'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: path.resolve(__dirname, './tsconfig.json'),
    tsconfigRootDir: __dirname
  },
  'globals': {
    'fetch': false,
    'document': false,
    'window': false,
    'Vue': false,
  },
  'env': {
    'node': true,
  },
  'settings': {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      'typescript': {},
    },
  },
  'rules': {
    'import/no-cycle': 0,
    'import/no-unresolved': 'error',
    'no-underscore-dangle': 0,
    'class-methods-use-this': 0,
    'import/no-dynamic-require': 0,
    'global-require': 0,
    'no-await-in-loop': 0,
    'linebreak-style': 0,
    'curly': [2, 'all'],
    'no-param-reassign': 0,
    'no-console': 0,
    'no-case-declarations': 0,
    'object-curly-spacing': ['error', 'always'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        'js': 'never',
        'mjs': 'never',
        'jsx': 'never',
        'ts': 'never',
        'tsx': 'never',
      },
    ],

    '@typescript-eslint/explicit-function-return-type': 2,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-unsafe-assignment': 1
  },
};
