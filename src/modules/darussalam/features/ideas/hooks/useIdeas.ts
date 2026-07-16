import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/darussalam/db';
import type { Idea, IdeaCaptureType } from '@/modules/darussalam/types';

export interface IdeaWithRoom extends Idea {
  roomName: string | null;
}

async function attachRoomNames(ideas: Idea[]): Promise<IdeaWithRoom[]> {
  const roomIds = [...new Set(ideas.map((i) => i.roomId).filter(Boolean))] as string[];
  const rooms = await db.rooms.bulkGet(roomIds);
  const nameById = new Map(roomIds.map((id, i) => [id, rooms[i]?.name ?? null]));
  return ideas.map((idea) => ({ ...idea, roomName: idea.roomId ? nameById.get(idea.roomId) ?? null : null }));
}

export function useRecentIdeas(limit = 3) {
  const result = useLiveQuery(async () => {
    const ideas = await db.ideas.orderBy('createdAt').reverse().filter((i) => !i.archived).limit(limit).toArray();
    return attachRoomNames(ideas);
  }, [limit]);

  return {
    ideas: (result ?? []) as IdeaWithRoom[],
    isLoading: result === undefined,
  };
}

function makeId() {
  return `idea_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export async function captureNote(input: { title: string; roomId?: string | null }) {
  const now = Date.now();
  const idea: Idea = {
    id: makeId(),
    roomId: input.roomId ?? null,
    type: 'note',
    title: input.title.trim(),
    createdAt: now,
    updatedAt: now,
  };
  await db.ideas.add(idea);
  return idea;
}

export async function captureLink(input: { url: string; title?: string; roomId?: string | null }) {
  const now = Date.now();
  const idea: Idea = {
    id: makeId(),
    roomId: input.roomId ?? null,
    type: 'link',
    title: input.title?.trim() || input.url,
    linkUrl: input.url.trim(),
    createdAt: now,
    updatedAt: now,
  };
  await db.ideas.add(idea);
  return idea;
}

export async function captureMedia(input: { type: Extract<IdeaCaptureType, 'photo' | 'video' | 'voice'>; file: Blob; mimeType: string; title?: string; durationSeconds?: number; roomId?: string | null }) {
  const now = Date.now();
  const ideaId = makeId();
  const fileId = `file_${Math.random().toString(36).slice(2, 10)}${now.toString(36)}`;

  const idea: Idea = {
    id: ideaId,
    roomId: input.roomId ?? null,
    type: input.type,
    title: input.title?.trim() || (input.type === 'photo' ? 'Photo idea' : input.type === 'video' ? 'Video idea' : 'Voice note'),
    fileIds: [fileId],
    createdAt: now,
    updatedAt: now,
  };

  await db.files.add({
    id: fileId,
    ideaId,
    blob: input.file,
    mimeType: input.mimeType,
    durationSeconds: input.durationSeconds,
    createdAt: now,
  });
  await db.ideas.add(idea);
  return idea;
}
