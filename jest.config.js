const CI = !!process.env.CI;

// In the CI/CD server we do not require console reporting, so just do summary, warnings and jUnit.
const reporters = CI
  ? [['jest-silent-reporter', { showWarnings: true }], 'summary']
  : ['default'];

// In the CI/CD server we output lcov and cobertura coverage report.
const coverageReporters = CI ? ['text-summary', 'lcovonly', 'cobertura'] : ['text'];

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
const config = {
  // use preset (from jest-preset-angular )
  preset: 'jest-preset-angular/presets/defaults',

  // another setup file which we will create in the next step
  setupFilesAfterEnv: ['<rootDir>/jest.preset.js'],

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],

  moduleNameMapper: {
    '^uuid$': 'uuid'
  },

  maxWorkers: '8',

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  coverageReporters,
  coverageDirectory: './reports',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  collectCoverageFrom: [
    'modules/**/*.{ts,tsx}',
    '!**/jest.setup.ts',
    '!**/*.stories.ts',
    '!**/*.d.ts',
  ],
  // The threshold is set per `ESP007.2`.
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 65,
      lines: 85,
      statements: 85,
    },
  },
  reporters: reporters,
};

module.exports = config;
