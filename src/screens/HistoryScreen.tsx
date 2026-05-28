import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../ui/Card';
import { MonthCalendar } from '../ui/Calendar';
import { colors, radius, spacing } from '../theme';
import { Visit, removeVisit } from '../storage';

type Props = {
  visits: Visit[];
  onChange: () => Promise<void>;
  onAddPress: () => void;
};

export function HistoryScreen({ visits, onChange, onAddPress }: Props) {
  const [monthOffset, setMonthOffset] = useState(0);
  const month = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const visitedSet = useMemo(() => new Set(visits.map((v) => v.date)), [visits]);

  const monthVisits = useMemo(() => {
    const y = month.getFullYear();
    const m = month.getMonth();
    return visits
      .filter((v) => {
        const [vy, vm] = v.date.split('-').map(Number);
        return vy === y && vm === m + 1;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [visits, month]);

  const handleDelete = (date: string) => {
    Alert.alert('Remover check-in?', `Remover ${formatLongIso(date)}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await removeVisit(date);
          await onChange();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
    >
      <View style={styles.titleRow}>
        <Text style={styles.title}>Histórico</Text>
        <Pressable onPress={onAddPress} hitSlop={8} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Adicionar</Text>
        </Pressable>
      </View>

      <Card>
        <View style={styles.monthHeader}>
          <Pressable onPress={() => setMonthOffset((o) => o - 1)} hitSlop={10}>
            <Text style={styles.nav}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>{formatMonth(month)}</Text>
          <Pressable
            onPress={() => setMonthOffset((o) => Math.min(o + 1, 0))}
            hitSlop={10}
            disabled={monthOffset >= 0}
          >
            <Text style={[styles.nav, monthOffset >= 0 && { color: colors.line }]}>›</Text>
          </Pressable>
        </View>
        <MonthCalendar month={month} visitedDates={visitedSet} />
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.orange }]} />
            <Text style={styles.legendText}>No escritório</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { borderWidth: 1.5, borderColor: colors.blue }]} />
            <Text style={styles.legendText}>Hoje</Text>
          </View>
          <Text style={styles.legendCount}>
            {monthVisits.length} dia{monthVisits.length === 1 ? '' : 's'} no escritório
          </Text>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Check-ins recentes</Text>
      {monthVisits.length === 0 ? (
        <Card>
          <Text style={styles.empty}>Sem check-ins neste mês.</Text>
        </Card>
      ) : (
        <Card style={{ padding: 0 }}>
          <FlatList
            data={monthVisits}
            keyExtractor={(v) => v.date}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowDate}>{formatLongIso(item.date)}</Text>
                  <Text style={styles.rowSub}>
                    {sourceLabel(item.source)}
                    {item.officeName ? ` · ${item.officeName}` : ''}
                    {' · '}
                    {formatTime(item.detectedAt)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDelete(item.date)}
                  hitSlop={6}
                  style={styles.removeBtn}
                >
                  <Text style={styles.removeBtnText}>Remover</Text>
                </Pressable>
              </View>
            )}
          />
        </Card>
      )}
    </ScrollView>
  );
}

function sourceLabel(s: Visit['source']) {
  switch (s) {
    case 'auto':
      return 'Automático · segundo plano';
    case 'manual':
      return 'Check-in manual';
    case 'added':
      return 'Adicionado manualmente';
  }
}

function formatMonth(d: Date) {
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}
function formatLongIso(iso: string) {
  const [y, m, day] = iso.split('-').map(Number);
  const d = new Date(y, m - 1, day);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: { padding: spacing(2), paddingBottom: spacing(6) },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(2),
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.orangeSoft,
  },
  addBtnText: { color: colors.orange, fontWeight: '700', fontSize: 13 },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(1.5),
  },
  monthTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, textTransform: 'capitalize' },
  nav: { fontSize: 28, color: colors.blue, paddingHorizontal: 12, fontWeight: '700' },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing(1.5),
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: spacing(2) },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: { color: colors.inkSoft, fontSize: 12 },
  legendCount: {
    marginLeft: 'auto',
    color: colors.blue,
    fontWeight: '700',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginTop: spacing(3),
    marginBottom: spacing(1),
  },
  empty: { color: colors.inkSoft, textAlign: 'center', paddingVertical: spacing(2) },
  separator: { height: 1, backgroundColor: colors.line, marginLeft: spacing(2) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
  },
  rowDate: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
    textTransform: 'capitalize',
  },
  rowSub: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.blueSoft,
    marginLeft: 8,
  },
  removeBtnText: { color: colors.blue, fontWeight: '700', fontSize: 12 },
});
