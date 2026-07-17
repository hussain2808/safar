import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/darussalam/db';
import type { RoomNote } from '@/modules/darussalam/types';

function makeId() {
  return `note_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function useRoomNotes(roomId: string | undefined) {
  const result = useLiveQuery(async () => {
    if (!roomId) return [];
    const rows = await db.notes.where('roomId').equals(roomId).toArray();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  }, [roomId]);

  return result ?? [];
}

export async function addRoomNote(roomId: string, text: string) {
  const note: RoomNote = { id: makeId(), roomId, text: text.trim(), createdAt: Date.now() };
  await db.notes.add(note);
  return note;
}

export async function deleteRoomNote(id: string) {
  await db.notes.delete(id);
}
