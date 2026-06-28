import { useEffect, useState } from 'react';
import { db } from '@/modules/nazara/db';

export function usePhotoUrl(photoId: string | undefined, thumbnail = false): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!photoId) {
      setUrl(undefined);
      return;
    }
    let objectUrl: string | undefined;
    let cancelled = false;

    db.photos.get(photoId).then((photo) => {
      if (cancelled || !photo) return;
      const blob = (thumbnail && photo.thumbnail) || photo.blob;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoId, thumbnail]);

  return url;
}

export function usePhotoUrls(photoIds: string[]): (string | undefined)[] {
  const [urls, setUrls] = useState<(string | undefined)[]>([]);
  const key = photoIds.join(',');

  useEffect(() => {
    let cancelled = false;
    const objectUrls: string[] = [];

    Promise.all(
      photoIds.map(async (id) => {
        const photo = await db.photos.get(id);
        if (!photo) return undefined;
        const url = URL.createObjectURL(photo.blob);
        objectUrls.push(url);
        return url;
      }),
    ).then((resolved) => {
      if (!cancelled) setUrls(resolved);
    });

    return () => {
      cancelled = true;
      objectUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [key]);

  return urls;
}
