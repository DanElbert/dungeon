process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const environment = require('./environment');
const util = require('util');

environment.plugins.get('Manifest').options.writeToDisk = process.env.NODE_ENV !== 'test';

module.exports = environment.toWebpackConfig();
