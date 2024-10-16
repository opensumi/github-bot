/** @type {import('jest').Config} */
const config = {
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
    '^.+\\.html$': '<rootDir>/scripts/transforms/text.js',
    '^.+\\.svg$': '<rootDir>/scripts/transforms/text.js',
  },
  testMatch: ['**/__tests__/**/*.(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
  ],
  '//': 'https://github.com/remarkjs/remark/issues/969',
  transformIgnorePatterns: [],
  collectCoverageFrom: ['src/**/*.{ts,js}'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/scripts/jest-setup.js'],
};

if (process.env.CI) {
  config.reporters = [['summary', { summaryThreshold: 1 }]];
}

module.exports = config;
