import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '@/modules/sanad/db';
import { getDocumentStatus } from '@/modules/sanad/lib/documentStatus';
import type { DocumentRecord, DocumentStatus } from '@/modules/sanad/types';

export interface DocumentWithStatus extends DocumentRecord {
  status: DocumentStatus;
}

export function useDocuments() {
  const result = useLiveQuery(async () => {
    const documents = await db.documents.toArray();
    return documents.sort((a, b) => b.createdAt - a.createdAt);
  });

  const documents = useMemo<DocumentWithStatus[]>(
    () => (result ?? []).map((doc) => ({ ...doc, status: getDocumentStatus(doc.expiryDate) })),
    [result],
  );

  const attentionDocuments = useMemo(
    () => documents.filter((d) => d.status === 'expired' || d.status === 'expiring_soon'),
    [documents],
  );

  const stats = useMemo(() => ({
    total: documents.length,
    valid: documents.filter((d) => d.status === 'valid').length,
    expiringSoon: documents.filter((d) => d.status === 'expiring_soon').length,
    expired: documents.filter((d) => d.status === 'expired').length,
  }), [documents]);

  const upcomingReminders = useMemo(
    () => documents
      .filter((d) => !!d.expiryDate && d.status !== 'none')
      .sort((a, b) => a.expiryDate! - b.expiryDate!)
      .slice(0, 5),
    [documents],
  );

  return { documents, attentionDocuments, stats, upcomingReminders, isLoading: result === undefined };
}
