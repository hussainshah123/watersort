const rnPreset = require('@react-native/jest-preset');

module.exports = {
  preset: '@react-native/jest-preset',
  // The preset only transforms .js/.ts/.tsx — this project also uses .jsx.
  transform: {
    ...rnPreset.transform,
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  // `setupFiles` replaces (not extends) the preset's list, so re-list its own.
  setupFiles: [...rnPreset.setupFiles, '<rootDir>/jest.setup.js'],
};
