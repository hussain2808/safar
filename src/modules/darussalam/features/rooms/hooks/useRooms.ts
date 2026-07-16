import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/modules/darussalam/db';
import type { Room } from '@/modules/darussalam/types';

export interface RoomWithStats extends Room {
  ideaCount: number;
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
