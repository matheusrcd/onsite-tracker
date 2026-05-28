import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Side-effect import: registers the background TaskManager task.
import './src/tracking';

import { colors } from './src/theme';
import {
  Goals,
  OfficeLocation,
  Visit,
  getGoals,
  getOffices,
  getVisits,
  getTrackingEnabled,
} from './src/storage';
import { isTrackingRunning } from './src/tracking';
import { TabBar, TabKey } from './src/ui/TabBar';
import { TodayScreen } from './src/screens/TodayScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { GoalsScreen } from './src/screens/GoalsScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { AddVisitScreen } from './src/screens/AddVisitScreen';

export default function App() {
  const [tab, setTab] = useState<TabKey>('today');
  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [goals, setGoals] = useState<Goals>({ perWeek: 3, perMonth: 12 });
  const [tracking, setTracking] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    const [o, v, g, t, running] = await Promise.all([
      getOffices(),
      getVisits(),
      getGoals(),
      getTrackingEnabled(),
      isTrackingRunning(),
    ]);
    setOffices(o);
    setVisits(v);
    setGoals(g);
    setTracking(t && running);
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // First run: prompt to set office.
  useEffect(() => {
    if (ready && offices.length === 0) setSetupOpen(true);
  }, [ready, offices.length]);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.brandBar}>
        <View style={styles.brandLogo}>
          <Text style={styles.brandLogoText}>✓</Text>
        </View>
        <Text style={styles.brandText}>
          Presenc<Text style={{ color: colors.orange }}>i</Text>ei
        </Text>
        <Pressable onPress={() => setSetupOpen(true)} hitSlop={10} style={styles.gear}>
          <Text style={styles.gearText}>⚙︎</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1 }}>
        {tab === 'today' && (
          <TodayScreen
            offices={offices}
            visits={visits}
            goals={goals}
            tracking={tracking}
            onChange={refresh}
            onSetupPress={() => setSetupOpen(true)}
          />
        )}
        {tab === 'history' && (
          <HistoryScreen
            visits={visits}
            onChange={refresh}
            onAddPress={() => setAddOpen(true)}
          />
        )}
        {tab === 'goals' && (
          <GoalsScreen goals={goals} visits={visits} onChange={refresh} />
        )}
      </View>

      <TabBar active={tab} onChange={setTab} />

      <Modal
        visible={setupOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSetupOpen(false)}
      >
        <SetupScreen
          offices={offices}
          onDone={refresh}
          onClose={() => setSetupOpen(false)}
        />
      </Modal>

      <Modal
        visible={addOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddOpen(false)}
      >
        <AddVisitScreen
          offices={offices}
          visits={visits}
          onDone={refresh}
          onClose={() => setAddOpen(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: colors.bg,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.orange,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLogoText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
    marginTop: -1,
  },
  brandText: { fontSize: 18, fontWeight: '700', color: colors.ink, letterSpacing: -0.2 },
  gear: { marginLeft: 'auto', padding: 4 },
  gearText: { fontSize: 22, color: colors.blue },
});
