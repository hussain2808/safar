import { useAuthStore } from '@/store/auth';
import { getGreeting } from '@/lib/greeting';

export function Greeting() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <div className="px-5 pt-3 pb-1">
      <h2 className="font-serif text-lg font-medium text-text-primary">
        {getGreeting()}, {firstName}
      </h2>
      <p className="text-sm text-text-secondary mt-0.5">Everything important, in one place.</p>
    </div>
  );
}
