import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Row of three stars; `value` (0-3) are filled, the rest are dimmed outlines.
export default function Stars({ value = 0, size = 16, style }) {
  return (
    <View style={[styles.row, style]}>
      {[0, 1, 2].map(i => (
        <Text
          key={i}
          style={[
            styles.star,
            { fontSize: size },
            i < value ? styles.on : styles.off,
          ]}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  star: { marginHorizontal: 1 },
  on: { color: '#FFD54A' },
  off: { color: 'rgba(255,255,255,0.20)' },
});
