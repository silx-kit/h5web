const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const packagesPath = path.resolve(__dirname, '../src/packages');
const packages = fs.readdirSync(packagesPath);

function getConfig(pkg) {
  const name = path.basename(pkg, '.ts');
  const outDir = path.resolve(__dirname, `${name}/dist`);

  return {
    mode: 'production',
    devtool: 'source-map',
    context: path.resolve(__dirname),
    entry: { [name]: path.join(packagesPath, pkg) },
    output: {
      path: outDir,
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
                configFile: path.resolve(__dirname, 'tsconfig.json'),
                onlyCompileBundledFiles: true,
                compilerOptions: { outDir },
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
          include: /\.module\.css$/,
          use: [
            { loader: 'style-loader' },
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  localIdentName: '[name]__[local]___[hash:base64:5]',
                },
              },
            },
          ],
        },
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            { loader: 'css-loader' },
          ],
        },
      ],
    },
    plugins: [
      new MiniCssExtractPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: `${name}/*`,
            to: outDir,
            flatten: true,
          },
        ],
      }),
    ],
  };
}

module.exports = packages.map(getConfig);
