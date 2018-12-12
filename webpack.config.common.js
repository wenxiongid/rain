var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var SpritesmithPlugin = require('webpack-spritesmith');
var fs = require('fs');

var makeSprite = function(folderName){
  var name = folderName.replace('sprite_', '');
  return new SpritesmithPlugin({
    src: {
      cwd: path.resolve(__dirname, 'src/img/' + folderName),
      glob: '*.png'
    },
    target: {
      image: path.resolve(__dirname, 'src/img/' + name + '_sprite.png'),
      css: [
        [path.resolve(__dirname, 'src/sass/' + name + '_sprite.sass'), {
          format: 'sass_template'
        }]
      ]
    },
    apiOptions: {
      cssImageRef: '../img/' + name + '_sprite.png',
      generateSpriteName: function(spriteUrl){
        var spriteUrlInfo = path.parse(spriteUrl);
        return name + '_' + spriteUrlInfo.name;
      }
    },
    spritesmithOptions: {
      algorithm: 'top-down'
    },
    customTemplates: {
      'sass_template': path.resolve(__dirname, 'template.sass')
    },
    logCreatedFiles: true
  });
}

var spritePluginList = [];
var imgPath = path.resolve(__dirname, 'src/img');
var files = fs.readdirSync(imgPath);
files.forEach(function(name){
  if(name.indexOf('sprite_') === 0){
    var spriteDirPath = path.resolve(imgPath, name);
    var stat = fs.statSync(spriteDirPath);
    if(stat.isDirectory()){
      spritePluginList.push(makeSprite(name));
    }
  }
});

var config = {
  entry: './src/js/index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader"
      },
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.(sass|scss|css)$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'postcss-loader',
            'sass-loader'
          ],
          publicPath: '../'
        })
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.json/,
        loader: 'json-loader'
      },
      {
        test: /\.glsl$/,
        loader: 'raw-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.tpl.html",
      filename: './index.html',
      inject: 'body',
      hash: true
    }),
    new ExtractTextPlugin('css/[name].bundle.css')
  ].concat(spritePluginList),
  resolve: {
    extensions: [".js", ".vue"],
    alias: {
      vue: "vue/dist/vue.js"
    }
  },
  devtool: "source-map"
};

module.exports = config;