import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { getOffices, recordVisitToday, setTrackingEnabled, OfficeLocation } from './storage';
import { distanceMeters } from './geo';

export const BG_LOCATION_TASK = 'onsite-tracker.background-location';

function findHit(
  loc: { latitude: number; longitude: number },
  offices: OfficeLocation[],
): { office: OfficeLocation; distance: number } | null {
  let best: { office: OfficeLocation; distance: number } | null = null;
  for (const office of offices) {
    const d = distanceMeters(loc, { latitude: office.latitude, longitude: office.longitude });
    if (d <= office.radiusMeters && (!best || d < best.distance)) {
      best = { office, distance: d };
    }
  }
  return best;
}

function findNearest(
  loc: { latitude: number; longitude: number },
  offices: OfficeLocation[],
): { office: OfficeLocation; distance: number } | null {
  let best: { office: OfficeLocation; distance: number } | null = null;
  for (const office of offices) {
    const d = distanceMeters(loc, { latitude: office.latitude, longitude: office.longitude });
    if (!best || d < best.distance) best = { office, distance: d };
  }
  return best;
}

TaskManager.defineTask(BG_LOCATION_TASK, async ({ data, error }: any) => {
  if (error) return;
  const locations: Location.LocationObject[] | undefined = data?.locations;
  if (!locations?.length) return;
  const offices = await getOffices();
  if (!offices.length) return;
  for (const loc of locations) {
    const hit = findHit(
      { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
      offices,
    );
    if (hit) {
      await recordVisitToday('auto', { id: hit.office.id, name: hit.office.name });
      return;
    }
  }
});

export async function startBackgroundTracking(): Promise<
  { ok: true } | { ok: false; reason: string }
> {
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
  const already = await Location.hasStartedLocationUpdatesAsync(BG_LOCATION_TASK);
  if (!already) {
    await Location.startLocationUpdatesAsync(BG_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 50,
      timeInterval: 5 * 60 * 1000,
      showsBackgroundLocationIndicator: false,
      pausesUpdatesAutomatically: true,
      foregroundService: {
        notificationTitle: 'Presenciei',
        notificationBody: 'Detectando check-ins no escritório em segundo plano',
        notificationColor: '#EC7000',
      },
    });
  }
  await setTrackingEnabled(true);
  return { ok: true };
}

export async function stopBackgroundTracking(): Promise<void> {
  const started = await Location.hasStartedLocationUpdatesAsync(BG_LOCATION_TASK).catch(
    () => false,
  );
  if (started) {
    await Location.stopLocationUpdatesAsync(BG_LOCATION_TASK);
  }
  await setTrackingEnabled(false);
}

export async function isTrackingRunning(): Promise<boolean> {
  try {
    return await Location.hasStartedLocationUpdatesAsync(BG_LOCATION_TASK);
  } catch {
    return false;
  }
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
  const hit = findHit(here, offices);
  if (hit) {
    await recordVisitToday('manual', { id: hit.office.id, name: hit.office.name });
    return { ok: true, distance: hit.distance, officeName: hit.office.name };
  }
  const nearest = findNearest(here, offices);
  return {
    ok: false,
    reason: 'Você ainda não está em nenhum escritório.',
    distance: nearest?.distance,
    nearestName: nearest?.office.name,
  };
}
