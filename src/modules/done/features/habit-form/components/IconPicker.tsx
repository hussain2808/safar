import { HABIT_ICONS } from '@/modules/done/features/habit-form/icons';

interface IconPickerProps {
  value: string;
  onChange: (key: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {HABIT_ICONS.map(({ key, icon: Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`aspect-square rounded-icon flex items-center justify-center border-2 ${
              active
                ? 'border-accent-doneGreen-fg bg-accent-doneGreen-bg text-accent-doneGreen-fg'
                : 'border-card-border text-text-secondary'
            }`}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </div>
  );
}
