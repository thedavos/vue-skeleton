const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TersetJSPlugin = require('terser-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const cssnano = require('cssnano');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const { dependencies } = require('../package.json');

const PATHS = {
  app: path.resolve(__dirname, '../src/entries/app.js'),
  build: path.resolve(__dirname, '../dist'),
};

const makeEntry = ({
  route = '',
  template = './public/index.html',
  entry,
} = {}) => ({
  entry,
  plugins: [
    new HtmlWebpackPlugin({
      filename: `${route && `${route}/`}index.html`,
      template,
    }),
  ],
});

const referenceDll = () => {
  // eslint-disable-next-line global-require
  const manifest = require('../modules-manifest.json');

  return {
    plugins: [
      new webpack.DllReferencePlugin({
        manifest,
      }),
    ],
  };
};

const loadDependencies = () => ({
  entry: {
    modules: Object.keys(dependencies),
  },
});

const loadResolves = (aliases = {}) => ({
  resolve: {
    alias: aliases,
  },
});

const loadVue = ({ include, exclude, enforce }) => ({
  module: {
    rules: [
      {
        test: /\.vue/,
        use: 'vue-loader',
        include,
        exclude,
        enforce,
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
});

const loadJavaScript = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,
        use: 'babel-loader',
      },
    ],
  },
});

const loadCSS = ({ include, exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.css|postcss$/,
        include,
        exclude,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
});

const loadImages = ({ include, exclude, options } = {}) => ({
  module: {
    rules: [
      {
        test: /\.jpg|png|gif|woff|eot|ttf|svg|mp4|webm$/,
        include,
        exclude,
        use: {
          loader: 'url-loader',
          options,
        },
      },
    ],
  },
});

const devServer = ({ host, port, hot } = {}) => ({
  devServer: {
    stats: 'errors-only',
    host, // Defaults to `localhost`
    port, // Defaults to 8080
    hot,
    open: true,
    overlay: true,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
});

const generateSourceMaps = ({ type }) => ({
  devtool: type,
});

const preventDuplication = () => ({
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 0,
      name: 'vendor',
    },
  },
});

const cleanBuild = (routes) => ({
  plugins: [
    new CleanWebpackPlugin({ cleanOnceBeforeBuildPatterns: [...routes] }),
  ],
});

const minifyCSS = ({ options } = {}) => ({
  plugins: [
    new OptimizeCSSAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorOptions: options,
      canPrint: false,
    }),
  ],
});

const minifyJavaScript = () => ({
  optimization: {
    minimizer: [new TersetJSPlugin()],
  },
});

const extractCSS = ({ include, exclude, use = [] }) => {
  // Output extracted CSS to a file
  const plugin = new MiniCssExtractPlugin({
    filename: 'css/[name].[hash].css',
    chunkFilename: 'css/[id].[hash].css',
  });

  return {
    module: {
      rules: [
        {
          test: /\.css|postcss$/,
          include,
          exclude,
          use: [MiniCssExtractPlugin.loader].concat(use),
        },
      ],
    },
    plugins: [plugin],
  };
};

const addAssets = () => ({
  plugins: [
    new AddAssetHtmlPlugin({
      filepath: path.resolve(__dirname, '../dist/js/*.dll.js'),
      outputPath: 'js',
      publicPath: 'js',
    }),
  ],
});

const useDll = () => ({
  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.resolve(__dirname, '../[name]-manifest.json'),
    }),
  ],
});

const commonConfig = merge([
  loadResolves({
    '@': path.resolve(__dirname, '../src'),
  }),
  loadJavaScript({ exclude: /(node_modules)/ }),
  loadVue({ exclude: /(node_modules)/ }),
]);

const pages = [
  makeEntry({
    entry: {
      app: PATHS.app,
    },
  }),
];

module.exports = {
  devServer,
  generateSourceMaps,
  minifyJavaScript,
  minifyCSS,
  extractCSS,
  addAssets,
  cleanBuild,
  preventDuplication,
  useDll,
  loadDependencies,
  referenceDll,
  loadImages,
  loadCSS,
  loadJavaScript,
  loadVue,
  loadResolves,
  makeEntry,
  commonConfig,
  PATHS,
  pages,
};
