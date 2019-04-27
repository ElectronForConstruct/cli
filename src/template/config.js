const deepmerge = require('deepmerge');

const base = require('./config-base');
const user = require('./config-user');

module.exports = deepmerge(base, user(base.env === 'production'));
