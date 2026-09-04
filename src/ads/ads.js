// AdMob runtime: SDK init + UMP consent + a always-warm interstitial.
//
// Every entry point is defensive: if the native module is missing (e.g. a JS
// bundle running before a rebuild) or a request fails, ads silently become
// no-ops instead of taking the game down with them.
import mobileAds, {
  AdEventType,
  AdsConsent,
  InterstitialAd,
  MaxAdContentRating,
} from 'react-native-google-mobile-ads';
import {
  AD_UNITS,
  INTERSTITIAL_EVERY,
  INTERSTITIAL_MIN_GAP_MS,
} from './config';

let initialised = false;
let interstitial = null;
let interstitialLoaded = false;
let lastShownAt = 0;
let levelsSinceAd = 0;

// If show() never actually puts an ad on screen within this window we assume
// it failed silently and let the player continue.
const WATCHDOG_MS = 5000;

// The consent form is only shown where it is legally required (EEA/UK); the
// SDK decides. We request ads either way once the flow settles.
async function requestConsent() {
  try {
    // gatherConsent() = requestInfoUpdate() + show the form only if required.
    await AdsConsent.gatherConsent();
  } catch (e) {
    // Consent problems must not block the game.
  }
}

function preloadInterstitial() {
  try {
    interstitial = InterstitialAd.createForAdRequest(AD_UNITS.interstitial, {
      requestNonPersonalizedAdsOnly: false,
    });
    interstitialLoaded = false;

    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitialLoaded = true;
    });
    interstitial.addAdEventListener(AdEventType.ERROR, () => {
      interstitialLoaded = false;
    });
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      // One interstitial object can only be shown once — build the next.
      interstitialLoaded = false;
      preloadInterstitial();
    });

    interstitial.load();
  } catch (e) {
    interstitial = null;
    interstitialLoaded = false;
  }
}

export async function initAds() {
  if (initialised) return;
  initialised = true;
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.G, // a puzzle game is all-ages
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    await mobileAds().initialize();
    await requestConsent();
    preloadInterstitial();
  } catch (e) {
    // Leave `initialised` true: retrying a broken native module every frame
    // would just burn battery.
  }
}

/**
 * Count a finished level and show an interstitial if this is the Nth one and
 * enough time has passed since the last.
 * @param {() => void} onDone called once the ad closes, or immediately if none.
 */
export function onLevelCompleted(onDone) {
  const done = typeof onDone === 'function' ? onDone : () => {};
  levelsSinceAd++;

  const due = levelsSinceAd >= INTERSTITIAL_EVERY;
  const cooledDown = Date.now() - lastShownAt >= INTERSTITIAL_MIN_GAP_MS;

  if (!due || !cooledDown || !interstitialLoaded || !interstitial) {
    done();
    return;
  }

  // The player must always get back to the game, so `done` runs exactly once:
  // whichever comes first, the CLOSED event or a watchdog for an ad that never
  // actually presents.
  let settled = false;
  const resume = () => {
    if (settled) return;
    settled = true;
    done();
  };

  try {
    const offClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      offClosed();
      resume();
    });
    // Once the ad is actually on screen, CLOSED is guaranteed to follow, so the
    // watchdog must stand down — the player may sit on the ad for a while.
    const watchdog = setTimeout(resume, WATCHDOG_MS);
    const offOpened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
      offOpened();
      clearTimeout(watchdog);
    });

    levelsSinceAd = 0;
    lastShownAt = Date.now();
    interstitial.show();
  } catch (e) {
    resume();
  }
}
