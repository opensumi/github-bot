/** @type {import('jest').Config} */
const config = {
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
    '^.+\\.html$': '<rootDir>/test/transforms/text.js',
    '^.+\\.svg$': '<rootDir>/test/transforms/text.js',
  },
  testRegex: '/test/.*\\.test\\.ts$',
  testPathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/src/lib/',
    '<rootDir>/node_modules/',
  ],
  '//': 'https://github.com/remarkjs/remark/issues/969',
  transformIgnorePatterns: [],
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/lib/'],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jestSetup.js'],
  // the summary of all failed tests will be printed if there are ten or more failing tests
  reporters: [['summary', { summaryThreshold: 1 }]],
};

module.exports = config;
