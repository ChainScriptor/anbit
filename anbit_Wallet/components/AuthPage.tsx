import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnbitWordmark from './AnbitWordmark';

type Mode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('register');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && !acceptPrivacy) {
      setError('Παρακαλώ αποδεχτείτε την Πολιτική Απορρήτου.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, email, password);
        setSuccess('Ο λογαριασμός δημιουργήθηκε. Μπορείτε να συνδεθείτε.');
        setMode('login');
        setPassword('');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Κάτι πήγε στραβά. Δοκιμάστε ξανά.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'register' : 'login'));
    setError('');
    setSuccess('');
  };

  const isRegister = mode === 'register';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 auth-page-bg relative overflow-hidden">
      {/* Floating decorative shards (Anbit accent) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="auth-shard auth-shard-1" />
        <div className="auth-shard auth-shard-2" />
        <div className="auth-shard auth-shard-3" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="auth-panel-floating w-full max-w-5xl rounded-[24px] overflow-hidden flex flex-col lg:flex-row relative z-10"
      >
        {/* Left: Form – off-white / light panel */}
        <div className="flex-1 min-w-0 flex flex-col auth-form-panel p-8 sm:p-10 lg:p-12">
          {/* Logo with subtle glow */}
          <div className="flex items-center gap-3 mb-6">
            <div className="auth-logo-wrap w-11 h-11 rounded-xl flex items-center justify-center -rotate-6">
              <span className="text-anbit-yellow-content font-black text-xl italic">A</span>
            </div>
            <AnbitWordmark className="auth-logo-text text-xl text-anbit-text" />
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-anbit-text tracking-tight mb-2">
            {isRegister ? 'Εγγραφείτε και παίξτε δωρεάν' : 'Συνδεθείτε'}
          </h1>
          <p className="text-anbit-muted text-sm mb-8">
            {isRegister ? 'Δημιουργήστε λογαριασμό και ξεκινήστε να συγκεντρώνετε rewards.' : 'Συνδεθείτε για να δείτε τα rewards σας.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-anbit-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-input w-full rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium border border-anbit-border focus:border-anbit-yellow focus:ring-2 focus:ring-anbit-yellow/30 outline-none transition-all text-anbit-text placeholder-anbit-muted"
                  placeholder="Όνομα χρήστη"
                  required={isRegister}
                />
              </div>
            )}

            {!isRegister && (
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-anbit-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-input w-full rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium border border-anbit-border focus:border-anbit-yellow focus:ring-2 focus:ring-anbit-yellow/30 outline-none transition-all text-anbit-text placeholder-anbit-muted"
                  placeholder="Email ή username"
                  required
                />
              </div>
            )}

            {isRegister && (
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-anbit-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input w-full rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium border border-anbit-border focus:border-anbit-yellow focus:ring-2 focus:ring-anbit-yellow/30 outline-none transition-all text-anbit-text placeholder-anbit-muted"
                  placeholder="Email"
                  required={isRegister}
                />
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-anbit-muted" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input w-full rounded-xl pl-12 pr-12 py-3.5 text-sm font-medium border border-anbit-border focus:border-anbit-yellow focus:ring-2 focus:ring-anbit-yellow/30 outline-none transition-all text-anbit-text placeholder-anbit-muted"
                placeholder="Κωδικός"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-anbit-muted hover:text-anbit-text transition-colors"
                aria-label={showPassword ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {isRegister && (
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={acceptPrivacy}
                    onChange={(e) => setAcceptPrivacy(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="auth-toggle w-11 h-6 rounded-full border-2 border-anbit-border bg-anbit-input peer-checked:border-anbit-yellow peer-checked:bg-anbit-yellow transition-all" />
                  <div className="auth-toggle-dot absolute left-1 top-1 w-4 h-4 rounded-full bg-anbit-yellow-content transition-transform peer-checked:translate-x-5 pointer-events-none" />
                </div>
                <span className="text-sm text-anbit-muted group-hover:text-anbit-text transition-colors">
                  Αποδέχομαι την{' '}
                  <a href="#" className="text-anbit-yellow hover:underline font-medium">Πολιτική Απορρήτου</a>
                </span>
              </label>
            )}

            {error && (
              <div className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            {success && (
              <div className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="auth-btn-primary w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegister ? 'Δημιουργία λογαριασμού' : 'Είσοδος')}
            </button>

            <button
              type="button"
              className="auth-btn-secondary w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C2.451 6.58 2 8.975 2 11.437c0 5.339 3.45 9.87 8.205 11.492a.077.077 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292 14.5 14.5 0 0 0 12.63-10.86.077.077 0 0 0-.041-.078 14.404 14.404 0 0 1-2.079-1.026.077.077 0 0 1-.006-.127 12.97 12.97 0 0 0 .882-.668.077.077 0 0 0 .033-.094c-.375-.694-.834-1.35-1.362-1.938a.077.077 0 0 0-.077-.02 14.697 14.697 0 0 1-4.064.557 14.618 14.618 0 0 1-4.07-.559.077.077 0 0 0-.078.02c-.528.588-.987 1.245-1.36 1.94a.077.077 0 0 0 .032.093c.25.18.516.35.795.505a.077.077 0 0 1 .006.127 12.9 12.9 0 0 1-2.082 1.03.077.077 0 0 0-.041.077 14.498 14.498 0 0 0 12.644 10.866c.218-.003.434-.02.648-.054a.077.077 0 0 0 .061-.085 13.18 13.18 0 0 0-.137-1.38.077.077 0 0 0-.106-.055 13.2 13.2 0 0 1-1.872.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.077.077 0 0 0 .084.028c4.756-1.622 8.205-6.153 8.205-11.492 0-2.462-.45-4.856-1.644-6.04a.07.07 0 0 0-.032-.027z"/>
              </svg>
              Συνέχεια με Discord
            </button>
          </form>

          <p className="mt-8 text-sm text-anbit-muted">
            {isRegister ? 'Έχετε ήδη λογαριασμό; ' : 'Δεν έχετε λογαριασμό; '}
            <button type="button" onClick={switchMode} className="text-anbit-yellow font-semibold hover:underline">
              {isRegister ? 'Συνδεθείτε' : 'Εγγραφείτε'}
            </button>
          </p>
        </div>

        {/* Right: Dark immersive panel – big stat + avatars */}
        <div className="hidden lg:flex lg:w-[48%] auth-hero-panel relative overflow-hidden">
          <div className="absolute inset-0 auth-hero-gradient" />
          <div className="absolute inset-0 flex flex-col justify-center items-center p-10">
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="auth-hero-number text-6xl sm:text-7xl font-black text-white tracking-tighter"
            >
              15.000+
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="auth-hero-label text-lg font-bold mt-2"
            >
              μέλη online
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex -space-x-3 mt-8"
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full border-2 border-anbit-card bg-anbit-border flex items-center justify-center text-anbit-muted text-xs font-bold"
                  style={{ zIndex: 5 - i }}
                >
                  {i}
                </div>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-8 left-8 right-8 flex justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-anbit-yellow" />
              <span className="text-xs text-anbit-muted">Το μεγαλύτερο δίκτυο rewards στη Θεσσαλονίκη</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
