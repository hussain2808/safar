import { db } from '@/modules/darussalam/db';

const LEGACY_SEED_ROOM_IDS = [
  'room_kitchen', 'room_living', 'room_prayer', 'room_master',
  'room_garden', 'room_garage', 'room_entrance', 'room_staircase',
];

export async function cleanupLegacySeedData() {
  const existing = await db.rooms.bulkGet(LEGACY_SEED_ROOM_IDS);
  const idsToRemove = LEGACY_SEED_ROOM_IDS.filter((_, i) => existing[i]);
  if (idsToRemove.length === 0) return;

  const ideasToRemove = await db.ideas
    .filter((idea) => !!idea.roomId && idsToRemove.includes(idea.roomId))
    .primaryKeys();

  await db.transaction('rw', [db.rooms, db.ideas], async () => {
    await db.rooms.bulkDelete(idsToRemove);
    await db.ideas.bulkDelete(ideasToRemove);
  });
}
