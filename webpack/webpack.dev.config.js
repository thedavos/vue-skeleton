const merge = require('webpack-merge');
const {
  devServer,
  commonConfig,
  loadCSS,
  loadImages,
  generateSourceMaps,
  pages,
  PATHS,
} = require('./webpack.parts');

const developmentConfig = merge([
  {
    output: {
      path: PATHS.build,
      filename: 'js/[name].js',
      // publicPath: "http://localhost:9000/",
      chunkFilename: 'js/[id].[chunkhash].js',
    },
  },
  devServer({
    port: 9000,
    hot: true,
  }),
  generateSourceMaps({ type: 'eval-source-map' }),
  loadCSS(),
  loadImages({ options: { outputPath: 'assets' } }),
]);

module.exports = (mode) =>
  merge([commonConfig, developmentConfig, { mode }].concat(pages));
