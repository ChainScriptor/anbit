import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnbitWordmark from './AnbitWordmark';

const LOGIN_RETURN_TO_KEY = 'anbit_login_return_to';

type Mode = 'landing' | 'login' | 'register';

const sanitizeReturnTo = (value: string | null): string => {
  if (!value) return '/scan';
  if (!value.startsWith('/')) return '/scan';
  if (value.startsWith('/login')) return '/scan';
  return value;
};

const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('landing');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const returnTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return sanitizeReturnTo(params.get('returnTo'));
  }, [location.search]);

  const completeAuth = () => {
    const stored = sanitizeReturnTo(sessionStorage.getItem(LOGIN_RETURN_TO_KEY));
    sessionStorage.removeItem(LOGIN_RETURN_TO_KEY);
    navigate(returnTo !== '/scan' ? returnTo : stored, { replace: true });
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      completeAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(username, email, password);
      completeAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden bg-[#ffffff] text-[#0a0a0a] antialiased"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Subtle dot grid — same spirit as mockup, on white */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: 'radial-gradient(rgba(10,10,10,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="pointer-events-none absolute right-[-12%] top-[-8%] h-72 w-72 rounded-full bg-[#0a0a0a]/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-8%] h-64 w-64 rounded-full bg-[#0a0a0a]/[0.04] blur-[90px]" />
      <div className="pointer-events-none absolute left-[8%] top-[18%] h-28 w-28 rounded-full bg-[#0a0a0a]/[0.08] blur-[42px]" />
      <div className="pointer-events-none absolute right-[14%] top-[36%] h-20 w-20 rounded-full bg-[#0a0a0a]/[0.09] blur-[30px]" />
      <div className="pointer-events-none absolute left-[18%] bottom-[24%] h-24 w-24 rounded-full bg-[#0a0a0a]/[0.07] blur-[34px]" />
      <div className="pointer-events-none absolute right-[10%] bottom-[14%] h-32 w-32 rounded-full bg-[#0a0a0a]/[0.06] blur-[48px]" />
      <div className="pointer-events-none absolute left-1/2 top-[52%] h-16 w-16 -translate-x-1/2 rounded-full bg-[#0a0a0a]/[0.1] blur-[24px]" />

      <section className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-sm flex-col items-center justify-center px-6 pb-24 pt-16 text-center sm:max-w-md">
        <div className="mb-2">
          <AnbitWordmark as="h1" className="text-5xl text-[#0a0a0a] sm:text-6xl" />
        </div>
        <div className="mx-auto mt-5 h-1 w-12 rounded-full bg-[#0a0a0a]" aria-hidden />

        {mode === 'landing' ? (
          <div className="mt-12 w-full space-y-3">
            <div className="rounded-[1.25rem] border border-[#0a0a0a]/10 bg-[#ffffff] p-1.5 shadow-[0_20px_50px_-24px_rgba(10,10,10,0.25)]">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full rounded-2xl bg-[#0a0a0a] py-4 text-lg font-bold text-white shadow-[0_12px_32px_-12px_rgba(10,10,10,0.45)] transition-transform active:scale-[0.98] hover:opacity-[0.96]"
              >
                Σύνδεση
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="mt-1 w-full rounded-2xl py-4 text-base font-semibold text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a]/[0.04]"
              >
                Register
              </button>
              <button
                type="button"
                onClick={() => navigate(returnTo, { replace: true })}
                className="mt-1 w-full rounded-2xl border border-[#0a0a0a]/12 py-4 text-base font-medium text-[#0a0a0a]/70 transition-colors hover:border-[#0a0a0a]/25 hover:bg-[#0a0a0a]/[0.02] hover:text-[#0a0a0a]"
              >
                Συνέχεια ως επισκέπτης
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={mode === 'login' ? onLogin : onRegister}
            className="mt-12 w-full space-y-3 rounded-[1.25rem] border border-[#0a0a0a]/10 bg-[#ffffff] p-5 text-left shadow-[0_20px_50px_-24px_rgba(10,10,10,0.2)]"
          >
            <p className="px-0.5 text-sm font-bold text-[#0a0a0a]">
              {mode === 'login' ? 'Σύνδεση' : 'Δημιουργία λογαριασμού'}
            </p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mode === 'login' ? 'Email ή username' : 'Username'}
              className="w-full rounded-xl border border-[#0a0a0a]/12 bg-[#ffffff] px-4 py-3.5 text-[#0a0a0a] outline-none transition-shadow placeholder:text-[#0a0a0a]/35 focus:border-[#0a0a0a]/40 focus:ring-2 focus:ring-[#0a0a0a]/12"
              required
            />
            {mode === 'register' ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-[#0a0a0a]/12 bg-[#ffffff] px-4 py-3.5 text-[#0a0a0a] outline-none transition-shadow placeholder:text-[#0a0a0a]/35 focus:border-[#0a0a0a]/40 focus:ring-2 focus:ring-[#0a0a0a]/12"
                required
              />
            ) : null}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Κωδικός"
                className="w-full rounded-xl border border-[#0a0a0a]/12 bg-[#ffffff] px-4 py-3.5 pr-12 text-[#0a0a0a] outline-none transition-shadow placeholder:text-[#0a0a0a]/35 focus:border-[#0a0a0a]/40 focus:ring-2 focus:ring-[#0a0a0a]/12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0a0a0a]/45 hover:text-[#0a0a0a]"
                aria-label={showPassword ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error ? (
              <p className="rounded-lg border border-[#0a0a0a]/20 bg-[#0a0a0a]/[0.06] px-3 py-2 text-xs font-medium text-[#0a0a0a]">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0a0a0a] py-3.5 text-base font-bold text-white shadow-[0_12px_28px_-14px_rgba(10,10,10,0.55)] transition-transform active:scale-[0.99] disabled:opacity-55"
            >
              {loading ? 'Περιμένετε…' : mode === 'login' ? 'Είσοδος' : 'Δημιουργία'}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="w-full rounded-xl border border-[#0a0a0a]/10 py-3 text-sm font-semibold text-[#0a0a0a]/80 hover:bg-[#0a0a0a]/[0.03]"
            >
              {mode === 'login' ? 'Δεν έχεις λογαριασμό; Εγγραφή' : 'Έχεις λογαριασμό; Σύνδεση'}
            </button>
            <button
              type="button"
              onClick={() => setMode('landing')}
              className="w-full py-2 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 hover:text-[#0a0a0a]/65"
            >
              Πίσω
            </button>
          </form>
        )}

        <footer className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-2 px-6 text-[10px] tracking-wide text-[#0a0a0a]/45">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#" className="hover:text-[#0a0a0a] transition-colors">
              Privacy Policy
            </a>
            <span className="opacity-40">•</span>
            <a href="#" className="hover:text-[#0a0a0a] transition-colors">
              Terms of Service
            </a>
          </div>
          <p className="text-[9px] uppercase tracking-wider">© 2024 Anbit Hospitality Solutions</p>
        </footer>
      </section>
    </main>
  );
};

export default CustomerLoginPage;
