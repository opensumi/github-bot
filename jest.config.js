const { pathsToModuleNameMapper } = require('ts-jest');

// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig.json');

/** @type {import('jest').Config} */
const config = {
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
    '^.+\\.html$': '<rootDir>/__tests__/transforms/text.js',
    '^.+\\.svg$': '<rootDir>/__tests__/transforms/text.js',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  testPathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/node_modules/'],
  '//': 'https://github.com/remarkjs/remark/issues/969',
  transformIgnorePatterns: [],
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  coveragePathIgnorePatterns: ['/node_modules/'],

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
};

if (process.env.CI) {
  config.reporters = [['summary', { summaryThreshold: 1 }]];
}

module.exports = config;
