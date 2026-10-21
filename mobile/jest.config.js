module.exports = {
  preset: 'react-native',
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-community)/)',
  ],
  setupFilesAfterEnv: [],
};
