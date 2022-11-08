const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    vendor: ['vue/dist/vue.common.js','vue-router', 'echarts','axios','element-ui']
    //vendor: ['vue/dist/vue.common.js','vue-router', 'echarts','axios','element-ui','d3','babel-core','optimize-css-assets-webpack-plugin','url-loader','sass-loader','vue-loader','uglifyjs-webpack-plugin']
  },
  output: {
    path: path.join(__dirname, '../static'),
    filename: '[name].dll.js',
    library: '[name]_library'       // vendor.dll.js中暴露出的全局变量名
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, '../static', '[name]-manifest.json'),
      name: '[name]_library'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
};
