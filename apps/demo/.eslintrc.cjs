const { getDependencies } = require('eslint-config-galex/dist/getDependencies');

const { createConfig } = require('../../eslint.shared.cjs');

module.exports = createConfig(__dirname, getDependencies());
