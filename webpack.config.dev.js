var commonConfig = require('./webpack.config.common.js');
var path = require('path');

var config = Object.assign(commonConfig, {
  mode: 'development',
  output: {
    path: path.resolve(__dirname, "src/"),
    filename: "js/[name].bundle.js"
  },
  
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    disableHostCheck: true,
    host: '0.0.0.0',
    port: 8080
  },
  stats: {
    colors: true
  }
});

module.exports = config;
