import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GoalGauge } from '../ui/ProgressRing';
import { colors, radius, spacing } from '../theme';
import {
  Goals,
  Visit,
  setGoals as saveGoals,
  weekRange,
  monthRange,
  countVisitsBetween,
} from '../storage';

type Props = {
  goals: Goals;
  visits: Visit[];
  onChange: () => Promise<void>;
};

export function GoalsScreen({ goals, visits, onChange }: Props) {
  const [perWeek, setPerWeek] = useState(goals.perWeek);
  const [perMonth, setPerMonth] = useState(goals.perMonth);

  const week = weekRange(new Date());
  const month = monthRange(new Date());
  const weekCount = countVisitsBetween(visits, week.start, week.end);
  const monthCount = countVisitsBetween(visits, month.start, month.end);

  const dirty = perWeek !== goals.perWeek || perMonth !== goals.perMonth;

  const save = async () => {
    await saveGoals({ perWeek, perMonth });
    await onChange();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Metas</Text>
        <Text style={styles.subtitle}>Defina uma meta e acompanhe se você bateu.</Text>

        <Card>
          <Text style={styles.sectionTitle}>Esta semana</Text>
          <GoalGauge
            current={weekCount}
            goal={perWeek}
            progress={perWeek === 0 ? 0 : weekCount / perWeek}
            reached={weekCount >= perWeek && perWeek > 0}
            unit={`${formatShort(week.start)} – ${formatShort(week.end)}`}
          />
          <View style={{ height: spacing(2) }} />
          <Stepper
            label="Dias por semana"
            value={perWeek}
            onChange={setPerWeek}
            min={0}
            max={7}
          />
        </Card>

        <View style={{ height: spacing(2) }} />

        <Card>
          <Text style={styles.sectionTitle}>Este mês</Text>
          <GoalGauge
            current={monthCount}
            goal={perMonth}
            progress={perMonth === 0 ? 0 : monthCount / perMonth}
            reached={monthCount >= perMonth && perMonth > 0}
            unit={formatMonth(month.start)}
            color={colors.blue}
          />
          <View style={{ height: spacing(2) }} />
          <Stepper
            label="Dias por mês"
            value={perMonth}
            onChange={setPerMonth}
            min={0}
            max={31}
          />
        </Card>

        <View style={{ height: spacing(3) }} />
        <Button title={dirty ? 'Salvar metas' : 'Metas salvas'} onPress={save} disabled={!dirty} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepper}>
        <Pressable onPress={dec} style={styles.stepBtn} hitSlop={8}>
          <Text style={styles.stepBtnText}>−</Text>
        </Pressable>
        <Text style={styles.stepValue}>{value}</Text>
        <Pressable onPress={inc} style={styles.stepBtn} hitSlop={8}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatShort(d: Date) {
  return d.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
}
function formatMonth(d: Date) {
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { padding: spacing(2), paddingBottom: spacing(8) },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 14, color: colors.inkSoft, marginBottom: spacing(2) },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing(1),
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing(1.5),
  },
  stepperLabel: { fontSize: 15, color: colors.ink, fontWeight: '600' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.pill,
    padding: 4,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { fontSize: 20, fontWeight: '700', color: colors.blue },
  stepValue: {
    minWidth: 36,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
});
