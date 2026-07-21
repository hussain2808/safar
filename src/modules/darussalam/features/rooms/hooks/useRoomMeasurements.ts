import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/darussalam/db';
import type { Measurement } from '@/modules/darussalam/types';

function makeId() {
  return `measure_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function useRoomMeasurements(roomId: string | undefined) {
  const result = useLiveQuery(async () => {
    if (!roomId) return [];
    const rows = await db.measurements.where('roomId').equals(roomId).toArray();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  }, [roomId]);

  return result ?? [];
}

export async function addMeasurement(roomId: string, input: { label: string; value: string; unit?: string }) {
  const measurement: Measurement = {
    id: makeId(),
    roomId,
    label: input.label.trim(),
    value: input.value.trim(),
    unit: input.unit?.trim() || undefined,
    createdAt: Date.now(),
  };
  await db.measurements.add(measurement);
  return measurement;
}

export async function deleteMeasurement(id: string) {
  const measurement = await db.measurements.get(id);
  if (!measurement) return null;
  await db.measurements.delete(id);
  return measurement;
}

export async function restoreMeasurement(measurement: Measurement) {
  await db.measurements.add(measurement);
}
