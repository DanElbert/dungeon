const { environment } = require('@rails/webpacker')
const { VueLoaderPlugin } = require('vue-loader')
const vue =  require('./loaders/vue')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

environment.plugins.prepend('VueLoaderPlugin', new VueLoaderPlugin())
environment.loaders.prepend('vue', vue)

environment.plugins.append('BundleAnalyzerPlugin', new BundleAnalyzerPlugin({
  analyzerMode: 'static',
  openAnalyzer: false,
  reportFilename: 'webpack-report.html'
}));

module.exports = environment
