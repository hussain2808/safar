import { ChevronRight } from 'lucide-react';
import { modules } from '../mockData';

export function ModuleGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 px-5 py-3">
      {modules.map((m) => (
        <button
          key={m.key}
          disabled={!m.enabled}
          className={`text-left bg-card-bg border border-card-border rounded-2xl p-4 flex flex-col gap-2 ${
            m.enabled ? 'active:scale-[0.98]' : 'opacity-50'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl ${m.iconBg} flex items-center justify-center overflow-hidden`}>
            {m.image && <img src={m.image} alt={m.title} className="w-8 h-8 object-contain" />}
          </div>
          <div className="flex items-center justify-between">
            <span className="font-serif text-base text-text-primary">{m.title}</span>
            <ChevronRight size={16} className="text-text-muted" />
          </div>
          <span className={`text-xs font-medium ${m.subtitleColor}`}>{m.subtitle}</span>
          <p className="text-xs text-text-secondary leading-snug">{m.description}</p>
        </button>
      ))}
    </div>
  );
}
