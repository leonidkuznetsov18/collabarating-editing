const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const postcssPresetEnv = require('postcss-preset-env');
const { CheckerPlugin } = require('awesome-typescript-loader');

const entryPath = path.resolve(__dirname, '../src/client/index.tsx');
console.log('entryPath', entryPath);
const sourcePath = path.resolve(__dirname, '../src/client');
console.log('sourcePath', sourcePath);
const htmlTemplatePath = path.resolve(__dirname, '../src/client/index.html');
console.log('htmlTemplatePath', htmlTemplatePath);
const outputPath = path.resolve(__dirname, '../build');
console.log('outputPath', outputPath);
const HOST = "0.0.0.0";
const PORT = 3000;

module.exports = {
  target: 'web',
  mode: 'development',
  context: sourcePath,
  entry: {
    client: entryPath,
  },
  output: {
    publicPath: '/',
    path: outputPath,
    filename: '[name].js',
    hotUpdateMainFilename: 'hot-update.[hash:6].json',
    hotUpdateChunkFilename: 'hot-update.[hash:6].js',
    globalObject: `(typeof self !== 'undefined' ? self : this)`
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: ['awesome-typescript-loader'],
        exclude: path.resolve(__dirname, 'node_modules'),
      },
      {
        test: /\.worker\.ts$/,
        use: ['workerize-loader'],
        exclude: path.resolve(__dirname, 'node_modules'),
      },
      {
        test: /\.(js|jsx)$/,
        include: /node_modules/,
        use: ['react-hot-loader/webpack'],
      },
      {
        enforce: "pre",
        test: /\.(js|jsx)$/,
        use: ["source-map-loader"],
        exclude: path.resolve(__dirname, 'node_modules'),
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: false,
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: true }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [postcssPresetEnv()],
              sourceMap: true
            }
          }
        ]

      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)$/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        TEST: JSON.stringify(process.env.TEST),
      },
    }),
    new CheckerPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: htmlTemplatePath,
      filename: 'index.html',
      //favicon: path.resolve(__dirname, '..', 'src', 'client', 'static', 'favicon.png'),
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all'
        }
      }
    }
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    mainFields: ['module', 'browser', 'main'],
    modules: [
      'node_modules',
      path.join('src', 'client')
    ]
  },
  devServer: {
    contentBase: sourcePath,
    publicPath: '/',
    hot: true,
    inline: true,
    stats: {
      assets: true,
      children: false,
      chunks: false,
      cached: false,
      hash: false,
      modules: false,
      publicPath: false,
      timings: true,
      version: false,
      warnings: true,
      colors: {
        green: '\u001b[32m',
      },
    },
    https: false,
    port: PORT,
    host: HOST,
  },
};
