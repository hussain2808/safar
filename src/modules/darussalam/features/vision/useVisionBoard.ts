import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/darussalam/db';
import type { VisionBoard } from '@/modules/darussalam/types';

export function useVisionBoard() {
  const result = useLiveQuery(async () => (await db.visionBoard.get('house')) ?? null);
  return result ?? null;
}

async function ensureVisionBoard(): Promise<VisionBoard> {
  const existing = await db.visionBoard.get('house');
  if (existing) return existing;
  const fresh: VisionBoard = { id: 'house', updatedAt: Date.now() };
  await db.visionBoard.add(fresh);
  return fresh;
}

export async function updateVisionBoard(changes: Partial<VisionBoard>) {
  await ensureVisionBoard();
  await db.visionBoard.update('house', { ...changes, updatedAt: Date.now() });
}

export async function addVisionTag(tag: string) {
  const board = await ensureVisionBoard();
  const tags = [...new Set([...(board.tags ?? []), tag.trim()])];
  await db.visionBoard.update('house', { tags, updatedAt: Date.now() });
}

export async function removeVisionTag(tag: string) {
  const board = await ensureVisionBoard();
  const tags = (board.tags ?? []).filter((t) => t !== tag);
  await db.visionBoard.update('house', { tags, updatedAt: Date.now() });
}

export async function addVisionColor(hex: string) {
  const board = await ensureVisionBoard();
  const colorPalette = [...new Set([...(board.colorPalette ?? []), hex])];
  await db.visionBoard.update('house', { colorPalette, updatedAt: Date.now() });
}

export async function removeVisionColor(hex: string) {
  const board = await ensureVisionBoard();
  const colorPalette = (board.colorPalette ?? []).filter((c) => c !== hex);
  await db.visionBoard.update('house', { colorPalette, updatedAt: Date.now() });
}

export async function addVisionMaterial(material: string) {
  const board = await ensureVisionBoard();
  const materials = [...new Set([...(board.materials ?? []), material.trim()])];
  await db.visionBoard.update('house', { materials, updatedAt: Date.now() });
}

export async function removeVisionMaterial(material: string) {
  const board = await ensureVisionBoard();
  const materials = (board.materials ?? []).filter((m) => m !== material);
  await db.visionBoard.update('house', { materials, updatedAt: Date.now() });
}
