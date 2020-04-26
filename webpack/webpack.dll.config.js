const path = require('path');
const merge = require('webpack-merge');
const {
  loadDependencies,
  minifyJavaScript,
  minifyCSS,
  useDll,
} = require('./webpack.parts');

const dllConfig = merge([
  {
    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: 'js/[name].[hash].dll.js',
      library: '[name]',
    },
  },
  minifyJavaScript(),
  minifyCSS(),
  useDll(),
  loadDependencies(),
]);

module.exports = (mode) => merge([dllConfig, { mode }]);
