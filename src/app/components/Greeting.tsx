import { useAuthStore } from '@/store/auth';
import { getGreeting } from '@/lib/greeting';

export function Greeting() {
  const user = useAuthStore((s) => s.user);
  const secondName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <div className="px-5 pt-3 pb-1">
      <p className="text-caption text-text-secondary">{getGreeting()},</p>
      <h2 className="font-serif text-page-title text-text-primary mt-0.5 leading-tight">{secondName}</h2>
      <p className="text-caption text-text-secondary mt-1">Everything important, in one place.</p>
    </div>
  );
}
