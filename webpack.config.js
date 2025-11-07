const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    entry: {
      'main-script': './src/main.ts',
      'page-script': './src/pageMods/PageScript.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: isProduction
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest.json'
        },
        {
          from: 'src/icons',
          to: 'icons'
        },
        {
          from: 'config',
          to: 'config'
        }
      ]
    })
  ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true
          },
          // Prevent code splitting of our source files
          default: false,
          defaultVendors: false
        }
      },
      // Ensure consistent behavior in dev and production
      minimize: isProduction,
      // Disable runtime chunk to avoid extra files
      runtimeChunk: false
    },
    // Use source-map for both modes - Chrome extensions don't allow unsafe-eval
    // so we can't use eval-source-map which uses eval()
    devtool: 'source-map'
  };
};
