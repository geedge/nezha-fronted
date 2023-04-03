'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
// const VueLoaderPlugin = require('vue-loader/lib/plugin')
const arg = process.env.BUILD_MODE
const devStart = process.env.npm_lifecycle_event
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}
const baseConfig = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/entrance/app/main.js',
    exportHtml: './src/entrance/exportHtml/exportHtml.js'
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
      },{
        test: /\.less$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: file => (
          /node_modules/.test(file) &&
          !/\.vue\.js/.test(file)
        )
      },
      {
        test: /\.(js)$/,
        loader: 'babel-loader',
        include: [
          resolve('src'),
          resolve('test'),
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
      },
      {
        test: /\.pug$/,
        oneOf: [
          // this applies to `<template lang="pug">` in Vue components
          {
            resourceQuery: /^\?vue/,
            use: ['pug-plain-loader']
          },
          // this applies to pug imports inside JavaScript
          {
            use: ['raw-loader', 'pug-plain-loader']
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['cache-loader', 'babel-loader']
      }
    ]
  },
  //  plugins: [
  //    new VueLoaderPlugin()
  //  ],
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
  }
}
if (arg === 'html' || devStart === 'dev:html') {
  delete baseConfig.entry.app
  baseConfig.module.rules.unshift({
    include: [
      resolve('src/entrance/app'),
      resolve('src/components/common/bottomBox'),
      resolve('src/components/common/detailView'),
      resolve('src/components/common/elSelect'),
      resolve('src/components/common/filterSearch'),
      resolve('src/components/common/globalSearch'),
      resolve('src/components/common/honeycomb'),
      resolve('src/components/common/myDatePicker'),
      resolve('src/components/common/overView'),
      resolve('src/components/common/popBox'),
      resolve('src/components/common/project'),
      resolve('src/components/common/rightBox'),
      resolve('src/components/common/table'),
      resolve('src/components/common/v-selectpagenew'),
      // resolve('src/components/page')
    ],
    loader: 'url-loader',
    options: {
      limit: 10,
      generator: (content, mimetype, encoding, resourcePath) => {
        return ''
      }
    }
  })
} else if (arg === 'app' || devStart === 'dev') {
  delete baseConfig.entry.exportHtml
  baseConfig.module.rules.unshift({
    include: [
      resolve('src/entrance/exportHtml')
    ],
    loader: 'url-loader',
    options: {
      limit: 10,
      generator: (content, mimetype, encoding, resourcePath) => {
        return ''
      }
    }
  })
}
module.exports = { ...baseConfig }
