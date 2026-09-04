/* eslint-env jest */
// Native modules that only exist in a built app. Mocking them here keeps the
// JS test suite runnable without a device.

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(k => Promise.resolve(store.has(k) ? store.get(k) : null)),
      setItem: jest.fn((k, v) => {
        store.set(k, v);
        return Promise.resolve();
      }),
      removeItem: jest.fn(k => {
        store.delete(k);
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store.clear();
        return Promise.resolve();
      }),
    },
  };
});

jest.mock('react-native-google-mobile-ads', () => {
  const React = require('react');
  const noopAd = {
    addAdEventListener: jest.fn(() => jest.fn()),
    load: jest.fn(),
    show: jest.fn(),
  };
  return {
    __esModule: true,
    default: () => ({
      initialize: jest.fn(() => Promise.resolve([])),
      setRequestConfiguration: jest.fn(() => Promise.resolve()),
    }),
    BannerAd: () => React.createElement('BannerAd'),
    BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER' },
    AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed' },
    MaxAdContentRating: { G: 'G' },
    InterstitialAd: { createForAdRequest: () => noopAd },
    AdsConsent: {
      requestInfoUpdate: jest.fn(() =>
        Promise.resolve({ status: 'NOT_REQUIRED', isConsentFormAvailable: false }),
      ),
      showForm: jest.fn(() => Promise.resolve()),
    },
    TestIds: { BANNER: 'test-banner', INTERSTITIAL: 'test-interstitial' },
    useForeground: () => {},
  };
});

jest.mock('react-native-sound', () => {
  function Sound() {
    this.setVolume = jest.fn();
    this.play = jest.fn();
    this.stop = jest.fn(cb => cb && cb());
    this.release = jest.fn();
  }
  Sound.MAIN_BUNDLE = 'main';
  Sound.setCategory = jest.fn();
  return Sound;
});

jest.mock('react-native-haptic-feedback', () => ({ trigger: jest.fn() }));
