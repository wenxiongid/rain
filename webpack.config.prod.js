var commonConfig = require('./webpack.config.common.js');
var path = require('path');
var webpack = require('webpack');

var productionPath = path.resolve(__dirname, 'dist', 'deploy');

var config = Object.assign(commonConfig, {
  mode: 'production',
  output: {
    path: productionPath,
    filename: 'js/[name].bundle.[chunkhash].js'
  },
  plugins: commonConfig.plugins.concat([new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production')
    }
  })])
});

module.exports = config;