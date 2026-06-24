import { useAuthStore } from '@/store/auth';
import { getGreeting } from '@/lib/greeting';

export function Greeting() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <div className="px-5 pt-2 pb-1">
      <h2 className="font-serif text-xl text-text-primary">
        {getGreeting()}, {firstName}
      </h2>
      <p className="text-xs text-text-secondary">Everything important, in one place.</p>
    </div>
  );
}
