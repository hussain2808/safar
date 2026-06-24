import { useAuthStore } from '@/store/auth';
import { useState } from 'react';

export default function SignIn() {
  const signIn = useAuthStore((s) => s.signIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    setLoading(true);
    setError('');
    try {
      await signIn();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (!msg.includes('popup-closed')) setError('Sign-in failed. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="flex-1" />

      <div className="flex flex-col items-center px-8 gap-5">
        <h1 className="font-serif text-4xl text-text-primary">Safar</h1>
        <p className="text-sm text-text-secondary text-center">The story of your journey</p>

        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-[18px] rounded-2xl bg-brown text-white text-[17px] font-semibold active:scale-[0.97] transition-transform duration-100 disabled:opacity-60"
          >
            {!loading && (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M21.35 11.1H12v2.8h5.35c-.24 1.3-1 2.4-2.1 3.13v2.6h3.39C20.4 17.85 21.35 15.1 21.35 11.1z" />
                <path fill="currentColor" d="M12 22c2.7 0 4.96-.9 6.61-2.42l-3.39-2.6c-.9.6-2.06.95-3.22.95-2.48 0-4.58-1.67-5.33-3.92H3.18v2.69A9.99 9.99 0 0 0 12 22z" />
                <path fill="currentColor" d="M6.67 14.01A6.07 6.07 0 0 1 6.35 12c0-.7.12-1.38.32-2.01V7.3H3.18A10 10 0 0 0 2 12c0 1.62.39 3.14 1.18 4.47l3.49-2.46z" />
                <path fill="currentColor" d="M12 5.58c1.4 0 2.65.48 3.63 1.42l2.72-2.72A9.97 9.97 0 0 0 12 2 9.99 9.99 0 0 0 3.18 7.3l3.49 2.69C7.42 7.25 9.52 5.58 12 5.58z" />
              </svg>
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {error && <p className="text-center text-xs text-red-500">{error}</p>}
        </div>
      </div>

      <div className="flex-1 flex items-end justify-center pb-10 pt-6">
        <p className="text-xs text-text-muted text-center px-8">
          Your data is private and only accessible by you.
        </p>
      </div>
    </div>
  );
}
