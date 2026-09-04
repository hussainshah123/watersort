import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import { useTheme } from '../state/AppState';

const { width: SCREEN_W } = Dimensions.get('window');

// Lightweight confetti: N little rectangles that fall + drift + spin. Pure
// Animated, native-driven, so it stays smooth even during the win overlay.
function Piece({ delay, liquids }) {
  const fall = useRef(new Animated.Value(0)).current;
  const cfg = useMemo(() => {
    const c = liquids[Math.floor(Math.random() * liquids.length)];
    return {
      color: c.main,
      left: Math.random() * SCREEN_W,
      drift: (Math.random() - 0.5) * 120,
      size: 6 + Math.random() * 8,
      duration: 2200 + Math.random() * 1600,
      spin: Math.random() > 0.5 ? 1 : -1,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(fall, {
        toValue: 1,
        duration: cfg.duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [cfg.duration, delay, fall]);

  const translateY = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 560],
  });
  const translateX = fall.interpolate({
    inputRange: [0, 1],
    outputRange: [0, cfg.drift],
  });
  const rotate = fall.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${cfg.spin * 540}deg`],
  });
  const opacity = fall.interpolate({
    inputRange: [0, 0.85, 1],
    outputRange: [1, 1, 0],
  });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: cfg.left,
        width: cfg.size,
        height: cfg.size * 0.6,
        borderRadius: 2,
        backgroundColor: cfg.color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate }],
      }}
    />
  );
}

export default function Confetti({ count = 60 }) {
  const theme = useTheme();
  const pieces = useMemo(
    () => Array.from({ length: count }, (_, i) => i),
    [count],
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map(i => (
        <Piece key={i} delay={(i % 12) * 120} liquids={theme.liquids} />
      ))}
    </View>
  );
}
