import { RefreshCw } from 'lucide-react';
import type { Schedule } from '@/modules/done/types';

const FREQ_TABS: { key: Schedule['frequency']; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly', label: 'Yearly' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function defaultScheduleFor(frequency: Schedule['frequency']): Schedule {
  switch (frequency) {
    case 'daily':
      return { frequency: 'daily' };
    case 'weekly':
      return { frequency: 'weekly', weekdays: [new Date().getDay()] };
    case 'monthly':
      return { frequency: 'monthly', dayOfMonth: new Date().getDate() };
    case 'yearly':
      return { frequency: 'yearly', month: new Date().getMonth() + 1, day: new Date().getDate() };
  }
}

function helperText(schedule: Schedule): string {
  switch (schedule.frequency) {
    case 'daily':
      return 'This habit will repeat every day.';
    case 'weekly':
      return schedule.weekdays.length
        ? `This habit will repeat every ${schedule.weekdays.map((w) => WEEKDAYS[w]).join(', ')}.`
        : 'Pick at least one day of the week.';
    case 'monthly':
      return `This habit will repeat on day ${schedule.dayOfMonth} of every month.`;
    case 'yearly':
      return `This habit will repeat every ${schedule.day} ${MONTHS[schedule.month - 1]}.`;
  }
}

interface FrequencyPickerProps {
  value: Schedule;
  onChange: (schedule: Schedule) => void;
}

export function FrequencyPicker({ value, onChange }: FrequencyPickerProps) {
  return (
    <div>
      <div className="grid grid-cols-4 bg-icon-bg rounded-button p-1 gap-1">
        {FREQ_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(defaultScheduleFor(tab.key))}
            className={`py-2 rounded-lg text-caption-md font-medium ${
              value.frequency === tab.key ? 'bg-card-bg text-accent-doneGreen-fg shadow-card' : 'text-text-secondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-2 bg-accent-doneGreen-bg rounded-button px-4 py-3 mt-3">
        <RefreshCw size={16} className="text-accent-doneGreen-fg mt-0.5 flex-shrink-0" />
        <p className="text-caption text-text-primary">{helperText(value)}</p>
      </div>

      {value.frequency === 'weekly' && (
        <div className="flex flex-wrap gap-2 mt-3">
          {WEEKDAYS.map((label, idx) => {
            const active = value.weekdays.includes(idx);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const weekdays = active
                    ? value.weekdays.filter((w) => w !== idx)
                    : [...value.weekdays, idx].sort((a, b) => a - b);
                  onChange({ frequency: 'weekly', weekdays });
                }}
                className={`w-10 h-10 rounded-full text-caption-md font-medium flex items-center justify-center ${
                  active ? 'bg-accent-doneGreen-fg text-cream' : 'bg-icon-bg text-text-secondary'
                }`}
              >
                {label[0]}
              </button>
            );
          })}
        </div>
      )}

      {value.frequency === 'monthly' && (
        <div className="grid grid-cols-7 gap-2 mt-3">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => onChange({ frequency: 'monthly', dayOfMonth: day })}
              className={`aspect-square rounded-lg text-caption-md flex items-center justify-center ${
                value.dayOfMonth === day ? 'bg-accent-doneGreen-fg text-cream' : 'bg-icon-bg text-text-secondary'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      )}

      {value.frequency === 'yearly' && (
        <div className="flex gap-2 mt-3">
          <select
            value={value.month}
            onChange={(e) => onChange({ frequency: 'yearly', month: Number(e.target.value), day: value.day })}
            className="flex-1 bg-icon-bg rounded-button px-3 py-2.5 text-caption-md text-text-primary"
          >
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={value.day}
            onChange={(e) => onChange({ frequency: 'yearly', month: value.month, day: Number(e.target.value) })}
            className="w-20 bg-icon-bg rounded-button px-3 py-2.5 text-caption-md text-text-primary"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
