import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/modules/sanad/db';
import { getDocumentStatus } from '@/modules/sanad/lib/documentStatus';
import type { DocumentRecord } from '@/modules/sanad/types';

export function useDocument(documentId: string | undefined) {
  const result = useLiveQuery(async () => {
    if (!documentId) return null;
    const document = await db.documents.get(documentId);
    return document ?? null;
  }, [documentId]);

  const document = (result ?? null) as DocumentRecord | null;

  return {
    document,
    status: document ? getDocumentStatus(document.expiryDate) : ('none' as const),
    isLoading: result === undefined,
  };
}
