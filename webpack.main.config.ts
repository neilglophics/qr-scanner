import { EnvironmentPlugin, type Configuration } from 'webpack';

import { rules } from './webpack.rules';

console.log('BUILD ENV:', process.env.APP_ENV);
const path = require('path');
export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins: [
    new EnvironmentPlugin(['APP_ENV']) // No need for JSON.stringify
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
    alias: {
      src: path.resolve(__dirname, '../src'),
    },
  },
};
