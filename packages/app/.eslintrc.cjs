const { getDependencies } = require('eslint-config-galex/dist/getDependencies');

const { createConfig } = require('../../eslint.shared.cjs');

const config = createConfig(__dirname, getDependencies());
console.log(config);

module.exports = config;
