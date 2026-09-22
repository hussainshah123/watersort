import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  useForeground,
} from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../ads/config';

// Anchored adaptive banner. It reserves no space until an ad actually loads,
// so a no-fill never leaves a grey gap under the board.
export default function AdBanner({ style }) {
  const [loaded, setLoaded] = useState(false);
  const ref = React.useRef(null);

  // iOS pauses banner refresh while backgrounded; nudge it on return.
  useForeground(() => {
    if (Platform.OS === 'ios') ref.current?.load();
  });

  // No unit configured for this platform -> render nothing at all.
  if (!AD_UNITS.banner) return null;

  return (
    <View style={[styles.wrap, loaded && styles.wrapLoaded, style]}>
      <BannerAd
        ref={ref}
        unitId={AD_UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={() => setLoaded(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', height: 0, overflow: 'hidden' },
  wrapLoaded: { height: undefined, overflow: 'visible' },
});
