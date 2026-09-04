import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '../../components/AdBanner';
import Background from '../../components/Background';
import CoinPill from '../../components/CoinPill';
import { useApp } from '../../state/AppState';
import { haptic } from '../../util/haptics';
import { play } from '../../util/sound';
import { COLORS } from '../../theme/theme';

function ToggleRow({ label, sub, value, onValueChange, accent }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255,255,255,0.18)', true: accent }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function LinkRow({ label, sub, value, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function Settings({ onBack, onThemes }) {
  const insets = useSafeAreaInsets();
  const { coins, settings, setSetting, save, theme, resetProgress } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = useMemo(() => {
    const values = Object.values(save.stars);
    return {
      cleared: values.length,
      stars: values.reduce((a, b) => a + b, 0),
      perfect: values.filter(s => s === 3).length,
    };
  }, [save.stars]);

  return (
    <Background>
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <CoinPill coins={coins} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, styles.statsCard]}>
            <Stat value={stats.cleared} label="LEVELS" />
            <View style={styles.statDivider} />
            <Stat value={stats.stars} label="STARS" />
            <View style={styles.statDivider} />
            <Stat value={stats.perfect} label="PERFECT" />
          </View>

          <Text style={styles.section}>AUDIO & FEEDBACK</Text>
          <View style={styles.card}>
            <ToggleRow
              label="Sound effects"
              sub="Pour, select and win sounds"
              value={settings.sound}
              accent={theme.accent}
              onValueChange={v => {
                setSetting('sound', v);
                if (v) play('select');
              }}
            />
            <View style={styles.divider} />
            <ToggleRow
              label="Vibration"
              sub="Haptic feedback on every move"
              value={settings.haptics}
              accent={theme.accent}
              onValueChange={v => {
                setSetting('haptics', v);
                if (v) haptic('impactMedium');
              }}
            />
          </View>

          <Text style={styles.section}>APPEARANCE</Text>
          <View style={styles.card}>
            <LinkRow
              label="Themes"
              sub={`${save.ownedThemes.length} unlocked`}
              value={theme.name}
              onPress={onThemes}
            />
          </View>

          <Text style={styles.section}>PROGRESS</Text>
          <View style={styles.card}>
            <Pressable
              onPress={() => {
                if (!confirmReset) {
                  setConfirmReset(true);
                  return;
                }
                haptic('notificationError');
                resetProgress();
                setConfirmReset(false);
                onBack();
              }}
              style={styles.resetRow}
            >
              <Text style={styles.resetText}>
                {confirmReset ? 'Tap again to erase everything' : 'Reset progress'}
              </Text>
              {confirmReset ? (
                <Text style={styles.resetSub}>
                  Levels, stars, coins and themes will all be lost
                </Text>
              ) : null}
            </Pressable>
          </View>
        </ScrollView>

        <AdBanner style={{ marginBottom: insets.bottom + 4 }} />
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 14 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconBtnText: { color: COLORS.text, fontSize: 30, marginTop: -4 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  scroll: { paddingBottom: 20, paddingTop: 8 },
  section: {
    color: COLORS.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 6,
  },
  card: {
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 16,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: COLORS.text, fontSize: 24, fontWeight: '900' },
  statLabel: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.cardBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowPressed: { opacity: 0.6 },
  rowText: { flex: 1, paddingRight: 12 },
  rowLabel: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  rowSub: { color: COLORS.textDim, fontSize: 12, marginTop: 2 },
  rowValue: { color: COLORS.textDim, fontSize: 14, fontWeight: '700' },
  chevron: {
    color: COLORS.textDim,
    fontSize: 24,
    marginLeft: 8,
    marginTop: -2,
  },
  divider: { height: 1, backgroundColor: COLORS.cardBorder },
  resetRow: { paddingVertical: 16, alignItems: 'center' },
  resetText: { color: '#FF7A72', fontSize: 15, fontWeight: '800' },
  resetSub: { color: COLORS.textDim, fontSize: 12, marginTop: 4 },
});
