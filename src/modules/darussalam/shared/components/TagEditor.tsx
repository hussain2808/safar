import { useState } from 'react';
import { X } from 'lucide-react';

export function TagEditor({
  tags, onAdd, onRemove, placeholder,
}: { tags: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void; placeholder: string }) {
  const [value, setValue] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 text-xs bg-darussalam-tile text-text-secondary px-2.5 py-1 rounded-full">
            {tag}
            <button onClick={() => onRemove(tag)}><X size={11} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) { onAdd(value); setValue(''); } }}
          placeholder={placeholder}
          className="flex-1 bg-darussalam-tile rounded-full px-3 py-1.5 text-xs outline-none"
        />
        <button
          onClick={() => { if (value.trim()) { onAdd(value); setValue(''); } }}
          className="text-darussalam-green text-xs font-medium px-2"
        >
          Add
        </button>
      </div>
    </div>
  );
}
