/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './',
  moduleDirectories: ["node_modules"],
  transform: {},
  transformIgnorePatterns: [
    "node_modules/@umee_crosschain/shared-types"
  ],
};