const merge = require('webpack-merge');
const {
  commonConfig,
  generateSourceMaps,
  cleanBuild,
  minifyCSS,
  minifyJavaScript,
  extractCSS,
  addAssets,
  loadImages,
  referenceDll,
  pages,
  PATHS,
} = require('./webpack.parts');

const productionConfig = merge([
  {
    performance: {
      hints: 'warning', // "error" or false are valid too
      maxEntrypointSize: 150000, // in bytes, default 250k
      maxAssetSize: 450000, // in bytes
    },
  },
  {
    output: {
      path: PATHS.build,
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[id].[chunkhash].js',
    },
  },
  {
    optimization: {
      splitChunks: {
        chunks: 'initial',
      },
    },
  },
  cleanBuild(['**/app.*']),
  minifyJavaScript(),
  minifyCSS({
    options: {
      discardComments: {
        removeAll: true,
      },
      // Run cssnano in safe mode to avoid
      // potentially unsafe transformations.
      safe: true,
    },
  }),
  extractCSS({
    use: [
      { loader: 'css-loader', options: { importLoaders: 1 } },
      'postcss-loader',
    ],
  }),
  addAssets(),
  loadImages({
    options: {
      limit: 1000000,
      fallback: 'file-loader',
      name: '[name].[hash].[ext]',
      outputPath: 'assets',
    },
  }),
  generateSourceMaps({ type: 'source-map' }),
  referenceDll(),
]);

module.exports = (mode) =>
  merge([commonConfig, productionConfig, { mode }].concat(pages));
