import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../theme/theme';

// The coin balance chip used in every screen header.
export default function CoinPill({ coins, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, style]}
      disabled={!onPress}
    >
      <Text style={styles.icon}>🪙</Text>
      <Text style={styles.value}>{coins}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  icon: { fontSize: 15, marginRight: 6 },
  value: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
});
