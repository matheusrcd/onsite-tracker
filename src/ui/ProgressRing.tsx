import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme';

type Props = {
  progress: number; // 0..1
  current: number;
  goal: number;
  unit: string; // e.g. "this week"
  reached?: boolean;
  color?: string;
};

export function GoalGauge({
  progress,
  current,
  goal,
  unit,
  reached,
  color = colors.orange,
}: Props) {
  const clamped = Math.max(0, Math.min(1, progress));
  const fillColor = reached ? colors.success : color;
  return (
    <View>
      <View style={styles.row}>
        <Text style={styles.bigNumber}>
          {current}
          <Text style={styles.muted}> / {goal}</Text>
        </Text>
        <View style={[styles.badge, reached && styles.badgeOk]}>
          <Text style={[styles.badgeText, reached && styles.badgeTextOk]}>
            {reached ? 'Meta batida' : `${Math.round(clamped * 100)}%`}
          </Text>
        </View>
      </View>
      <Text style={styles.unit}>{unit}</Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${clamped * 100}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  bigNumber: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  muted: { color: colors.inkSoft, fontSize: 22, fontWeight: '600' },
  unit: { color: colors.inkSoft, fontSize: 13, marginTop: 2, marginBottom: 12 },
  track: {
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.blueSoft,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  badge: {
    backgroundColor: colors.blueSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeOk: { backgroundColor: '#DCFCE7' },
  badgeText: { color: colors.blue, fontWeight: '700', fontSize: 12 },
  badgeTextOk: { color: colors.success },
});
