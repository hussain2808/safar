import { Sparkles } from 'lucide-react';
import { DarussalamHeader } from '@/modules/darussalam/shared/components/DarussalamHeader';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-darussalam-bg pb-28">
      <DarussalamHeader showBack />
      <div className="flex flex-col items-center justify-center text-center px-8 py-20">
        <div className="w-16 h-16 rounded-2xl bg-card-bg shadow-card flex items-center justify-center mb-4">
          <Sparkles size={26} className="text-darussalam-green" />
        </div>
        <h1 className="font-serif text-2xl text-text-primary mb-2">{title}</h1>
        <p className="text-sm text-text-secondary">This space is being designed. In sha Allah, coming soon.</p>
      </div>
    </div>
  );
}
