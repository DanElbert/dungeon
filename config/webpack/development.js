process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const util = require('util');
const environment = require('./environment');

var wpc = environment.toWebpackConfig();
//console.log(util.inspect(wpc, {showHidden: false, depth: null}));
module.exports = wpc;
