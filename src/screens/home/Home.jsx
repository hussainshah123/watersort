import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Background from '../../components/Background';
import Bottle from '../../components/Bottle';
import PressButton from '../../components/PressButton';
import { COLORS } from '../../theme/theme';

// A few pre-filled tubes purely for decoration on the menu.
const DECO = [
  [0, 2, 1, 0],
  [4, 4, 6, 2],
  [1, 6, 4, 1],
];

export default function Home({ level, onPlay, onReset }) {
  const insets = useSafeAreaInsets();
  return (
    <Background>
      <View
        style={[
          styles.root,
          { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>PUZZLE</Text>
          <Text style={styles.title}>Water Sort</Text>
          <Text style={styles.titleAccent}>Master</Text>
          <Text style={styles.tagline}>
            Pour the colours until every tube is one shade.
          </Text>
        </View>

        <View style={styles.deco}>
          {DECO.map((b, i) => (
            <Bottle key={i} colors={b} />
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.levelChip}>
            <Text style={styles.levelChipLabel}>CURRENT LEVEL</Text>
            <Text style={styles.levelChipValue}>{level}</Text>
          </View>
          <PressButton
            label={level > 1 ? 'Continue' : 'Play'}
            icon="▶"
            onPress={onPlay}
          />
          {level > 1 && (
            <Text style={styles.reset} onPress={onReset}>
              Reset progress
            </Text>
          )}
        </View>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: { alignItems: 'center' },
  kicker: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 6,
    marginBottom: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: 0.5,
    lineHeight: 48,
  },
  titleAccent: {
    color: COLORS.accent,
    fontSize: 46,
    fontWeight: '900',
    lineHeight: 50,
  },
  tagline: {
    color: COLORS.textDim,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 280,
  },
  deco: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  footer: { alignItems: 'center', width: '100%' },
  levelChip: {
    alignItems: 'center',
    marginBottom: 22,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  levelChipLabel: {
    color: COLORS.textDim,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  levelChipValue: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
  },
  reset: {
    color: COLORS.textDim,
    fontSize: 13,
    marginTop: 18,
    textDecorationLine: 'underline',
  },
});
