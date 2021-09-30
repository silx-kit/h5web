/*
 * This file and `react-app-rewired` are required in this demo due to the
 * monorepo set-up. They allow CRA to import and process source TS files from
 * local packages, like `@h5web/lib`, in development without having to build
 * them first, thus enabling fast refresh.
 *
 * https://github.com/facebook/create-react-app/issues/9127#issuecomment-792650009
 */

const path = require('path');
const {
  aliasDangerous,
  expandRulesInclude,
} = require('react-app-rewire-alias/lib/aliasDangerous');

module.exports = (config) => {
  // Make sure Babel transpiles raw package files
  expandRulesInclude(
    config.module.rules,
    [
      '../../packages/app/src',
      '../../packages/lib/src',
      '../../packages/shared/src',
    ].map((name) => path.resolve(__dirname, name))
  );

  if (process.env.REACT_APP_DIST === 'true') {
    // Import built package files instead of source files
    return aliasDangerous({
      '@h5web/app$': '../../packages/app/dist',
      '@h5web/lib$': '../../packages/lib/dist',
    })(config);
  }

  return config;
};
