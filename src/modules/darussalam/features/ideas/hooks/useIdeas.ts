import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/darussalam/db';
import type { Idea, IdeaCaptureType, IdeaFile, IdeaNote, IdeaLink } from '@/modules/darussalam/types';

export interface IdeaWithRoom extends Idea {
  roomName: string | null;
}

async function attachRoomNames(ideas: Idea[]): Promise<IdeaWithRoom[]> {
  const roomIds = [...new Set(ideas.map((i) => i.roomId).filter(Boolean))] as string[];
  const rooms = await db.rooms.bulkGet(roomIds);
  const nameById = new Map(roomIds.map((id, i) => [id, rooms[i]?.name ?? null]));
  return ideas.map((idea) => ({ ...idea, roomName: idea.roomId ? nameById.get(idea.roomId) ?? null : null }));
}

export function useIdea(ideaId: string | undefined) {
  const result = useLiveQuery(async () => {
    if (!ideaId) return null;
    const idea = await db.ideas.get(ideaId);
    if (!idea) return null;
    const room = idea.roomId ? await db.rooms.get(idea.roomId) : null;
    const files = idea.fileIds?.length ? await db.files.bulkGet(idea.fileIds) : [];
    return { idea, roomName: room?.name ?? null, files: (files.filter(Boolean) as IdeaFile[]) };
  }, [ideaId]);

  return {
    idea: result?.idea ?? null,
    roomName: result?.roomName ?? null,
    files: result?.files ?? [],
    isLoading: result === undefined,
  };
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

export function useInspirationIdeas(roomId?: string) {
  const result = useLiveQuery(async () => {
    const all = await db.ideas.toArray();
    const filtered = all.filter((i) => i.inInspiration && (!roomId || i.roomId === roomId));
    return attachRoomNames(filtered.sort((a, b) => b.createdAt - a.createdAt));
  }, [roomId]);

  return (result ?? []) as IdeaWithRoom[];
}

export function useIdeaFirstFile(ideaId: string) {
  const result = useLiveQuery(async () => {
    const idea = await db.ideas.get(ideaId);
    if (!idea?.fileIds?.length) return null;
    return (await db.files.get(idea.fileIds[0])) ?? null;
  }, [ideaId]);
  return result ?? null;
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

export async function toggleIdeaFavorite(idea: Idea) {
  await db.ideas.update(idea.id, { favorite: !idea.favorite, updatedAt: Date.now() });
}

export async function toggleIdeaInspiration(idea: Idea) {
  await db.ideas.update(idea.id, { inInspiration: !idea.inInspiration, updatedAt: Date.now() });
}

export async function addIdeaNote(idea: Idea, text: string) {
  const note: IdeaNote = { id: `note_${Date.now().toString(36)}`, text: text.trim(), createdAt: Date.now() };
  const notesList = [...(idea.notesList ?? []), note];
  await db.ideas.update(idea.id, { notesList, updatedAt: Date.now() });
}

export async function addIdeaLink(idea: Idea, link: { label: string; url: string }) {
  const entry: IdeaLink = { id: `link_${Date.now().toString(36)}`, label: link.label.trim() || link.url, url: link.url.trim() };
  const links = [...(idea.links ?? []), entry];
  await db.ideas.update(idea.id, { links, updatedAt: Date.now() });
}

export async function toggleIdeaRequirement(idea: Idea, requirementId: string) {
  const requirements = (idea.requirements ?? []).map((r) => (r.id === requirementId ? { ...r, done: !r.done } : r));
  await db.ideas.update(idea.id, { requirements, updatedAt: Date.now() });
}
