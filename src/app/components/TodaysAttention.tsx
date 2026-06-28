import { useNavigate } from 'react-router-dom';
import { useHomeData } from '../hooks/useHomeData';
import { iconMap } from '../iconMap';

export function TodaysAttention() {
  const { attentionItems } = useHomeData();
  const navigate = useNavigate();

  return (
    <div className="px-5 py-3">
      <h2 className="text-home-section-heading text-text-primary mb-3">Today's Attention</h2>
      <div className="bg-card-bg border border-card-border rounded-2xl divide-y divide-card-border">
        {attentionItems.length === 0 ? (
          <p className="text-sm text-text-secondary p-3">Nothing needs attention right now</p>
        ) : (
          attentionItems.map((item) => {
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
                <span className="text-sm text-text-primary flex-1">{item.label}</span>
                {item.value && (
                  <span className={`text-sm font-medium ${item.valueColor}`}>{item.value}</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
