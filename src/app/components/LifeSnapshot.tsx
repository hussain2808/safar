import { useHomeData } from '../hooks/useHomeData';
import { iconMap } from '../iconMap';

export function LifeSnapshot() {
  const { snapshot } = useHomeData();

  return (
    <div className="px-5 py-3">
      <h2 className="text-home-section-heading text-text-primary mb-3">Life Snapshot</h2>
      <div className="grid grid-cols-2 gap-3">
        {snapshot.map((s) => {
          const Icon = iconMap[s.icon];
          return (
            <div key={s.id} className="bg-card-bg border border-card-border rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${s.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={s.iconFg} />
              </div>
              <div>
                <div className="font-sans font-bold text-body text-text-primary">{s.value}</div>
                <div className="text-xs text-text-secondary">{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
