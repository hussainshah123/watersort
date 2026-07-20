import React, { memo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import {
  COLORS,
  HEADSPACE,
  LIQUIDS,
  RADIUS_BOTTOM,
  RADIUS_TOP,
  SEG_H,
  TUBE_H,
  TUBE_W,
} from '../theme/theme';

// A single liquid unit. Its layout height is ALWAYS fixed (SEG_H) — during a
// pour we animate scaleY (a transform, not a layout prop) so the New
// Architecture's Fabric renderer never has to animate Yoga layout, which is
// what was crashing (SurfaceMountingManager.overridePropsReadableMap).
function Segment({ colorId, isBottom, isTop, scaleAnim, origin }) {
  const c = LIQUIDS[colorId];
  const animStyle = scaleAnim
    ? {
        transform: [{ scaleY: scaleAnim }],
        transformOrigin: origin === 'top' ? 'top' : 'bottom',
      }
    : null;
  return (
    <Animated.View
      style={[
        styles.segment,
        {
          height: SEG_H,
          backgroundColor: c.main,
          borderBottomLeftRadius: isBottom ? RADIUS_BOTTOM - 3 : 0,
          borderBottomRightRadius: isBottom ? RADIUS_BOTTOM - 3 : 0,
        },
        animStyle,
      ]}
    >
      <View style={[styles.segHi, { backgroundColor: c.light }]} />
      {isTop && <View style={[styles.segTop, { backgroundColor: c.light }]} />}
      <View style={[styles.segShade, { backgroundColor: c.shade }]} />
    </Animated.View>
  );
}

/**
 * Bottle renders committed liquid plus two optional animated overlays used
 * during a pour (both native-driver, transform-only):
 *   - drainCount / drainAnim : top N segments scale to 0 (source emptying)
 *   - fillIds / fillAnim     : new segments scale up from 0 (destination)
 */
function Bottle({
  colors = [],
  selected,
  liftAnim,
  transform,
  drainCount = 0,
  drainAnim,
  fillIds = [],
  fillAnim,
  hint,
}) {
  const staticCount = colors.length - drainCount;
  const staticSegs = colors.slice(0, staticCount);
  const drainSegs = colors.slice(staticCount);

  // Always drive translateY from the lift value (0 when idle). Used for both
  // selection and the pour gesture.
  const liftStyle = liftAnim
    ? { transform: [{ translateY: liftAnim }] }
    : null;

  return (
    <Animated.View style={[styles.wrap, transform]}>
      <Animated.View style={liftStyle}>
        <View
          style={[
            styles.tube,
            selected && styles.tubeSelected,
            hint && styles.tubeHint,
          ]}
        >
          <View style={styles.liquidCol}>
            {/* incoming liquid (destination) grows from the bottom up */}
            {fillIds.map((id, i) => (
              <Segment
                key={`f${i}`}
                colorId={id}
                scaleAnim={fillAnim}
                origin="bottom"
                isTop={i === 0}
              />
            ))}
            {/* outgoing liquid (source) shrinks toward the mouth */}
            {drainSegs
              .slice()
              .reverse()
              .map((id, i) => (
                <Segment
                  key={`d${i}`}
                  colorId={id}
                  scaleAnim={drainAnim}
                  origin="top"
                />
              ))}
            {/* committed liquid */}
            {staticSegs
              .slice()
              .reverse()
              .map((id, i) => {
                const realIndex = staticCount - 1 - i;
                return (
                  <Segment
                    key={`s${realIndex}`}
                    colorId={id}
                    isBottom={realIndex === 0}
                    isTop={
                      fillIds.length === 0 && drainSegs.length === 0 && i === 0
                    }
                  />
                );
              })}
          </View>

          <View style={styles.glassHi} />
          <View style={styles.mouthShade} />
        </View>
        <View style={[styles.rim, selected && styles.rimSelected]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: TUBE_W + 10,
    alignItems: 'center',
  },
  tube: {
    width: TUBE_W,
    height: TUBE_H,
    borderTopLeftRadius: RADIUS_TOP,
    borderTopRightRadius: RADIUS_TOP,
    borderBottomLeftRadius: RADIUS_BOTTOM,
    borderBottomRightRadius: RADIUS_BOTTOM,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    backgroundColor: COLORS.glass,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    paddingTop: HEADSPACE,
  },
  tubeSelected: {
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  tubeHint: {
    borderColor: '#FFD54A',
  },
  liquidCol: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  segment: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  segHi: {
    position: 'absolute',
    left: 6,
    top: 3,
    width: 5,
    height: '70%',
    borderRadius: 3,
    opacity: 0.55,
  },
  segTop: {
    height: 3,
    width: '100%',
    opacity: 0.85,
  },
  segShade: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 4,
    opacity: 0.5,
  },
  glassHi: {
    position: 'absolute',
    left: 7,
    top: 10,
    width: 6,
    height: TUBE_H * 0.66,
    borderRadius: 4,
    backgroundColor: COLORS.glassHi,
  },
  mouthShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADSPACE + 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rim: {
    position: 'absolute',
    top: -5,
    width: TUBE_W + 8,
    height: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  rimSelected: {
    borderColor: COLORS.accent,
  },
});

export default memo(Bottle);
