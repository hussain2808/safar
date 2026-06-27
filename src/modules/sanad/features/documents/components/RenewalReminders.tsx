import { useState } from 'react';
import { Calendar, ChevronRight, X } from 'lucide-react';
import { cn, formatDate } from '@/modules/sanad/lib/utils';

interface RenewalRemindersProps {
  expiryDate: number;
}

function expiryCountdownLabel(expiryDate: number): string {
  const days = Math.round((expiryDate - Date.now()) / 86400000);
  if (days < 0) return 'Expired';
  if (days >= 365) {
    const years = Math.round(days / 365);
    return `Expires in ${years} year${years === 1 ? '' : 's'}`;
  }
  return `Expires in ${days} day${days === 1 ? '' : 's'}`;
}

export function RenewalReminders({ expiryDate }: RenewalRemindersProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-indigo-light rounded-card p-4 flex items-center gap-3 text-left mt-2"
      >
        <div className="w-10 h-10 rounded-full bg-indigo flex items-center justify-center flex-shrink-0 text-cream">
          <Calendar size={17} strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-caption-md font-semibold text-text-primary">{expiryCountdownLabel(expiryDate)}</p>
          <p className="text-caption text-text-secondary mt-0.5">We'll remind you 30 days before expiry.</p>
        </div>
        <ChevronRight size={14} className="text-text-muted flex-shrink-0" />
      </button>

      {open && <RenewalRemindersSheet expiryDate={expiryDate} onClose={() => setOpen(false)} />}
    </>
  );
}

function ReminderRow({ label, date, checked, onToggle }: { label: string; date: string; checked: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center gap-3 p-3.5 text-left">
      <div
        className={cn(
          'w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors',
          checked ? 'bg-indigo border-indigo' : 'border-card-border bg-cream',
        )}
      >
        {checked && <div className="w-2 h-2 rounded-sm bg-cream" />}
      </div>
      <p className="flex-1 text-caption-md text-text-primary">{label}</p>
      <p className="text-caption text-text-secondary">{date}</p>
    </button>
  );
}

function ToggleRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <div className="w-full flex items-center gap-3 p-3.5">
      <p className="flex-1 text-caption-md text-text-primary">{label}</p>
      <button
        onClick={onToggle}
        className={cn('w-9 h-5 rounded-full flex items-center transition-colors px-0.5', checked ? 'bg-indigo justify-end' : 'bg-card-border justify-start')}
      >
        <div className="w-4 h-4 rounded-full bg-cream" />
      </button>
    </div>
  );
}

function RenewalRemindersSheet({ expiryDate, onClose }: { expiryDate: number; onClose: () => void }) {
  const [days90, setDays90] = useState(true);
  const [days30, setDays30] = useState(true);
  const [days7, setDays7] = useState(false);
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);

  const dateMinus = (days: number) => formatDate(expiryDate - days * 86400000);

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-cream rounded-t-card max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-card-border mx-auto mt-3 mb-1" />
        <div className="flex items-center justify-between px-5 pt-3 pb-2">
          <h2 className="font-serif text-section-heading text-text-primary">Renewal &amp; Reminders</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-icon-bg flex items-center justify-center text-text-primary" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-8 space-y-6">
          <div className="bg-icon-bg/60 rounded-card flex items-center justify-between p-3.5">
            <span className="flex items-center gap-2 text-caption-md text-text-primary">
              <Calendar size={15} className="text-text-secondary" />
              Expiry Date
            </span>
            <span className="text-caption-md text-text-primary">{formatDate(expiryDate)}</span>
          </div>

          <div>
            <h3 className="text-caption-md font-semibold text-text-primary mb-0.5">Reminder Schedule</h3>
            <p className="text-caption text-text-secondary mb-2">We'll remind you before the document expires.</p>
            <div className="bg-icon-bg/60 rounded-card divide-y divide-card-border/60">
              <ReminderRow label="90 days before" date={dateMinus(90)} checked={days90} onToggle={() => setDays90((v) => !v)} />
              <ReminderRow label="30 days before" date={dateMinus(30)} checked={days30} onToggle={() => setDays30((v) => !v)} />
              <ReminderRow label="7 days before" date={dateMinus(7)} checked={days7} onToggle={() => setDays7((v) => !v)} />
            </div>
          </div>

          <div>
            <h3 className="text-caption-md font-semibold text-text-primary mb-0.5">Notify Me Via</h3>
            <p className="text-caption text-text-secondary mb-2">Choose how you want to receive reminders.</p>
            <div className="bg-icon-bg/60 rounded-card divide-y divide-card-border/60">
              <ToggleRow label="Push Notification" checked={push} onToggle={() => setPush((v) => !v)} />
              <ToggleRow label="Email" checked={email} onToggle={() => setEmail((v) => !v)} />
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-indigo text-cream rounded-button py-4 text-body shadow-button active:scale-[0.98] transition-transform duration-100"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
