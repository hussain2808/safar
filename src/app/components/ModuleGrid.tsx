import { ChevronRight } from 'lucide-react';
import { modules } from '../mockData';
import { iconMap } from '../iconMap';

export function ModuleGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 px-5 py-3">
      {modules.map((m) => {
        const Icon = iconMap[m.icon];
        return (
          <button
            key={m.key}
            disabled={!m.enabled}
            className={`relative text-left ${m.cardBg} rounded-3xl p-4 min-h-[200px] overflow-hidden flex flex-col ${
              m.enabled ? 'active:scale-[0.98]' : 'opacity-50'
            }`}
          >
            {m.image && (
              <img
                src={m.image}
                alt=""
                className="absolute -right-2 -bottom-2 w-28 h-28 object-contain rotate-6 pointer-events-none"
              />
            )}
            <div className="relative z-10 flex flex-col gap-2 max-w-[70%]">
              <div className={`w-11 h-11 rounded-xl ${m.iconBg} flex items-center justify-center`}>
                <Icon size={20} className={m.iconFg} />
              </div>
              <span className="font-serif text-xl text-text-primary">{m.title}</span>
              <span className={`text-sm font-medium -mt-1 ${m.subtitleColor}`}>{m.subtitle}</span>
              <p className="text-sm text-text-secondary leading-snug">{m.description}</p>
            </div>
            <ChevronRight
              size={18}
              className={`absolute right-4 bottom-4 z-10 ${m.subtitleColor}`}
            />
          </button>
        );
      })}
    </div>
  );
}
