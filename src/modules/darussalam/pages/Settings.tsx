import { useRef, useState } from 'react';
import { Settings as SettingsIcon, Download, Upload } from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';
import { useHouseSettings, updateHouseSettings, exportAllData, importAllData } from '@/modules/darussalam/features/settings/useHouseSettings';

const currencies = ['AED', 'USD', 'INR', 'SAR', 'GBP', 'EUR'];

export default function DarussalamSettings() {
  const settings = useHouseSettings();
  const importRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState('');

  async function handleExport() {
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `darussalam-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importAllData(text);
      setImportMsg('Import complete.');
    } catch {
      setImportMsg('That file could not be imported.');
    }
    e.target.value = '';
  }

  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader showBack />
      <div className="px-5">
        <h1 className="font-serif text-3xl text-text-primary">Settings</h1>
      </div>

      <div className="px-5 mt-5 space-y-4">
        <div className="bg-card-bg rounded-card shadow-card p-4">
          <div className="flex items-center gap-1.5 mb-2 text-sm font-semibold text-text-primary">
            <SettingsIcon size={14} className="text-text-secondary" /> House Profile
          </div>
          <input
            key={`name-${settings.houseName}`}
            defaultValue={settings.houseName}
            onBlur={(e) => updateHouseSettings({ houseName: e.target.value })}
            placeholder="House name"
            className="w-full bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none mb-2"
          />
          <input
            key={`subtitle-${settings.houseSubtitle}`}
            defaultValue={settings.houseSubtitle ?? ''}
            onBlur={(e) => updateHouseSettings({ houseSubtitle: e.target.value })}
            placeholder="Subtitle (e.g. Our Home, In Sha Allah)"
            className="w-full bg-darussalam-tile rounded-full px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="bg-card-bg rounded-card shadow-card p-4">
          <div className="text-sm font-semibold text-text-primary mb-2">Currency</div>
          <div className="flex gap-2 flex-wrap">
            {currencies.map((c) => (
              <button
                key={c}
                onClick={() => updateHouseSettings({ currency: c })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${settings.currency === c ? 'bg-accent-green-bg text-darussalam-green' : 'bg-darussalam-tile text-text-secondary'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card-bg rounded-card shadow-card p-4">
          <div className="text-sm font-semibold text-text-primary mb-2">Measurement Units</div>
          <div className="flex gap-2">
            {(['metric', 'imperial'] as const).map((u) => (
              <button
                key={u}
                onClick={() => updateHouseSettings({ units: u })}
                className={`flex-1 py-2 rounded-full text-sm capitalize ${settings.units === u ? 'bg-accent-green-bg text-darussalam-green font-medium' : 'bg-darussalam-tile text-text-secondary'}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card-bg rounded-card shadow-card p-4 space-y-2">
          <div className="text-sm font-semibold text-text-primary mb-1">Backup</div>
          <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 bg-darussalam-tile rounded-full py-2.5 text-sm text-text-primary">
            <Download size={15} /> Export all data
          </button>
          <button onClick={() => importRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-darussalam-tile rounded-full py-2.5 text-sm text-text-primary">
            <Upload size={15} /> Import from backup
          </button>
          <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
          {importMsg && <p className="text-xs text-text-muted text-center">{importMsg}</p>}
        </div>
      </div>
    </div>
  );
}
