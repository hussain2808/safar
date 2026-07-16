import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import { createHabit, updateHabit } from '@/modules/done/db/habits';
import { useHabit } from '@/modules/done/features/habits/hooks/useHabit';
import { IconPicker } from '@/modules/done/features/habit-form/components/IconPicker';
import { FrequencyPicker } from '@/modules/done/features/habit-form/components/FrequencyPicker';
import { ColorPicker } from '@/modules/done/features/habit-form/components/ColorPicker';
import { ReminderField } from '@/modules/done/features/habit-form/components/ReminderField';
import { habitIcon } from '@/modules/done/features/habit-form/icons';
import type { Schedule } from '@/modules/done/types';

function toDateInputValue(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AddHabit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { habit, isLoading } = useHabit(id);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('book');
  const [schedule, setSchedule] = useState<Schedule>({ frequency: 'daily' });
  const [startDate, setStartDate] = useState(toDateInputValue(Date.now()));
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [color, setColor] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setIcon(habit.icon);
      setSchedule(habit.schedule);
      setStartDate(toDateInputValue(habit.startDate));
      setReminderEnabled(!!habit.reminderTime);
      setReminderTime(habit.reminderTime ?? '20:00');
      setColor(habit.color);
      setNotes(habit.notes ?? '');
    }
  }, [habit]);

  const Icon = habitIcon(icon);

  async function handleSave() {
    if (!name.trim()) {
      setError('Habit name is required.');
      return;
    }
    if (schedule.frequency === 'weekly' && schedule.weekdays.length === 0) {
      setError('Pick at least one day of the week.');
      return;
    }
    setSaving(true);
    setError(null);

    const payload = {
      name: name.trim(),
      icon,
      schedule,
      startDate: new Date(`${startDate}T00:00:00`).getTime(),
      reminderTime: reminderEnabled ? reminderTime : undefined,
      notes: notes.trim() || undefined,
      color,
      archived: habit?.archived ?? false,
      sortOrder: habit?.sortOrder,
    };

    const result = isEdit && id ? await updateHabit(id, payload) : await createHabit(payload);

    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(isEdit ? `/done/habit/${id}` : '/done');
  }

  if (isEdit && isLoading) {
    return <div className="min-h-screen bg-cream" />;
  }

  return (
    <div className="min-h-screen bg-cream pb-28">
      <header className="flex items-center justify-between px-5 pt-10 pb-4">
        <button onClick={() => navigate(-1)} aria-label="Back" className="w-10 h-10 -ml-1.5 rounded-full flex items-center justify-center text-text-primary active:bg-card-border transition-colors flex-shrink-0">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-body font-semibold text-text-primary">{isEdit ? 'Edit Habit' : 'Add Habit'}</h1>
        <button onClick={handleSave} disabled={saving} className="text-body font-semibold text-accent-doneGreen-fg disabled:opacity-50">
          Save
        </button>
      </header>

      <div className="px-5 space-y-6">
        {error && <p className="text-caption text-red-600">{error}</p>}

        <div>
          <label className="text-caption-md font-medium text-text-primary block mb-2">Habit Name</label>
          <div className="flex items-center gap-2 bg-card-bg border border-card-border rounded-button px-4 py-3">
            <Icon size={18} className="text-text-secondary flex-shrink-0" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read Surah Waqiah"
              className="flex-1 bg-transparent text-body text-text-primary outline-none min-w-0"
            />
            {name && (
              <button onClick={() => setName('')} aria-label="Clear name" className="text-text-muted flex-shrink-0">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-caption-md font-medium text-text-primary block mb-2">Choose Icon</label>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <div>
          <label className="text-caption-md font-medium text-text-primary block mb-2">Frequency</label>
          <FrequencyPicker value={schedule} onChange={setSchedule} />
        </div>

        <div>
          <label className="text-caption-md font-medium text-text-primary block mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-card-bg border border-card-border rounded-button px-4 py-3 text-body text-text-primary"
          />
        </div>

        <div>
          <label className="text-caption-md font-medium text-text-primary block mb-2">Reminder (Optional)</label>
          <ReminderField
            enabled={reminderEnabled}
            time={reminderTime}
            onEnabledChange={setReminderEnabled}
            onTimeChange={setReminderTime}
          />
        </div>

        <div>
          <label className="text-caption-md font-medium text-text-primary block mb-2">Color (Optional)</label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div>
          <label className="text-caption-md font-medium text-text-primary block mb-2">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 120))}
            placeholder="Add a note for this habit..."
            rows={3}
            className="w-full bg-card-bg border border-card-border rounded-button px-4 py-3 text-body text-text-primary outline-none resize-none"
          />
          <p className="text-caption text-text-muted text-right mt-1">{notes.length}/120</p>
        </div>
      </div>

      <div
        className="fixed bottom-0 inset-x-0 bg-cream px-5 py-4"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-accent-doneGreen-fg text-cream rounded-button py-3.5 text-button font-medium disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Habit'}
        </button>
      </div>
    </div>
  );
}
