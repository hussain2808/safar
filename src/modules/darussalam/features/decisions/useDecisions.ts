import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/darussalam/db';
import type { Decision } from '@/modules/darussalam/types';

function makeId() {
  return `decision_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function useDecisions(roomId?: string | null) {
  const result = useLiveQuery(async () => {
    const all = await db.decisions.toArray();
    const filtered = roomId ? all.filter((d) => d.roomId === roomId) : all;
    return filtered.sort((a, b) => b.date - a.date);
  }, [roomId]);

  return result ?? [];
}

export async function addDecision(input: { title: string; reason?: string; alternatives?: string; decisionMaker?: string; roomId?: string | null; date?: number }) {
  const now = Date.now();
  const decision: Decision = {
    id: makeId(),
    title: input.title.trim(),
    reason: input.reason?.trim() || undefined,
    alternatives: input.alternatives?.trim() || undefined,
    decisionMaker: input.decisionMaker?.trim() || undefined,
    roomId: input.roomId ?? null,
    date: input.date ?? now,
    createdAt: now,
    updatedAt: now,
  };
  await db.decisions.add(decision);
  return decision;
}

export async function deleteDecision(id: string) {
  const decision = await db.decisions.get(id);
  if (!decision) return null;
  await db.decisions.delete(id);
  return decision;
}

export async function restoreDecision(decision: Decision) {
  await db.decisions.add(decision);
}
