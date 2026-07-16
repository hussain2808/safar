import { Bell } from 'lucide-react';

interface ReminderFieldProps {
  enabled: boolean;
  time: string;
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
}

export function ReminderField({ enabled, time, onEnabledChange, onTimeChange }: ReminderFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-3 bg-card-bg border border-card-border rounded-button px-4 py-3">
        <Bell size={18} className="text-text-secondary flex-shrink-0" />
        <input
          type="time"
          value={time}
          disabled={!enabled}
          onChange={(e) => onTimeChange(e.target.value)}
          className="flex-1 bg-transparent text-body text-text-primary outline-none disabled:opacity-40"
        />
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onEnabledChange(!enabled)}
          className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors flex-shrink-0 ${
            enabled ? 'bg-accent-doneGreen-fg justify-end' : 'bg-card-border justify-start'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-cream shadow" />
        </button>
      </div>
      <p className="text-caption text-text-secondary mt-1.5">You&apos;ll get a gentle reminder if you haven&apos;t marked it done.</p>
    </div>
  );
}
