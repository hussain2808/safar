import { useEffect, useState } from 'react';
import { db } from '@/modules/amaanat/db';

export function usePhotoUrl(photoId: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoId) {
      setUrl(null);
      return;
    }
    let objectUrl: string | null = null;
    (async () => {
      const photo = await db.photos.get(photoId);
      if (photo) {
        objectUrl = URL.createObjectURL(photo.thumbnail);
        setUrl(objectUrl);
      }
    })();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoId]);

  return url;
}
