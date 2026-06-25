import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/modules/hisaab/db';

interface PhotoThumbProps {
  photoId: string;
  onRemove?: () => void;
  className?: string;
}

export function PhotoThumb({ photoId, onRemove, className = 'h-40' }: PhotoThumbProps) {
  const photo = useLiveQuery(() => db.photos.get(photoId), [photoId]);
  const [url, setUrl] = useState<string>();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!photo) return;
    const objUrl = URL.createObjectURL(photo.blob);
    setUrl(objUrl);
    return () => URL.revokeObjectURL(objUrl);
  }, [photo]);

  if (!url) return null;

  return (
    <>
      <div className={`relative rounded-icon overflow-hidden bg-bg-icon ${className}`}>
        <button onClick={() => setExpanded(true)} className="w-full h-full" aria-label="View photo">
          <img src={url} alt="Receipt" className="w-full h-full object-contain" />
        </button>
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center"
            aria-label="Remove photo"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
          >
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-12 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <motion.img
              src={url}
              alt="Receipt"
              className="max-w-full max-h-full object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
