module.exports = {
  'extends': [
    'airbnb',
  ],
  'globals': {
    'fetch'   : false,
    'document': false,
    'window'  : false,
    'Vue'     : false,
  },
  'rules'  : {
    'no-underscore-dangle'     : 0,
    'class-methods-use-this'   : 0,
    'import/no-dynamic-require': 0,
    'global-require'           : 0,
    'no-await-in-loop'         : 0,
    'linebreak-style'          : 0,
  },
};
