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
    // ID will never fill on iOS, so ads stay off in iOS release builds.
    banner: 'ca-app-pub-0000000000000000/0000000000',
    interstitial: 'ca-app-pub-0000000000000000/0000000000',
  },
};

const platform = Platform.OS === 'ios' ? REAL.ios : REAL.android;

const isPlaceholder = id => !id || id.includes('0000000000000000');

// In development every format serves Google's test ads. In a release build a
// format with no real unit ID is DISABLED (null) rather than falling back to a
// test ID — shipping "Test Ad" placeholders to real users earns nothing and
// looks broken. Fill the ID in and the format switches itself back on.
function unit(kind, testId) {
  if (__DEV__) return testId;
  const id = platform[kind];
  return isPlaceholder(id) ? null : id;
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
