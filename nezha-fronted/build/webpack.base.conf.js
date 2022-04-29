'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
console.log(process.env.ONLY_HTML)
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
const onlyHtml = {
  // publicPath: '', // 使用相对路径
  // indexPath: 'index.html',
  // outputDir: 'dist',
  // // assetsDir: 'static',
  // productionSourceMap: false,
  // chainWebpack: config => {
  //   config.plugin('preload').tap(args => {
  //     args[0].fileBlacklist.push(/\.css/, /\.js/)
  //     return args
  //   })
  //   config.plugin('inline-source')
  //     .use(require('html-webpack-inline-source-plugin'))
  //   config.plugin('html').tap(args => {
  //     args[0].chunksSortMode = 'none'
  //     args[0].inlineSource = '(\.css|\.js$)'
  //     return args
  //   })
  //   config.resolve.alias // 添加别名
  //     .set('@', resolve('src'))
  //     .set('@assets', resolve('src/assets'))
  //     .set('@components', resolve('src/components'))
  // }
}
module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/main.js',
    entrance: './src/entrance/entrance.main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.(js)$/,
        loader: 'babel-loader',
        include: [
          resolve('src'),
          resolve('test'),
          resolve('node_modules/webpack-dev-server/client'),
          resolve('node_modules/element-ui/packages/scrollbar'),
          resolve('node_modules/@interactjs'),
          resolve('node_modules/vue-grid-layout')
        ],
        exclude: '/node_modules/',
        options: {
          presets: [
            ['env', {
              modules: false,
              targets: {
                browsers: ['> 1%', 'last 2 versions', 'not ie <= 8']
              }
            }],
            'stage-2'
          ],
          plugins: ['transform-vue-jsx', 'transform-runtime']
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  },
  ...onlyHtml
}
