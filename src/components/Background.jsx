import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { COLORS } from '../theme/theme';

// No LinearGradient native dependency: we stack a base colour with two large,
// blurred-looking translucent orbs that drift slowly for a living backdrop.
function Orb({ color, size, style, range }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(t, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(t, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: range });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateY }],
        },
        style,
      ]}
    />
  );
}

export default function Background({ children }) {
  return (
    <View style={styles.root}>
      <View style={styles.bottomTint} />
      <Orb
        color={COLORS.glowA}
        size={320}
        style={{ top: -60, left: -80 }}
        range={[0, 40]}
      />
      <Orb
        color={COLORS.glowB}
        size={280}
        style={{ bottom: -40, right: -70 }}
        range={[0, -40]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bgTop, overflow: 'hidden' },
  bottomTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bgBottom,
    opacity: 0.6,
    top: '45%',
  },
});
