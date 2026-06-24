import { recentActivity } from '../mockData';
import { iconMap, type IconKey } from '../iconMap';

export function RecentActivity() {
  return (
    <div className="px-5 py-3">
      <h2 className="font-serif text-lg text-text-primary mb-3">Recent Activity</h2>
      <div className="bg-card-bg border border-card-border rounded-2xl divide-y divide-card-border">
        {recentActivity.map((item) => {
          const Icon = iconMap[item.icon as IconKey];
          return (
            <div key={item.id} className="flex items-center gap-3 p-3">
              <div className={`w-9 h-9 rounded-full ${item.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={item.iconFg} />
              </div>
              <div className="flex-1">
                <div className="text-sm text-text-primary">{item.title}</div>
                <div className="text-xs text-text-secondary">{item.subtitle}</div>
              </div>
              {item.amount && (
                <span className={`text-sm font-medium ${item.amountColor}`}>{item.amount}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
