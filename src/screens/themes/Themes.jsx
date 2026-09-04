import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '../../components/AdBanner';
import Background from '../../components/Background';
import CoinPill from '../../components/CoinPill';
import { useApp } from '../../state/AppState';
import { THEMES } from '../../theme/themes';
import { haptic } from '../../util/haptics';
import { play } from '../../util/sound';
import { COLORS } from '../../theme/theme';

// A miniature of what the board looks like in a theme: its background, a few
// tubes of its liquid palette, and its accent colour. Far more useful than a
// name when you are deciding whether to spend coins.
function Preview({ t }) {
  return (
    <View style={[styles.preview, { backgroundColor: t.bgTop }]}>
      <View style={[styles.previewTint, { backgroundColor: t.bgBottom }]} />
      <View style={styles.previewTubes}>
        {[
          [0, 2, 4],
          [7, 7, 9],
          [3, 10, 1],
        ].map((tube, i) => (
          <View key={i} style={styles.previewTube}>
            {tube.map((c, j) => (
              <View
                key={j}
                style={[
                  styles.previewSeg,
                  { backgroundColor: t.liquids[c].main },
                  j === tube.length - 1 && styles.previewSegBottom,
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={[styles.previewAccent, { backgroundColor: t.accent }]} />
    </View>
  );
}

export default function Themes({ onBack }) {
  const { coins, save, theme, buyTheme, selectTheme } = useApp();
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState(null);

  const onPress = t => {
    const owned = save.ownedThemes.includes(t.id);

    if (owned) {
      if (theme.id === t.id) return; // already the active theme
      haptic('selection');
      play('select');
      selectTheme(t.id);
      setNotice(null);
      return;
    }

    if (buyTheme(t.id)) {
      haptic('notificationSuccess');
      play('win');
      setNotice(null);
    } else {
      haptic('notificationError');
      play('error');
      setNotice(`${t.name} needs ${t.price - coins} more coins`);
    }
  };

  return (
    <Background>
      <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topBar}>
          <Pressable onPress={onBack} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Themes</Text>
          <CoinPill coins={coins} />
        </View>

        <Text style={styles.hint}>
          Earn coins by finishing levels and collecting the daily reward.
        </Text>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {THEMES.map(t => {
            const owned = save.ownedThemes.includes(t.id);
            const active = theme.id === t.id;
            const affordable = coins >= t.price;

            return (
              <Pressable
                key={t.id}
                onPress={() => onPress(t)}
                style={({ pressed }) => [
                  styles.card,
                  active && { borderColor: t.accent, borderWidth: 2 },
                  pressed && styles.cardPressed,
                ]}
              >
                <Preview t={t} />
                <View style={styles.cardBody}>
                  <Text style={styles.name}>{t.name}</Text>
                  <Text style={styles.sub}>
                    {active
                      ? 'Currently in use'
                      : owned
                      ? 'Tap to apply'
                      : affordable
                      ? 'Tap to unlock'
                      : 'Not enough coins yet'}
                  </Text>
                </View>

                {active ? (
                  <View style={[styles.badge, { backgroundColor: t.accent }]}>
                    <Text style={[styles.badgeText, { color: t.onAccent }]}>
                      ACTIVE
                    </Text>
                  </View>
                ) : owned ? (
                  <View style={styles.badgeGhost}>
                    <Text style={styles.badgeGhostText}>USE</Text>
                  </View>
                ) : (
                  <View
                    style={[styles.badgeGhost, !affordable && styles.badgeDim]}
                  >
                    <Text style={styles.badgeGhostText}>🪙 {t.price}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
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
    marginBottom: 10,
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
  hint: {
    color: COLORS.textDim,
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 4,
  },
  notice: {
    color: '#FF8A8A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  scroll: { paddingBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardPressed: { opacity: 0.7 },
  cardBody: { flex: 1, paddingHorizontal: 14 },
  name: { color: COLORS.text, fontSize: 17, fontWeight: '800' },
  sub: { color: COLORS.textDim, fontSize: 12, marginTop: 3 },
  preview: {
    width: 78,
    height: 62,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  previewTint: {
    ...StyleSheet.absoluteFillObject,
    top: '45%',
    opacity: 0.6,
  },
  previewTubes: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  previewTube: {
    width: 12,
    marginHorizontal: 3,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
  },
  previewSeg: { height: 9, width: '100%' },
  previewSegBottom: { borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
  previewAccent: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  badgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  badgeGhost: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  badgeGhostText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeDim: { opacity: 0.5 },
});
