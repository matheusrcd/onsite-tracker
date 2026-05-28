import React, { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MonthCalendar } from '../ui/Calendar';
import { colors, radius, spacing } from '../theme';
import { OfficeLocation, Visit, addVisit, isoDate } from '../storage';

type Props = {
  offices: OfficeLocation[];
  visits: Visit[];
  onDone: () => Promise<void>;
  onClose: () => void;
};

export function AddVisitScreen({ offices, visits, onDone, onClose }: Props) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [officeId, setOfficeId] = useState<string | null>(
    offices[0]?.id ?? null,
  );

  const month = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const visitedSet = useMemo(() => new Set(visits.map((v) => v.date)), [visits]);
  const alreadyVisited = selected ? visitedSet.has(selected) : false;

  const save = async () => {
    if (!selected) return;
    const office = offices.find((o) => o.id === officeId);
    await addVisit(
      selected,
      'added',
      office ? { id: office.id, name: office.name } : undefined,
    );
    await onDone();
    onClose();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.headerRow}>
        <Pressable onPress={onClose} hitSlop={10}>
          <Text style={styles.cancel}>Cancelar</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Adicionar check-in</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
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
          <MonthCalendar
            month={month}
            visitedDates={visitedSet}
            selectedDate={selected ?? undefined}
            onPressDay={(iso) => setSelected(iso)}
            disableFuture
          />
          <Text style={styles.hint}>
            Toque em uma data para selecionar. Dias laranja já têm check-in.
          </Text>
        </Card>

        {offices.length > 1 && (
          <>
            <Text style={styles.sectionTitle}>Em qual escritório?</Text>
            <View style={styles.officePicker}>
              {offices.map((o) => {
                const active = o.id === officeId;
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => setOfficeId(o.id)}
                    style={[styles.officeChip, active && styles.officeChipActive]}
                  >
                    <Text
                      style={[styles.officeChipText, active && styles.officeChipTextActive]}
                    >
                      {o.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <View style={{ height: spacing(2) }} />
        <Button
          title={
            !selected
              ? 'Selecione uma data'
              : alreadyVisited
              ? 'Dia já registrado'
              : 'Salvar check-in'
          }
          onPress={save}
          disabled={!selected || alreadyVisited}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatMonth(d: Date) {
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1.5),
    backgroundColor: colors.bg,
  },
  cancel: { color: colors.blue, fontWeight: '600', fontSize: 15, width: 64 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  container: { padding: spacing(2), paddingBottom: spacing(6) },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(1.5),
  },
  monthTitle: { fontSize: 16, fontWeight: '700', color: colors.ink, textTransform: 'capitalize' },
  nav: { fontSize: 28, color: colors.blue, paddingHorizontal: 12, fontWeight: '700' },
  hint: { fontSize: 12, color: colors.inkSoft, marginTop: spacing(1.5), textAlign: 'center' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing(2),
    marginBottom: spacing(1),
  },
  officePicker: { flexDirection: 'row', flexWrap: 'wrap' },
  officeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  officeChipActive: {
    backgroundColor: colors.orangeSoft,
    borderColor: colors.orange,
  },
  officeChipText: { color: colors.ink, fontWeight: '600', fontSize: 14 },
  officeChipTextActive: { color: colors.orange },
});
