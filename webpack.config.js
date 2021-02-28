const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'electron-main',
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, './build'),
    filename: 'main.js',
  },
  mode: 'production',
  node: {
    __dirname: false,
  },
  context: path.resolve(__dirname, '.'),
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: './setting',
          to: './setting',
          toType: 'dir',
        },
      ],
    }),
  ],
};
