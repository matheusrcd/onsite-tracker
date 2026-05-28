import React, { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GoalGauge } from '../ui/ProgressRing';
import { colors, radius, spacing } from '../theme';
import {
  OfficeLocation,
  Visit,
  Goals,
  weekRange,
  monthRange,
  countVisitsBetween,
  isoDate,
} from '../storage';
import { checkInNow, startBackgroundTracking, stopBackgroundTracking } from '../tracking';

type Props = {
  offices: OfficeLocation[];
  visits: Visit[];
  goals: Goals;
  tracking: boolean;
  onChange: () => Promise<void>;
  onSetupPress: () => void;
};

export function TodayScreen({
  offices,
  visits,
  goals,
  tracking,
  onChange,
  onSetupPress,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const today = isoDate(new Date());
  const todayVisit = visits.find((v) => v.date === today);

  const week = weekRange(new Date());
  const month = monthRange(new Date());
  const weekCount = countVisitsBetween(visits, week.start, week.end);
  const monthCount = countVisitsBetween(visits, month.start, month.end);

  const hasOffice = offices.length > 0;

  const handleCheckIn = useCallback(async () => {
    if (!hasOffice) {
      onSetupPress();
      return;
    }
    setBusy(true);
    try {
      const result = await checkInNow();
      if (result.ok) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Check-in feito',
          `Você está a ${Math.round(result.distance)} m de ${result.officeName}.`,
        );
        await onChange();
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        const lines = [result.reason];
        if (result.distance != null && result.nearestName) {
          lines.push(
            `Mais próximo: ${result.nearestName} (${Math.round(result.distance)} m)`,
          );
        }
        Alert.alert('Não foi possível fazer check-in', lines.join('\n'));
      }
    } finally {
      setBusy(false);
    }
  }, [hasOffice, onChange, onSetupPress]);

  const handleToggleTracking = useCallback(
    async (next: boolean) => {
      if (next) {
        if (!hasOffice) {
          Alert.alert(
            'Cadastre um escritório primeiro',
            'Cadastre pelo menos um local para ativar o rastreamento em segundo plano.',
          );
          return;
        }
        const result = await startBackgroundTracking();
        if (!result.ok) {
          Alert.alert('Rastreamento não ativado', result.reason, [
            { text: 'OK' },
            { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
          ]);
        }
      } else {
        await stopBackgroundTracking();
      }
      await onChange();
    },
    [hasOffice, onChange],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await onChange();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>Hoje</Text>
      <Text style={styles.date}>{formatLongDate(new Date())}</Text>

      <Card style={styles.heroCard}>
        <View style={styles.statusPill}>
          <View
            style={[
              styles.dot,
              { backgroundColor: todayVisit ? colors.success : colors.inkSoft },
            ]}
          />
          <Text style={styles.statusText}>
            {todayVisit ? 'Check-in feito hoje' : 'Sem check-in ainda'}
          </Text>
        </View>

        {hasOffice ? (
          <Text style={styles.officeLine}>
            Monitorando{' '}
            <Text style={{ fontWeight: '700', color: colors.ink }}>
              {offices.length === 1
                ? offices[0].name
                : `${offices.length} escritórios`}
            </Text>
          </Text>
        ) : (
          <Text style={styles.officeLine}>
            Nenhum escritório cadastrado — toque abaixo para começar.
          </Text>
        )}

        <View style={{ height: spacing(2) }} />
        <Button
          title={
            !hasOffice
              ? 'Cadastrar escritório'
              : todayVisit
              ? 'Você já fez check-in'
              : 'Fazer check-in agora'
          }
          onPress={!hasOffice ? onSetupPress : handleCheckIn}
          disabled={!!todayVisit}
          loading={busy}
        />

        <View style={styles.trackRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.trackTitle}>Rastreamento em segundo plano</Text>
            <Text style={styles.trackSub}>
              Check-in automático ao chegar em um dos escritórios.
            </Text>
          </View>
          <Switch
            value={tracking}
            onValueChange={handleToggleTracking}
            trackColor={{ false: colors.line, true: colors.orange }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.line}
          />
        </View>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Esta semana</Text>
          <Text style={styles.statValue}>{weekCount}</Text>
          <Text style={styles.statGoal}>de {goals.perWeek} (meta)</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>Este mês</Text>
          <Text style={styles.statValue}>{monthCount}</Text>
          <Text style={styles.statGoal}>de {goals.perMonth} (meta)</Text>
        </Card>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Meta semanal</Text>
        <GoalGauge
          current={weekCount}
          goal={goals.perWeek}
          progress={goals.perWeek === 0 ? 0 : weekCount / goals.perWeek}
          reached={weekCount >= goals.perWeek && goals.perWeek > 0}
          unit={`${formatShort(week.start)} – ${formatShort(week.end)}`}
        />
      </Card>
    </ScrollView>
  );
}

function formatLongDate(d: Date) {
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatShort(d: Date) {
  return d.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: { padding: spacing(2), paddingBottom: spacing(6) },
  greeting: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    color: colors.inkSoft,
    marginBottom: spacing(2),
    textTransform: 'capitalize',
  },
  heroCard: {
    backgroundColor: colors.white,
    padding: spacing(2.5),
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.blueSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: spacing(1),
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: colors.blue, fontWeight: '700', fontSize: 12 },
  officeLine: { color: colors.inkSoft, fontSize: 14 },
  trackRow: {
    marginTop: spacing(2),
    paddingTop: spacing(2),
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  trackSub: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    gap: spacing(1.5),
    marginTop: spacing(2),
    marginBottom: spacing(2),
  },
  statCard: { flex: 1, padding: spacing(2) },
  statLabel: {
    color: colors.inkSoft,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.orange,
    marginTop: 4,
    letterSpacing: -0.5,
  },
  statGoal: { color: colors.inkSoft, fontSize: 12, marginTop: 2 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: spacing(1.5),
  },
});
