import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onSwitchMode: (mode: 'login' | 'register') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSwitchMode }) => {
  const { login, register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isRegister = mode === 'register';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister && !acceptPrivacy) {
      setError('Παρακαλώ αποδεχτείτε την Πολιτική Απορρήτου.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      if (isRegister) {
        await register(username, email, password);
        onClose();
      } else {
        await login(username, password);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocial = (provider: string) => {
    // Placeholder – μπορείτε να συνδέσετε OAuth αργότερα
    console.log(`Συνέχεια με ${provider}`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-anbit-card border border-anbit-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-anbit-text z-10 transition-colors"
            aria-label="Κλείσιμο"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-anbit-text text-center mb-6">
              {isRegister ? 'Δημιουργία λογαριασμού Anbit' : 'Σύνδεση στο Anbit'}
            </h2>

            {/* Social login – Wolt style */}
            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleSocial('Google')}
                className="auth-modal-btn w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 bg-[#1a1a1a] text-white border border-anbit-border hover:bg-[#2a2a2a] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Συνέχεια με Google
              </button>
              <button
                type="button"
                onClick={() => handleSocial('Apple')}
                className="auth-modal-btn w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 bg-anbit-card border border-anbit-border text-anbit-text hover:bg-anbit-border/30 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-1.26 2.14-2.65 4.27-4.13 6.28zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Συνέχεια με Apple
              </button>
              <button
                type="button"
                onClick={() => handleSocial('Facebook')}
                className="auth-modal-btn w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 bg-[#1877F2] text-white border border-[#1877F2] hover:bg-[#166fe5] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Συνέχεια με Facebook
              </button>
            </div>

            {/* Divider – Σύνδεση μέσω email */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-anbit-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-anbit-card px-3 text-sm text-anbit-muted">Σύνδεση μέσω email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isRegister && (
                <>
                  <label className="block text-sm font-medium text-anbit-text">Εισάγετε το email ή το username σας</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-anbit-muted" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="auth-modal-input w-full rounded-xl pl-11 pr-4 py-3.5 text-anbit-text border border-anbit-border bg-anbit-input focus:border-anbit-yellow outline-none"
                      placeholder="email ή username"
                      required
                    />
                  </div>
                </>
              )}

              {isRegister && (
                <>
                  <label className="block text-sm font-medium text-anbit-text">Όνομα χρήστη</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-anbit-muted" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="auth-modal-input w-full rounded-xl pl-11 pr-4 py-3.5 text-anbit-text border border-anbit-border bg-anbit-input focus:border-anbit-yellow outline-none"
                      placeholder="Όνομα χρήστη"
                      required
                    />
                  </div>
                  <label className="block text-sm font-medium text-anbit-text">Εισάγετε το email σας</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-anbit-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-modal-input w-full rounded-xl pl-11 pr-4 py-3.5 text-anbit-text border border-anbit-border bg-anbit-input focus:border-anbit-yellow outline-none"
                      placeholder="email@παράδειγμα.com"
                      required
                    />
                  </div>
                </>
              )}

              <label className="block text-sm font-medium text-anbit-text">Κωδικός</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-anbit-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-modal-input w-full rounded-xl pl-11 pr-12 py-3.5 text-anbit-text border border-anbit-border bg-anbit-input focus:border-anbit-yellow outline-none"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-anbit-muted hover:text-anbit-text"
                  aria-label={showPassword ? 'Απόκρυψη' : 'Εμφάνιση'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {isRegister && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptPrivacy}
                    onChange={(e) => setAcceptPrivacy(e.target.checked)}
                    className="mt-1 rounded border-anbit-border text-anbit-yellow focus:ring-anbit-yellow"
                  />
                  <span className="text-sm text-anbit-muted">
                    Αποδέχομαι τους{' '}
                    <a href="#" className="text-anbit-yellow hover:underline">Όρους</a>
                    {' '}και την{' '}
                    <a href="#" className="text-anbit-yellow hover:underline">Πολιτική Απορρήτου</a>.
                  </span>
                </label>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-anbit-yellow text-anbit-yellow-content rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (isRegister ? 'Δημιουργία λογαριασμού' : 'Σύνδεση')}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-anbit-muted">
              {isRegister ? 'Έχετε ήδη λογαριασμό; ' : 'Δεν έχετε λογαριασμό; '}
              <button
                type="button"
                onClick={() => onSwitchMode(isRegister ? 'login' : 'register')}
                className="text-anbit-yellow font-semibold hover:underline"
              >
                {isRegister ? 'Συνδεθείτε' : 'Εγγραφείτε'}
              </button>
            </p>
          </div>

          {/* Privacy footer – Wolt style */}
          <div className="px-6 sm:px-8 pb-6 pt-2">
            <p className="text-xs text-anbit-muted text-center leading-relaxed">
              Παρακαλούμε επισκεφτείτε την{' '}
              <a href="#" className="text-anbit-yellow hover:underline">Δήλωση Προστασίας Προσωπικών Δεδομένων</a>
              {' '}για να μάθετε σχετικά με την επεξεργασία προσωπικών δεδομένων στο Anbit.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
