import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, User, Users, Cloud, Moon, Bell, Upload, Download, Info, LogOut, type LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

interface SettingsRow {
  icon: LucideIcon;
  label: string;
  caption: string;
  onClick?: () => void;
}

export default function Settings() {
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);

  const accountRows: SettingsRow[] = [
    { icon: User, label: 'Profile', caption: 'Manage your personal information' },
    { icon: Users, label: 'Family', caption: 'Manage family members', onClick: () => navigate('/settings/family') },
    { icon: Cloud, label: 'Backup & Sync', caption: 'Keep your data safe and synced' },
  ];

  const preferenceRows: SettingsRow[] = [
    { icon: Moon, label: 'Appearance', caption: 'Theme, font and app icon' },
    { icon: Bell, label: 'Notifications', caption: 'Reminders and alerts' },
  ];

  const dataRows: SettingsRow[] = [
    { icon: Upload, label: 'Export Data', caption: 'Download a copy of your data' },
    { icon: Download, label: 'Import Data', caption: 'Import data from another app' },
  ];

  const aboutRows: SettingsRow[] = [
    { icon: Info, label: 'About Safar', caption: 'Version 1.0.0', onClick: () => navigate('/settings/about') },
  ];

  return (
    <div className="min-h-screen bg-cream pb-12">
      <header className="px-5 pt-12 pb-2">
        <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full flex items-center justify-center text-text-primary -ml-2 mb-1 active:bg-card-border transition-colors" aria-label="Back">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-serif text-page-title text-text-primary">Settings</h1>
        <p className="text-caption-md text-text-secondary mt-1">Manage your account, preferences and app settings.</p>
      </header>

      <main className="px-4 pt-4 space-y-6">
        <SettingsSection title="Account" rows={accountRows} />
        <SettingsSection title="Preferences" rows={preferenceRows} />
        <SettingsSection title="Data" rows={dataRows} />
        <SettingsSection title="About" rows={aboutRows} />

        <button
          onClick={signOut}
          className="w-full bg-accent-pink-bg rounded-card p-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform duration-100"
        >
          <div className="w-10 h-10 rounded-full bg-card-bg flex items-center justify-center flex-shrink-0 text-accent-pink-fg">
            <LogOut size={17} strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-caption-md font-semibold text-accent-pink-fg">Logout</p>
            <p className="text-caption text-accent-pink-fg mt-0.5">Sign out from your account</p>
          </div>
          <ChevronRight size={14} className="text-accent-pink-fg flex-shrink-0" />
        </button>
      </main>
    </div>
  );
}

function SettingsSection({ title, rows }: { title: string; rows: SettingsRow[] }) {
  return (
    <section>
      <h2 className="text-caption-md font-semibold text-text-secondary mb-2 px-1">{title}</h2>
      <div className="bg-card-bg rounded-card shadow-card divide-y divide-card-border overflow-hidden">
        {rows.map(({ icon: Icon, label, caption, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="w-full flex items-center gap-3 p-3.5 text-left active:bg-cream/60 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-icon-bg flex items-center justify-center flex-shrink-0 text-brown">
              <Icon size={17} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-caption-md font-semibold text-text-primary">{label}</p>
              <p className="text-caption text-text-secondary mt-0.5">{caption}</p>
            </div>
            <ChevronRight size={14} className="text-text-muted flex-shrink-0" />
          </button>
        ))}
      </div>
    </section>
  );
}
