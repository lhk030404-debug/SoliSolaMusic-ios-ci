module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: '<rootDir>/tsconfig.json'
    }
  },
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^i18next-icu$': '<rootDir>/src/test/IcuMock.js'
  }
}
