module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  collectCoverageFrom: [
    'src/controllers/**/*.ts',
    'src/middleware/**/*.ts',
    'src/utils/**/*.ts',
    '!src/utils/logger.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
  coverageReporters: ['cobertura', 'html', 'text-summary'],
  coverageDirectory: 'coverage',
};
