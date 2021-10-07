// @ts-nocheck

'use strict';

const path = require('path');
const copyPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node',
	mode: 'none',
  entry: './src/webview/index.ts',
  output: {
    path: path.resolve(__dirname, '..', '..', 'out', 'webview'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-typescript']
          }
        }
      }
    ]
  },
  plugins: [
    new copyPlugin({
      patterns: [
        { from: './src/webview/index.html', to: 'index.html' },
      ],
    }),
  ],
};