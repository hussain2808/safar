import { ChevronRight } from 'lucide-react';
import { modules } from '../mockData';
import { iconMap } from '../iconMap';

export function ModuleGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 px-5 py-3">
      {modules.map((m) => {
        const Icon = iconMap[m.icon];
        return (
          <button
            key={m.key}
            disabled={!m.enabled}
            className={`relative text-left ${m.cardBg} rounded-2xl p-4 h-40 overflow-hidden flex flex-col ${
              m.enabled ? 'active:scale-[0.98]' : 'opacity-50'
            }`}
          >
            {m.image && (
              <img
                src={m.image}
                alt=""
                className="absolute -right-3 -bottom-3 w-24 h-24 object-contain rotate-6 pointer-events-none"
              />
            )}
            <div className="relative z-10 flex flex-col gap-2 max-w-[70%]">
              <div className={`w-9 h-9 rounded-lg ${m.iconBg} flex items-center justify-center`}>
                <Icon size={18} className={m.iconFg} />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-serif text-base text-text-primary">{m.title}</span>
                <ChevronRight size={14} className="text-text-muted" />
              </div>
              <span className={`text-xs font-medium ${m.subtitleColor}`}>{m.subtitle}</span>
              <p className="text-xs text-text-secondary leading-snug line-clamp-2">{m.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
