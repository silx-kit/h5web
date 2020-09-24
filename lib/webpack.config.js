const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  context: path.resolve(__dirname),
  entry: { lib: '../src/lib.ts' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.wasm', '.mjs', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve(__dirname, 'tsconfig.build.json'),
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [{ loader: 'url-loader' }],
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: { localIdentName: '[name]__[local]___[hash:base64:5]' },
            },
          },
        ],
        include: /\.module\.css$/,
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
        ],
        exclude: /\.module\.css$/,
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin()],
};
