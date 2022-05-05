'use strict'
const path = require('path')

const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
console.log(process.env.ONLY_HTML,baseWebpackConfig)
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const fileManagerPlugin = require('filemanager-webpack-plugin')
const WebpackZipPlugin = require('webpack-zip-plugin')
// const GitRevisionPlugin = require('git-revision-webpack-plugin')
const GenerateAssetPlugin = require('generate-asset-webpack-plugin')
const WebpackShellPlugin = require('webpack-shell-plugin')
const serverConfig = require('../static/config.json')// 引入根目录下的配置文件
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')

// const gitRevisionPlugin = new GitRevisionPlugin();
const createJson = function () {
  // serverConfig.version=config.build.version +"-"+gitRevisionPlugin.commithash();
  serverConfig.version = config.build.version
  return JSON.stringify(serverConfig)
}

const env = require('../config/prod.env')
/* const GenerateAssetPlugin = require('generate-asset-webpack-plugin');
const createConfig = function(compilation){
  let cfgJson={baseUrl:"http://192.168.40.247:8080/nz-admin"};
  return JSON.stringify(cfgJson);
} */
let webpackConfig = {}
webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[name].[chunkhash].js')
  },
  plugins: [
    /* new GenerateAssetPlugin({
      filename: 'config.json',
      fn: (compilation, cb) => {
        cb(null, createConfig(compilation));
      },
      extraFiles: []
    }), */
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new ParallelUglifyPlugin({
      cacheDir: '.cache/',
      uglifyJS: {
        output: {
          comments: false
        },
        warnings: false,
        compress: {
          drop_debugger: true,
          drop_console: true
        }
      }
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      favicon: path.resolve(__dirname, '../src/assets/img/favicon.ico'),
      filename: config.build.index,
      template: 'src/entrance/entrance.html',
      inlineSource: '.(js|css)$', // embed all javascript and css inline
      hash: false,
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency',
      chunks: ['entrance']
    }),
    new HtmlWebpackInlineSourcePlugin(),
    new GenerateAssetPlugin({
      filename: 'static/config.json',
      fn: (compilation, cb) => {
        cb(null, createJson())
      }
    }),
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks (module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'entrance',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),

    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['*']
      },
      {
        from: path.resolve(__dirname, '../src/components/chart'),
        to: 'components',
        ignore: ['.*']
      }
    ])
  ]
})

if (process.env.NODE_ENV == 'development') {
  webpackConfig.plugins.push(
    new fileManagerPlugin({
      onStart: [
        {
          delete: [path.join(__dirname, '../dist/')]
        }
      ],
      onEnd: [
        {
          move: [
            { source: path.join(__dirname, '../dist', '/static/config.json'), destination: path.join(__dirname, '../dist/config.json') }

          ],
          mkdir: [
            path.join(__dirname, '../dist', '/static')
          ],
          copy: [
            { source: path.join(__dirname, '../dist', '/config.json'), destination: path.join(__dirname, '../dist', '/static/config.json') }
          ]
        },
        {
          delete: [
            path.join(__dirname, '../dist', '/config.json')
          ]
        },
        {
          archive: [
            { source: path.join(__dirname, '../dist'), destination: path.join(__dirname, '../dist', '/nz-gui.zip') }
          ]
        }
      ]
    })
  )
} else {
  webpackConfig.plugins.push(
    new fileManagerPlugin({
      onStart: [
        {
          delete: [path.join(__dirname, '../dist/')]
        }
      ],
      onEnd: [
        {
          move: [
            { source: path.join(__dirname, '../dist', '/static/config.json'), destination: path.join(__dirname, '../dist/config.json') }

          ],
          mkdir: [
            path.join(__dirname, '../dist', '/static')
          ],
          copy: [
            { source: path.join(__dirname, '../dist', '/config.json'), destination: path.join(__dirname, '../dist', '/static/config.json') }
          ]
        },
        {
          delete: [
            path.join(__dirname, '../dist', '/config.json'),
            path.join(__dirname, '../.cache/')
          ]
        },
        {
          archive: [
            { source: path.join(__dirname, '../dist'), destination: path.join(__dirname, '../dist', '/nz-gui.zip') }
          ]
        }
      ]
    })
    // new WebpackZipPlugin({
    //   initialFile: './dist',
    //   endPath: './dist',
    //   zipName: 'nz-gui.zip'
    //   // behindShell: 'cd ' + path.join(__dirname, '../dist/') + ";md5=`md5sum nz-gui.zip |awk '{print $1}'|cut -c 1-8`;mv nz-gui.zip nz-gui-${md5}.zip;" + (process.env.BUILD_MODE == 'all' ? 'mkdir -p ./dist/static;echo "start add map picture to zip file,it will take a few moment,please wait...";cp -r ../static/Tiles dist/static/;zip -gr nz-gui-${md5}.zip dist/static/Tiles>/dev/null;rm -rf dist;' : '')
    // })
    // new WebpackShellPlugin({
    //   onBuildStart: ['/bin/bash ' + path.join(__dirname, 'script') + '/buildStart.sh'],
    //   onBuildEnd: ['/bin/bash ' + path.join(__dirname, 'script') + '/buildEnd.sh ' + process.env.BUILD_MODE]
    // })
    // new fileManagerPlugin({
    //   onStart: [
    //     {
    //       delete: [path.join(__dirname, '../dist/')]
    //     }
    //   ]
    // })
  )
}

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
