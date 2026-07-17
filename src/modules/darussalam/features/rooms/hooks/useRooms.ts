import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/modules/darussalam/db';
import type { Room, RoomCategory, RoomRequirement } from '@/modules/darussalam/types';

export interface RoomWithStats extends Room {
  ideaCount: number;
}

export interface RoomStats {
  ideaCount: number;
  measurementCount: number;
  noteCount: number;
  decisionCount: number;
  documentCount: number;
}

export function useRooms() {
  const result = useLiveQuery(async () => {
    const rooms = await db.rooms.toArray();
    const counts = await Promise.all(
      rooms.map((room) => db.ideas.where('roomId').equals(room.id).count()),
    );
    return rooms
      .map((room, i) => ({ ...room, ideaCount: counts[i] }))
      .sort((a, b) => a.order - b.order);
  });

  return {
    rooms: (result ?? []) as RoomWithStats[],
    isLoading: result === undefined,
  };
}

export function useRoom(roomId: string | undefined) {
  const result = useLiveQuery(async () => {
    if (!roomId) return null;
    const room = await db.rooms.get(roomId);
    if (!room) return null;
    const ideaCount = await db.ideas.where('roomId').equals(roomId).count();
    return { ...room, ideaCount } as RoomWithStats;
  }, [roomId]);

  return {
    room: result ?? null,
    isLoading: result === undefined,
  };
}

export function useRoomStats(roomId: string | undefined) {
  const result = useLiveQuery(async () => {
    if (!roomId) return null;
    const [ideaCount, measurementCount, noteCount, decisionCount, documentCount] = await Promise.all([
      db.ideas.where('roomId').equals(roomId).count(),
      db.measurements.where('roomId').equals(roomId).count(),
      db.notes.where('roomId').equals(roomId).count(),
      db.decisions.where('roomId').equals(roomId).count(),
      db.documents.where('roomId').equals(roomId).count(),
    ]);
    return { ideaCount, measurementCount, noteCount, decisionCount, documentCount } as RoomStats;
  }, [roomId]);

  return result ?? { ideaCount: 0, measurementCount: 0, noteCount: 0, decisionCount: 0, documentCount: 0 };
}

export function useRoomTopIdeas(roomId: string | undefined, limit = 3) {
  const result = useLiveQuery(async () => {
    if (!roomId) return [];
    const ideas = await db.ideas.where('roomId').equals(roomId).toArray();
    return ideas
      .filter((i) => !i.archived)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }, [roomId, limit]);

  return useMemo(() => result ?? [], [result]);
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export async function createRoom(input: { name: string; icon: string; category: RoomCategory }) {
  const now = Date.now();
  const maxOrder = (await db.rooms.orderBy('order').last())?.order ?? -1;
  const room: Room = {
    id: makeId('room'),
    name: input.name.trim(),
    icon: input.icon,
    category: input.category,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };
  await db.rooms.add(room);
  return room;
}

export async function updateRoom(roomId: string, changes: Partial<Room>) {
  await db.rooms.update(roomId, { ...changes, updatedAt: Date.now() });
}

export async function deleteRoom(roomId: string) {
  await db.rooms.delete(roomId);
}

export async function addRoomRequirement(room: Room, label: string) {
  const requirement: RoomRequirement = { id: makeId('req'), label: label.trim(), done: false };
  const requirements = [...(room.requirements ?? []), requirement];
  await updateRoom(room.id, { requirements });
}

export async function toggleRoomRequirement(room: Room, requirementId: string) {
  const requirements = (room.requirements ?? []).map((r) => (r.id === requirementId ? { ...r, done: !r.done } : r));
  await updateRoom(room.id, { requirements });
}

export async function removeRoomRequirement(room: Room, requirementId: string) {
  const requirements = (room.requirements ?? []).filter((r) => r.id !== requirementId);
  await updateRoom(room.id, { requirements });
}

export async function addRoomMoodTag(room: Room, tag: string) {
  const moodTags = [...new Set([...(room.moodTags ?? []), tag.trim()])];
  await updateRoom(room.id, { moodTags });
}

export async function removeRoomMoodTag(room: Room, tag: string) {
  const moodTags = (room.moodTags ?? []).filter((t) => t !== tag);
  await updateRoom(room.id, { moodTags });
}

export async function addRoomColor(room: Room, hex: string) {
  const colorPalette = [...new Set([...(room.colorPalette ?? []), hex])];
  await updateRoom(room.id, { colorPalette });
}

export async function removeRoomColor(room: Room, hex: string) {
  const colorPalette = (room.colorPalette ?? []).filter((c) => c !== hex);
  await updateRoom(room.id, { colorPalette });
}

export async function addRoomMaterial(room: Room, material: string) {
  const materials = [...new Set([...(room.materials ?? []), material.trim()])];
  await updateRoom(room.id, { materials });
}

export async function removeRoomMaterial(room: Room, material: string) {
  const materials = (room.materials ?? []).filter((m) => m !== material);
  await updateRoom(room.id, { materials });
}
