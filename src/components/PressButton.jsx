import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme/theme';

// A button that springs on press. `variant` switches between the big primary
// CTA and the smaller round tool buttons used in the game HUD.
export default function PressButton({
  label,
  icon,
  onPress,
  disabled,
  variant = 'primary',
  badge,
  style,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const to = v =>
    Animated.spring(scale, {
      toValue: v,
      useNativeDriver: true,
      friction: 6,
      tension: 220,
    }).start();

  const round = variant === 'tool';

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => !disabled && to(0.9)}
      onPressOut={() => to(1)}
      style={style}
    >
      <Animated.View
        style={[
          round ? styles.tool : styles.primary,
          disabled && styles.disabled,
          { transform: [{ scale }] },
        ]}
      >
        {icon ? <Text style={round ? styles.toolIcon : styles.icon}>{icon}</Text> : null}
        {label ? (
          <Text style={round ? styles.toolLabel : styles.primaryLabel}>
            {label}
          </Text>
        ) : null}
        {badge != null && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 34,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  primaryLabel: {
    color: '#04121A',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  icon: { fontSize: 20, marginRight: 8 },
  tool: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  toolIcon: { fontSize: 22 },
  toolLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  disabled: { opacity: 0.4 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: COLORS.accent2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
