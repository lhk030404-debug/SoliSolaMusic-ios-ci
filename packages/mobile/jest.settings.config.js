const path = require('path')

const tsJest = require.resolve('ts-jest', {
  paths: [path.resolve(__dirname, '../localization')]
})

module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/screens/settings-screen/settingsExperience.test.ts',
    '<rootDir>/src/localization/deviceLocale.test.ts'
  ],
  transform: {
    '^.+\\.tsx?$': [
      tsJest,
      {
        tsconfig: '<rootDir>/tsconfig.settings-tests.json'
      }
    ]
  }
}
