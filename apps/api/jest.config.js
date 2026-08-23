/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': '<rootDir>/jest-transformer.js',
  },
  moduleNameMapper: {
    /*
     * Resolve generated prisma client from the correct
     * relative path in this pnpm workspace setup.
     */
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};

module.exports = config;
