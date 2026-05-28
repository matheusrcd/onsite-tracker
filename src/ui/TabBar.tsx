import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export type TabKey = 'today' | 'history' | 'goals';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'today', label: 'Hoje', icon: '●' },
  { key: 'history', label: 'Histórico', icon: '▦' },
  { key: 'goals', label: 'Metas', icon: '◎' },
];

export function TabBar({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  return (
    <View style={styles.wrap}>
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={styles.tab}
            hitSlop={6}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Text style={[styles.icon, isActive && styles.iconActive]}>{t.icon}</Text>
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 8,
  },
  tab: { flex: 1, alignItems: 'center' },
  iconWrap: {
    width: 44,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWrapActive: { backgroundColor: colors.orangeSoft },
  icon: { fontSize: 14, color: colors.inkSoft },
  iconActive: { color: colors.orange, fontWeight: '700' },
  label: { fontSize: 11, color: colors.inkSoft, fontWeight: '600' },
  labelActive: { color: colors.orange },
});
