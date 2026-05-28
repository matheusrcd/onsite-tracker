import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import {
  OfficeLocation,
  getOffices,
  getTrackingEnabled,
  recordVisitToday,
  setTrackingEnabled,
} from './storage';
import { distanceMeters } from './geo';

// Native region-monitoring task. On iOS this maps to CLCircularRegion
// monitoring — battery-cheap, persists across app termination AND device
// reboot, wakes the app on enter. On Android it uses Google Play Services
// Geofencing API; geofences are dropped on reboot, so we re-register on
// every app launch via syncGeofences().
export const BG_GEOFENCE_TASK = 'presenciei.geofence';

// Earlier builds used a continuous-location task; keep a no-op handler
// defined so the OS doesn't error out if it replays a queued event after
// upgrade, and stop it if it's still running.
const LEGACY_LOCATION_TASK = 'onsite-tracker.background-location';
TaskManager.defineTask(LEGACY_LOCATION_TASK, async () => {});

TaskManager.defineTask(BG_GEOFENCE_TASK, async ({ data, error }: any) => {
  if (error) return;
  if (!data) return;
  const { eventType, region } = data as {
    eventType: number;
    region: { identifier: string; latitude: number; longitude: number; radius: number };
  };
  // We only care about entering an office. Exit events would just spam.
  if (eventType !== Location.GeofencingEventType.Enter) return;
  const offices = await getOffices();
  const office = offices.find((o) => o.id === region.identifier);
  await recordVisitToday(
    'auto',
    office ? { id: office.id, name: office.name } : undefined,
  );
});

function regionsFromOffices(offices: OfficeLocation[]) {
  return offices.map((o) => ({
    identifier: o.id,
    latitude: o.latitude,
    longitude: o.longitude,
    radius: o.radiusMeters,
    notifyOnEnter: true,
    notifyOnExit: false,
  }));
}

async function cleanupLegacyTask(): Promise<void> {
  try {
    const running = await Location.hasStartedLocationUpdatesAsync(LEGACY_LOCATION_TASK);
    if (running) await Location.stopLocationUpdatesAsync(LEGACY_LOCATION_TASK);
  } catch {
    // ignore — task was never registered on this install
  }
}

async function applyGeofences(): Promise<void> {
  const offices = await getOffices();
  const running = await Location.hasStartedGeofencingAsync(BG_GEOFENCE_TASK).catch(
    () => false,
  );
  if (offices.length === 0) {
    if (running) {
      await Location.stopGeofencingAsync(BG_GEOFENCE_TASK).catch(() => undefined);
    }
    return;
  }
  // startGeofencingAsync replaces any previously registered region set for
  // the same task, so this is safe to call after every office mutation.
  await Location.startGeofencingAsync(BG_GEOFENCE_TASK, regionsFromOffices(offices));
}

export async function startBackgroundTracking(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
  await cleanupLegacyTask();
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') {
    return { ok: false, reason: 'Permissão de localização negada.' };
  }
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (bg.status !== 'granted') {
    return {
      ok: false,
      reason:
        'Permissão de localização em segundo plano negada — abra Ajustes → Localização e escolha "Sempre".',
    };
  }
  const offices = await getOffices();
  if (offices.length === 0) {
    return { ok: false, reason: 'Cadastre um escritório primeiro.' };
  }
  await applyGeofences();
  await setTrackingEnabled(true);
  return { ok: true };
}

export async function stopBackgroundTracking(): Promise<void> {
  await cleanupLegacyTask();
  const running = await Location.hasStartedGeofencingAsync(BG_GEOFENCE_TASK).catch(
    () => false,
  );
  if (running) {
    await Location.stopGeofencingAsync(BG_GEOFENCE_TASK).catch(() => undefined);
  }
  await setTrackingEnabled(false);
}

export async function isTrackingRunning(): Promise<boolean> {
  try {
    return await Location.hasStartedGeofencingAsync(BG_GEOFENCE_TASK);
  } catch {
    return false;
  }
}

// Called from App.tsx after every data refresh:
// - if the user added/edited/removed an office, the new region set is
//   re-registered (startGeofencingAsync clobbers the previous one).
// - on Android, geofences are dropped by Play Services on device reboot;
//   calling this on app launch puts them back.
// - iOS persists geofences across reboot, so the call is idempotent there.
export async function syncGeofences(): Promise<void> {
  await cleanupLegacyTask();
  const shouldRun = await getTrackingEnabled();
  if (!shouldRun) return;
  // Re-check permissions silently — don't prompt here. If the user revoked
  // background permission outside the app, applyGeofences will throw and
  // we surface that the next time they toggle the switch.
  const bg = await Location.getBackgroundPermissionsAsync().catch(() => null);
  if (!bg || bg.status !== 'granted') return;
  await applyGeofences().catch(() => undefined);
}

export type CheckInResult =
  | { ok: true; distance: number; officeName: string }
  | { ok: false; reason: string; distance?: number; nearestName?: string };

export async function checkInNow(): Promise<CheckInResult> {
  const offices = await getOffices();
  if (!offices.length) {
    return { ok: false, reason: 'Cadastre um escritório primeiro.' };
  }
  const perm = await Location.requestForegroundPermissionsAsync();
  if (perm.status !== 'granted') {
    return { ok: false, reason: 'Permissão de localização negada.' };
  }
  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const here = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  let best: { office: OfficeLocation; distance: number } | null = null;
  let nearest: { office: OfficeLocation; distance: number } | null = null;
  for (const office of offices) {
    const d = distanceMeters(here, {
      latitude: office.latitude,
      longitude: office.longitude,
    });
    if (d <= office.radiusMeters && (!best || d < best.distance)) {
      best = { office, distance: d };
    }
    if (!nearest || d < nearest.distance) {
      nearest = { office, distance: d };
    }
  }
  if (best) {
    await recordVisitToday('manual', { id: best.office.id, name: best.office.name });
    return { ok: true, distance: best.distance, officeName: best.office.name };
  }
  return {
    ok: false,
    reason: 'Você ainda não está em nenhum escritório.',
    distance: nearest?.distance,
    nearestName: nearest?.office.name,
  };
}
