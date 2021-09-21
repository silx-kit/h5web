/*
 * This file and `react-app-rewired` are required in this demo due to the
 * monorepo set-up. They allow CRA to import and process source TS files from
 * local packages, like `@h5web/lib`, in development without having to build
 * them first, thus enabling fast refresh.
 *
 * https://github.com/facebook/create-react-app/issues/9127#issuecomment-792650009
 */

const path = require('path');

// A list of paths to transpile
const nodeModulesToTranspileAbs = [
  '../../packages/lib/src',
  '../../packages/shared/src',
].map((name) => path.resolve(__dirname, name));

module.exports = (config) => {
  // Find the babel-loader rule
  const babelLoaderRule = config.module.rules[1].oneOf.find((rule) =>
    rule.loader.includes('babel-loader')
  );

  // Add the paths we want to transpile
  babelLoaderRule.include = [
    babelLoaderRule.include,
    ...nodeModulesToTranspileAbs,
  ];

  return config;
};
