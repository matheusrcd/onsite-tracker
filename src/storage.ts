import AsyncStorage from '@react-native-async-storage/async-storage';

export const MAX_OFFICES = 3;

export type OfficeLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
};

export type Visit = {
  // ISO date (YYYY-MM-DD) — one visit per day max
  date: string;
  // Epoch ms of the record creation
  detectedAt: number;
  // 'auto' = geofence/background, 'manual' = user tap, 'added' = manually added
  source: 'auto' | 'manual' | 'added';
  // Which office triggered/was assigned to this visit. Kept on the record
  // even if the office is later removed.
  officeId?: string;
  officeName?: string;
};

export type Goals = {
  perWeek: number;
  perMonth: number;
};

const K = {
  offices: 'onsite:offices',
  officeLegacy: 'onsite:office', // pre-multi-office key
  visits: 'onsite:visits',
  goals: 'onsite:goals',
  tracking: 'onsite:tracking',
};

export function newOfficeId(): string {
  return 'o_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function getOffices(): Promise<OfficeLocation[]> {
  const raw = await AsyncStorage.getItem(K.offices);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as OfficeLocation[];
      if (Array.isArray(parsed)) return parsed.slice(0, MAX_OFFICES);
    } catch {}
  }
  // Migrate the old singleton key if it exists.
  const legacy = await AsyncStorage.getItem(K.officeLegacy);
  if (legacy) {
    try {
      const obj = JSON.parse(legacy);
      if (obj && typeof obj === 'object' && obj.latitude != null) {
        const migrated: OfficeLocation[] = [
          {
            id: newOfficeId(),
            name: obj.name ?? 'Escritório',
            latitude: obj.latitude,
            longitude: obj.longitude,
            radiusMeters: obj.radiusMeters ?? 120,
          },
        ];
        await AsyncStorage.setItem(K.offices, JSON.stringify(migrated));
        await AsyncStorage.removeItem(K.officeLegacy);
        return migrated;
      }
    } catch {}
  }
  return [];
}

export async function saveOffices(list: OfficeLocation[]): Promise<void> {
  await AsyncStorage.setItem(K.offices, JSON.stringify(list.slice(0, MAX_OFFICES)));
}

export async function upsertOffice(office: OfficeLocation): Promise<OfficeLocation[]> {
  const list = await getOffices();
  const idx = list.findIndex((o) => o.id === office.id);
  let next: OfficeLocation[];
  if (idx >= 0) {
    next = [...list];
    next[idx] = office;
  } else {
    if (list.length >= MAX_OFFICES) return list;
    next = [...list, office];
  }
  await saveOffices(next);
  return next;
}

export async function removeOffice(id: string): Promise<OfficeLocation[]> {
  const list = await getOffices();
  const next = list.filter((o) => o.id !== id);
  await saveOffices(next);
  return next;
}

export async function getVisits(): Promise<Visit[]> {
  const raw = await AsyncStorage.getItem(K.visits);
  return raw ? (JSON.parse(raw) as Visit[]) : [];
}

export async function recordVisitToday(
  source: Visit['source'],
  office?: { id: string; name: string },
): Promise<Visit[]> {
  return addVisit(isoDate(new Date()), source, office);
}

export async function addVisit(
  date: string,
  source: Visit['source'],
  office?: { id: string; name: string },
): Promise<Visit[]> {
  const visits = await getVisits();
  if (visits.find((v) => v.date === date)) return visits;
  const next: Visit = {
    date,
    detectedAt: Date.now(),
    source,
    officeId: office?.id,
    officeName: office?.name,
  };
  const updated = [...visits, next].sort((a, b) => a.date.localeCompare(b.date));
  await AsyncStorage.setItem(K.visits, JSON.stringify(updated));
  return updated;
}

export async function removeVisit(date: string): Promise<Visit[]> {
  const visits = await getVisits();
  const updated = visits.filter((v) => v.date !== date);
  await AsyncStorage.setItem(K.visits, JSON.stringify(updated));
  return updated;
}

export async function getGoals(): Promise<Goals> {
  const raw = await AsyncStorage.getItem(K.goals);
  return raw ? (JSON.parse(raw) as Goals) : { perWeek: 3, perMonth: 12 };
}

export async function setGoals(g: Goals): Promise<void> {
  await AsyncStorage.setItem(K.goals, JSON.stringify(g));
}

export async function getTrackingEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(K.tracking);
  return raw === '1';
}

export async function setTrackingEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(K.tracking, enabled ? '1' : '0');
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function weekRange(ref: Date): { start: Date; end: Date } {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - dow);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

export function monthRange(ref: Date): { start: Date; end: Date } {
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
  return { start, end };
}

export function countVisitsBetween(visits: Visit[], start: Date, end: Date): number {
  const s = isoDate(start);
  const e = isoDate(end);
  return visits.filter((v) => v.date >= s && v.date <= e).length;
}
