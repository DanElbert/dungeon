const { environment } = require('@rails/webpacker')
const { VueLoaderPlugin } = require('vue-loader')
const svg =  require('./loaders/svg')
const vue =  require('./loaders/vue')
let BundleAnalyzerPlugin = null;
if (process.env.ANALYZE_BUNGLE) {
  BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
}

environment.plugins.prepend('VueLoaderPlugin', new VueLoaderPlugin())
environment.loaders.prepend('vue', vue)

environment.loaders.prepend('svg', svg)

const fileLoader = environment.loaders.get('file')
fileLoader.exclude = /dungeon_svg\/[a-zA-Z0-9-_]+\.svg$/i

if (BundleAnalyzerPlugin !== null) {
  environment.plugins.append('BundleAnalyzerPlugin', new BundleAnalyzerPlugin({
    // analyzerMode: 'static',
    // openAnalyzer: false,
    // reportFilename: 'webpack-report.html'
  }));
}


module.exports = environment
