import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { modules } from '../appConfig';
import { iconMap } from '../iconMap';

export function ModuleGrid() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-4 px-5 py-3">
      {modules.map((m) => {
        const Icon = iconMap[m.icon];
        return (
          <button
            key={m.key}
            disabled={!m.enabled}
            onClick={() => m.enabled && navigate(`/${m.key}`)}
            className={`relative text-left ${m.cardBg} rounded-3xl p-4 min-h-[160px] overflow-hidden flex items-start justify-between gap-2 ${
              m.enabled ? 'active:scale-[0.98]' : 'opacity-50'
            }`}
          >
            <div className="flex flex-col gap-2 flex-1">
              <div className={`w-10 h-10 rounded-xl ${m.iconBg} flex items-center justify-center`}>
                <Icon size={18} className={m.iconFg} />
              </div>
              <span className="font-serif text-book-title text-text-primary">{m.title}</span>
              <span className={`text-xs font-medium -mt-1 ${m.subtitleColor}`}>{m.subtitle}</span>
              <p className="text-xs text-text-secondary leading-snug">{m.description}</p>
            </div>
            {m.image && (
              <img
                src={m.image}
                alt=""
                className="w-16 h-16 object-contain shrink-0 mt-1"
              />
            )}
            <ChevronRight
              size={16}
              className={`absolute right-3 bottom-3 z-10 ${m.subtitleColor}`}
            />
          </button>
        );
      })}
    </div>
  );
}
