// ---------------------------------------------------------------------------
// AdMob configuration — THE ONLY FILE YOU NEED TO EDIT TO GO LIVE.
//
// 1. Paste your real ad unit IDs below (they look like
//    "ca-app-pub-1234567890123456/1234567890").
// 2. Paste your real App IDs into app.json under "react-native-google-mobile-ads"
//    ("android_app_id" / "ios_app_id").
//
// While __DEV__ is true the app ALWAYS serves Google's official test ads, so
// you can never accidentally click your own live ads during development — that
// is what gets AdMob accounts suspended.
// ---------------------------------------------------------------------------
import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

const REAL = {
  android: {
    banner: 'ca-app-pub-4687548663016677/3755858232',
    interstitial: 'ca-app-pub-0000000000000000/0000000000', // TODO: create an Android interstitial unit
  },
  ios: {
    // TODO: iOS needs its own AdMob app (and its own units) — an Android unit
    // ID will never fill on iOS. Until then iOS serves test ads.
    banner: 'ca-app-pub-0000000000000000/0000000000',
    interstitial: 'ca-app-pub-0000000000000000/0000000000',
  },
};

const platform = Platform.OS === 'ios' ? REAL.ios : REAL.android;

// A placeholder that was never filled in falls back to a test ID rather than
// firing a request that can only ever return "no fill".
const isPlaceholder = id => !id || id.includes('0000000000000000');

function unit(kind, testId) {
  if (__DEV__) return testId;
  const id = platform[kind];
  return isPlaceholder(id) ? testId : id;
}

export const AD_UNITS = {
  banner: unit('banner', TestIds.BANNER),
  interstitial: unit('interstitial', TestIds.INTERSTITIAL),
};

// Show an interstitial after every Nth level completion.
export const INTERSTITIAL_EVERY = 3;

// A hard floor between two interstitials, so a fast player who clears three
// short levels in a row does not get two full-screen ads back to back.
export const INTERSTITIAL_MIN_GAP_MS = 60 * 1000;
