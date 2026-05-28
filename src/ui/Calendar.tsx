import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius } from '../theme';
import { isoDate } from '../storage';

type Props = {
  month: Date;
  visitedDates: Set<string>;
  selectedDate?: string;
  onPressDay?: (iso: string) => void;
  disableFuture?: boolean;
};

const DOW = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']; // Seg, Ter, Qua, Qui, Sex, Sáb, Dom

export function MonthCalendar({
  month,
  visitedDates,
  selectedDate,
  onPressDay,
  disableFuture,
}: Props) {
  const cells = useMemo(() => buildMonthGrid(month), [month]);
  const today = isoDate(new Date());
  return (
    <View>
      <View style={styles.dowRow}>
        {DOW.map((d, i) => (
          <Text key={i} style={styles.dow}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((cell, i) => {
          if (!cell) {
            return <View key={i} style={styles.cell} />;
          }
          const visited = visitedDates.has(cell.iso);
          const isToday = cell.iso === today;
          const isWeekend = cell.dow >= 5;
          const isSelected = selectedDate === cell.iso;
          const isFuture = cell.iso > today;
          const disabled = !onPressDay || (disableFuture && isFuture);

          const inner = (
            <View
              style={[
                styles.cellInner,
                visited && styles.cellVisited,
                isToday && !visited && styles.cellToday,
                isSelected && styles.cellSelected,
                disabled && styles.cellDisabled,
              ]}
            >
              <Text
                style={[
                  styles.cellText,
                  visited && styles.cellTextVisited,
                  !visited && isWeekend && styles.cellTextWeekend,
                  isToday && !visited && !isSelected && styles.cellTextToday,
                  isSelected && styles.cellTextSelected,
                  disabled && !visited && styles.cellTextDisabled,
                ]}
              >
                {cell.day}
              </Text>
            </View>
          );

          if (onPressDay && !disabled) {
            return (
              <Pressable
                key={i}
                style={styles.cell}
                onPress={() => onPressDay(cell.iso)}
              >
                {inner}
              </Pressable>
            );
          }
          return (
            <View key={i} style={styles.cell}>
              {inner}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function buildMonthGrid(month: Date) {
  const y = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const leading = (first.getDay() + 6) % 7;
  const cells: ({ day: number; iso: string; dow: number } | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let day = 1; day <= last.getDate(); day++) {
    const d = new Date(y, m, day);
    cells.push({ day, iso: isoDate(d), dow: (d.getDay() + 6) % 7 });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const styles = StyleSheet.create({
  dowRow: { flexDirection: 'row', marginBottom: 6 },
  dow: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: colors.inkSoft,
    fontWeight: '600',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 3,
  },
  cellInner: {
    flex: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellVisited: { backgroundColor: colors.orange },
  cellToday: {
    borderWidth: 1.5,
    borderColor: colors.blue,
  },
  cellSelected: {
    backgroundColor: colors.blue,
  },
  cellDisabled: { opacity: 0.4 },
  cellText: { fontSize: 14, color: colors.ink, fontWeight: '500' },
  cellTextVisited: {
    color: colors.white,
    fontWeight: '700',
  },
  cellTextSelected: { color: colors.white, fontWeight: '700' },
  cellTextToday: { color: colors.blue, fontWeight: '700' },
  cellTextWeekend: { color: colors.inkSoft },
  cellTextDisabled: { color: colors.inkSoft },
});
