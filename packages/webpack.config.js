const fs = require('fs');
const path = require('path');
const rootPkg = require('../package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const JsonPostProcessPlugin = require('json-post-process-webpack-plugin');

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
    externals: Object.fromEntries(
      ['react', 'react-dom', '@react-three/fiber', 'three'].map((dep) => [
        dep,
        `commonjs2 ${dep}`,
      ])
    ),
    resolve: {
      extensions: ['.ts', '.tsx', '.wasm', '.mjs', '.js', '.json'],
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
      new MiniCssExtractPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: `${name}/*`,
            to: `${outDir}/[name].[ext]`,
          },
        ],
      }),
      new JsonPostProcessPlugin({
        // Add H5Web's R3F dependency to @h5web/lib's `package.json`
        matchers: [
          {
            matcher: /^package\.json$/u,
            action: (json) => ({
              ...json,
              dependencies: {
                '@react-three/fiber':
                  rootPkg.dependencies['@react-three/fiber'],
                three: rootPkg.dependencies['three'],
              },
            }),
          },
        ],
      }),
    ],
    stats: {
      excludeAssets: /\.d\.ts$/u, // hide emitted type definitions
      modules: false, // don't log individual modules
      children: false, // hide `MiniCssExtractPlugin` logs
    },
    performance: { hints: false }, // hide max asset size warnings
  };
}

module.exports = packages.map(getConfig);
