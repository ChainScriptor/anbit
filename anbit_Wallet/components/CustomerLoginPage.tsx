import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useAuth } from '../context/AuthContext';

const LOGIN_RETURN_TO_KEY = 'anbit_login_return_to';

type Mode = 'landing' | 'login' | 'register';

const sanitizeReturnTo = (value: string | null): string | null => {
  if (!value) return null;
  if (!value.startsWith('/')) return null;
  if (value.startsWith('/login')) return null;
  return value;
};

/** Ίδιο κύμα login· στο mobile μετατοπίζεται χαμηλότερα (g translate) για περισσότερο ορατό GIF. */
const LOGIN_HERO_WAVE_PATH =
  'M0,30 C120,110 240,160 360,130 C480,100 600,20 720,35 C840,50 960,145 1080,132 C1200,118 1320,72 1440,88 L1440,180 L0,180 Z';

const CustomerLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('landing');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>('');
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
    const target = returnTo ?? stored;
    if (target) {
      navigate(target, { replace: true });
      return;
    }
    navigate('/quests', { replace: true });
  };

  const continueAsGuest = () => {
    const stored = sanitizeReturnTo(sessionStorage.getItem(LOGIN_RETURN_TO_KEY));
    const target = returnTo ?? stored ?? '/quests';
    navigate(target, { replace: true });
  };

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password, { skipGlobalLoader: true });
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

  const onLandingLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Συμπλήρωσε username και password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(username, password, { skipGlobalLoader: true });
      completeAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="fixed inset-0 z-0 box-border flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-[#0a0a0a] text-white antialiased"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Hero: λίγο μεγαλύτερο στο mobile + κύμα χαμηλότερα για καλύτερο framing του GIF */}
      <div className="pointer-events-none relative h-[clamp(6.75rem,24dvh,11.5rem)] w-full shrink-0 overflow-hidden sm:h-[clamp(12rem,38vh,26rem)]">
        <img
          src="/couple.gif"
          alt=""
          className="h-full w-full object-cover object-[center_22%] sm:object-[center_35%]"
          draggable={false}
        />
        <div className="absolute inset-0 bg-black/10 sm:bg-black/15" />
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent via-black/20 to-black/40 sm:h-24 sm:via-black/35 sm:to-black/55" />
        {/* Mobile: μετατοπίζουμε το κύμα κάτω ώστε να «δαγκώνει» λιγότερο το βίντεο */}
        <svg
          className="absolute inset-x-0 -bottom-px h-14 w-full sm:hidden"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g transform="translate(0, 68)">
            <path d={LOGIN_HERO_WAVE_PATH} fill="#0a0a0a" />
          </g>
        </svg>
        <svg
          className="absolute inset-x-0 -bottom-px hidden h-20 w-full sm:block"
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d={LOGIN_HERO_WAVE_PATH} fill="#0a0a0a" />
        </svg>
      </div>

      {/* Subtle dot grid — same spirit as mockup, on white */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: 'radial-gradient(rgba(10,10,10,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="pointer-events-none absolute right-[-12%] top-[-8%] hidden h-72 w-72 rounded-full bg-[#0a0a0a]/[0.06] blur-[100px] sm:block" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-8%] hidden h-64 w-64 rounded-full bg-[#0a0a0a]/[0.04] blur-[90px] sm:block" />
      <div className="pointer-events-none absolute left-[8%] top-[18%] hidden h-28 w-28 rounded-full bg-[#0a0a0a]/[0.08] blur-[42px] sm:block" />
      <div className="pointer-events-none absolute right-[14%] top-[36%] hidden h-20 w-20 rounded-full bg-[#0a0a0a]/[0.09] blur-[30px] sm:block" />
      <div className="pointer-events-none absolute left-[18%] bottom-[24%] hidden h-24 w-24 rounded-full bg-[#0a0a0a]/[0.07] blur-[34px] sm:block" />
      <div className="pointer-events-none absolute right-[10%] bottom-[14%] hidden h-32 w-32 rounded-full bg-[#0a0a0a]/[0.06] blur-[48px] sm:block" />
      <div className="pointer-events-none absolute left-1/2 top-[52%] hidden h-16 w-16 -translate-x-1/2 rounded-full bg-[#0a0a0a]/[0.1] blur-[24px] sm:block" />

      <section className="relative z-10 mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-4 pb-1 text-center sm:px-6 sm:pb-2">
        {mode === 'landing' ? (
          <>
            <div className="relative z-20 flex min-h-0 flex-1 flex-col justify-center gap-0 sm:gap-1">
              <h2 className="mb-2 text-center text-[1.25rem] font-extrabold leading-[1.12] text-white sm:mb-4 sm:text-[1.75rem]">
                Κάθε παραγγελία σου
                <br />
                κρύβει εκπλήξεις.
              </h2>

              <div className="mb-1.5 sm:mb-3">
                <PhoneInput
                  international={false}
                  defaultCountry="GR"
                  country="GR"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  placeholder="Αριθμός τηλεφώνου"
                  className="anbit-phone-input anbit-phone-input--compact-login"
                  numberInputProps={{
                    className: 'anbit-phone-input__field',
                    autoComplete: 'tel',
                  }}
                />
              </div>

              <div className="relative mb-1.5 flex items-center py-0.5 sm:mb-3 sm:py-2">
                <div className="flex-grow border-t border-white/20" />
                <span className="mx-3 text-[0.625rem] text-white/60 sm:mx-4 sm:text-[0.6875rem]">ή</span>
                <div className="flex-grow border-t border-white/20" />
              </div>

              <form className="space-y-1.5 sm:space-y-2.5" onSubmit={onLandingLogin}>
                <div className="space-y-1.5 sm:space-y-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full rounded-lg border border-white/20 bg-[#2a2a2a] px-3 py-2.5 text-[16px] text-white outline-none focus:ring-1 focus:ring-white/30 placeholder:text-white/35 sm:px-4 sm:py-3"
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-lg border border-white/20 bg-[#2a2a2a] px-3 py-2.5 text-[16px] text-white outline-none focus:ring-1 focus:ring-white/30 placeholder:text-white/35 sm:px-4 sm:py-3"
                  />
                </div>

                {error ? (
                  <p className="rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-[11px] font-medium text-white sm:px-3 sm:py-2 sm:text-xs">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-anbit-brand py-2.5 text-sm font-bold text-anbit-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-55 sm:py-3 sm:text-base"
                >
                  {loading ? 'Περιμένετε…' : 'Σύνδεση'}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4285F4] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:gap-3 sm:py-3 sm:text-base"
                >
                  <svg className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Συνέχεια με Google
                </button>

                <button
                  type="button"
                  onClick={continueAsGuest}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-[#2a2a2a] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:gap-3 sm:py-3 sm:text-base"
                >
                  Συνέχεια ως επισκέπτης
                </button>
              </form>
            </div>

            <footer className="flex shrink-0 flex-col items-center justify-center space-y-1 pb-0.5 pt-1 text-center sm:space-y-2 sm:pb-1 sm:pt-3">
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <a className="text-[0.625rem] text-white transition-colors hover:text-white/85 sm:text-[0.6875rem]" href="#">
                  Terms of Service
                </a>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                <a className="text-[0.625rem] text-white transition-colors hover:text-white/85 sm:text-[0.6875rem]" href="#">
                  Privacy Policy
                </a>
              </div>
              <p className="text-[0.625rem] text-white sm:text-[0.6875rem]">© 2024 Anbit Inc.</p>
            </footer>
          </>
        ) : (
          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center py-1 sm:py-6">
            <form
              onSubmit={mode === 'login' ? onLogin : onRegister}
              className="mx-auto w-full space-y-2 rounded-[1.25rem] border border-[#0a0a0a]/10 bg-[#ffffff] p-4 text-left shadow-[0_20px_50px_-24px_rgba(10,10,10,0.2)] sm:space-y-3 sm:p-5"
            >
            <p className="px-0.5 text-sm font-bold text-[#0a0a0a]">
              {mode === 'login' ? 'Σύνδεση' : 'Δημιουργία λογαριασμού'}
            </p>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mode === 'login' ? 'Email ή username' : 'Username'}
              className="w-full rounded-xl border border-[#0a0a0a]/12 bg-[#ffffff] px-3 py-2.5 text-[16px] text-[#0a0a0a] outline-none transition-shadow placeholder:text-[#0a0a0a]/35 focus:border-[#0a0a0a]/40 focus:ring-2 focus:ring-[#0a0a0a]/12 sm:px-4 sm:py-3.5"
              required
            />
            {mode === 'register' ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-[#0a0a0a]/12 bg-[#ffffff] px-3 py-2.5 text-[16px] text-[#0a0a0a] outline-none transition-shadow placeholder:text-[#0a0a0a]/35 focus:border-[#0a0a0a]/40 focus:ring-2 focus:ring-[#0a0a0a]/12 sm:px-4 sm:py-3.5"
                required
              />
            ) : null}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Κωδικός"
                className="w-full rounded-xl border border-[#0a0a0a]/12 bg-[#ffffff] px-3 py-2.5 pr-11 text-[16px] text-[#0a0a0a] outline-none transition-shadow placeholder:text-[#0a0a0a]/35 focus:border-[#0a0a0a]/40 focus:ring-2 focus:ring-[#0a0a0a]/12 sm:px-4 sm:py-3.5 sm:pr-12"
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
              className="w-full rounded-xl bg-[#0a0a0a] py-2.5 text-sm font-bold text-white shadow-[0_12px_28px_-14px_rgba(10,10,10,0.55)] transition-transform active:scale-[0.99] disabled:opacity-55 sm:py-3.5 sm:text-base"
            >
              {loading ? 'Περιμένετε…' : mode === 'login' ? 'Είσοδος' : 'Δημιουργία'}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="w-full rounded-xl border border-[#0a0a0a]/10 py-2 text-xs font-semibold text-[#0a0a0a]/80 hover:bg-[#0a0a0a]/[0.03] sm:py-3 sm:text-sm"
            >
              {mode === 'login' ? 'Δεν έχεις λογαριασμό; Εγγραφή' : 'Έχεις λογαριασμό; Σύνδεση'}
            </button>
            <button
              type="button"
              onClick={() => setMode('landing')}
              className="w-full py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 hover:text-[#0a0a0a]/65 sm:py-2 sm:text-[11px]"
            >
              Πίσω
            </button>
            </form>
          </div>
        )}

      </section>
    </main>
  );
};

export default CustomerLoginPage;
