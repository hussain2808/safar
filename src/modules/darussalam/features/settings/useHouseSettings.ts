import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/darussalam/db';
import type { HouseSettings } from '@/modules/darussalam/types';

const defaults: HouseSettings = {
  id: 'house',
  houseName: 'Darussalam',
  houseSubtitle: 'Our Home, In Sha Allah',
  currency: 'AED',
  units: 'metric',
  updatedAt: Date.now(),
};

export function useHouseSettings() {
  const result = useLiveQuery(async () => (await db.settings.get('house')) ?? defaults);
  return result ?? defaults;
}

export async function updateHouseSettings(changes: Partial<HouseSettings>) {
  const existing = (await db.settings.get('house')) ?? defaults;
  await db.settings.put({ ...existing, ...changes, id: 'house', updatedAt: Date.now() });
}

export async function exportAllData() {
  const [rooms, ideas, measurements, notes, decisions, wishlistItems, documents, visionBoard, settings] = await Promise.all([
    db.rooms.toArray(),
    db.ideas.toArray(),
    db.measurements.toArray(),
    db.notes.toArray(),
    db.decisions.toArray(),
    db.wishlistItems.toArray(),
    db.documents.toArray(),
    db.visionBoard.toArray(),
    db.settings.toArray(),
  ]);
  const payload = { rooms, ideas, measurements, notes, decisions, wishlistItems, documents, visionBoard, settings, exportedAt: Date.now() };
  return JSON.stringify(payload, null, 2);
}

export async function importAllData(json: string) {
  const payload = JSON.parse(json);
  await db.transaction('rw', [db.rooms, db.ideas, db.measurements, db.notes, db.decisions, db.wishlistItems, db.documents, db.visionBoard, db.settings], async () => {
    if (payload.rooms) await db.rooms.bulkPut(payload.rooms);
    if (payload.ideas) await db.ideas.bulkPut(payload.ideas);
    if (payload.measurements) await db.measurements.bulkPut(payload.measurements);
    if (payload.notes) await db.notes.bulkPut(payload.notes);
    if (payload.decisions) await db.decisions.bulkPut(payload.decisions);
    if (payload.wishlistItems) await db.wishlistItems.bulkPut(payload.wishlistItems);
    if (payload.documents) await db.documents.bulkPut(payload.documents);
    if (payload.visionBoard) await db.visionBoard.bulkPut(payload.visionBoard);
    if (payload.settings) await db.settings.bulkPut(payload.settings);
  });
}
