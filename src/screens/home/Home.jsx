import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '../../components/AdBanner';
import Background from '../../components/Background';
import Bottle from '../../components/Bottle';
import CoinPill from '../../components/CoinPill';
import PressButton from '../../components/PressButton';
import { useApp } from '../../state/AppState';
import { COLORS } from '../../theme/theme';

// A few pre-filled tubes purely for decoration on the menu.
const DECO = [
  [0, 2, 1, 0],
  [4, 4, 6, 2],
  [1, 6, 4, 1],
];

export default function Home({ onPlay, onLevels, onSettings, onThemes }) {
  const insets = useSafeAreaInsets();
  const { coins, unlocked, theme, dailyAvailable, claimDaily } = useApp();
  const [claimed, setClaimed] = useState(null);

  const level = unlocked;

  const onClaim = () => {
    const amount = claimDaily();
    if (amount > 0) setClaimed(amount);
  };

  return (
    <Background>
      <View
        style={[
          styles.root,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 8 },
        ]}
      >
        <View style={styles.topBar}>
          <CoinPill coins={coins} />
          <View style={styles.topActions}>
            <Pressable onPress={onThemes} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>🎨</Text>
            </Pressable>
            <Pressable onPress={onSettings} style={[styles.iconBtn, styles.iconBtnGap]}>
              <Text style={styles.iconBtnText}>⚙</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={[styles.kicker, { color: theme.accent }]}>PUZZLE</Text>
          <Text style={styles.title}>Water Sort</Text>
          <Text style={[styles.titleAccent, { color: theme.accent }]}>
            Master
          </Text>
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
          {dailyAvailable && (
            <Pressable
              onPress={onClaim}
              style={[styles.daily, { borderColor: theme.accent }]}
            >
              <Text style={styles.dailyIcon}>🎁</Text>
              <View>
                <Text style={styles.dailyTitle}>Daily Reward</Text>
                <Text style={styles.dailySub}>Tap to collect free coins</Text>
              </View>
            </Pressable>
          )}
          {claimed != null && (
            <Text style={[styles.claimed, { color: theme.accent }]}>
              +{claimed} coins collected!
            </Text>
          )}

          <View style={styles.levelChip}>
            <Text style={styles.levelChipLabel}>CURRENT LEVEL</Text>
            <Text style={styles.levelChipValue}>{level}</Text>
          </View>

          <PressButton
            label={level > 1 ? 'Continue' : 'Play'}
            icon="▶"
            onPress={() => onPlay(level)}
          />

          <Pressable onPress={onLevels} style={styles.secondary}>
            <Text style={styles.secondaryText}>Level Map</Text>
          </Pressable>
        </View>

        <AdBanner style={styles.banner} />
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  topActions: { flexDirection: 'row' },
  iconBtnGap: { marginLeft: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconBtnText: { color: COLORS.text, fontSize: 20 },
  header: { alignItems: 'center' },
  kicker: {
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
  daily: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: COLORS.card,
    marginBottom: 14,
  },
  dailyIcon: { fontSize: 26, marginRight: 12 },
  dailyTitle: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  dailySub: { color: COLORS.textDim, fontSize: 12 },
  claimed: { fontSize: 14, fontWeight: '800', marginBottom: 12 },
  levelChip: {
    alignItems: 'center',
    marginBottom: 18,
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
  secondary: { marginTop: 14, padding: 8 },
  secondaryText: {
    color: COLORS.textDim,
    fontSize: 15,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  banner: { marginTop: 8 },
});
