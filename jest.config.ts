/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "^lodash-es$": "lodash"
  },
  testRegex: '.*\.test\.ts$'
};
