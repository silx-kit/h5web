const fs = require('fs');
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ThreeMinifierPlugin = require('@yushijinhun/three-minifier-webpack');

const packagesPath = path.resolve(__dirname, '../src/packages');
const packages = fs.readdirSync(packagesPath);
const threeMinifier = new ThreeMinifierPlugin();

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
      plugins: [threeMinifier.resolver],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/u,
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
          test: /\.(png|jpe?g|gif)$/iu,
          use: [{ loader: 'url-loader' }],
        },
        {
          test: /\.css$/u,
          include: /\.module\.css$/u,
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
          test: /\.css$/u,
          exclude: /\.module\.css$/u,
          use: [
            { loader: MiniCssExtractPlugin.loader },
            { loader: 'css-loader' },
          ],
        },
      ],
    },
    plugins: [
      threeMinifier,
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
