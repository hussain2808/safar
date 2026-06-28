import { useNavigate } from 'react-router-dom';
import { useHomeData } from '../hooks/useHomeData';
import { iconMap } from '../iconMap';

export function RecentActivity() {
  const { recentActivity } = useHomeData();
  const navigate = useNavigate();

  return (
    <div className="px-5 py-3">
      <h2 className="text-home-section-heading text-text-primary mb-3">Recent Activity</h2>
      <div className="bg-card-bg border border-card-border rounded-2xl divide-y divide-card-border">
        {recentActivity.length === 0 ? (
          <p className="text-sm text-text-secondary p-3">No activity yet</p>
        ) : (
          recentActivity.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.route)}
                className="w-full flex items-center gap-3 p-3 text-left active:bg-bg-hover transition-colors"
              >
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
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
