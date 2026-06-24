import { attentionItems } from '../mockData';
import { iconMap, type IconKey } from '../iconMap';

export function TodaysAttention() {
  return (
    <div className="px-5 py-3">
      <h2 className="font-serif text-lg text-text-primary mb-3">Today's Attention</h2>
      <div className="bg-card-bg border border-card-border rounded-2xl divide-y divide-card-border">
        {attentionItems.map((item) => {
          const Icon = iconMap[item.icon as IconKey];
          return (
            <div key={item.id} className="flex items-center gap-3 p-3">
              <div className={`w-9 h-9 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={item.iconFg} />
              </div>
              <span className="text-sm text-text-primary flex-1">{item.label}</span>
              {item.value && (
                <span className={`text-sm font-medium ${item.valueColor}`}>{item.value}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
