
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AnbitWordmark from './AnbitWordmark';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Σφάλμα εισόδου. Ελέγξτε τα στοιχεία σας.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('test@anbit.gr');
    setPassword('warrior');
    setIsSubmitting(true);
    try {
      await login('test@anbit.gr', 'warrior');
    } catch (err: any) {
      setError('Η είσοδος απέτυχε.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-anbit-bg flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-anbit-yellow/5 rounded-full blur-[160px] animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        className="z-10 grid w-full max-w-[1180px] grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6"
      >
        <div className="p-8 lg:p-12 flex flex-col justify-between dashboard-card bg-anbit-card/40 border-white/5 min-h-[300px] lg:min-h-[500px]">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-anbit-yellow rounded-xl flex items-center justify-center shadow-lg transform -rotate-6"><span className="text-anbit-yellow-content font-black text-xl italic">A</span></div>
              <h2 className="flex flex-wrap items-baseline gap-2 text-lg lg:text-xl font-black text-white uppercase italic tracking-tighter">
                <AnbitWordmark className="text-lg lg:text-xl text-white" />
                <span>Rewards</span>
              </h2>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-[0.9] italic">Member<br/><span className="text-anbit-yellow">Portal.</span></h1>
              <p className="text-sm lg:text-xl text-anbit-muted italic max-w-sm">Το μεγαλύτερο δίκτυο επιβράβευσης στη Θεσσαλονίκη.</p>
            </div>
          </div>
          <div className="flex gap-6 pt-6 border-t border-white/5">
             <div className="flex flex-col"><span className="text-lg font-black text-white">15k+</span><span className="text-[8px] font-black uppercase tracking-widest text-anbit-muted">Μέλη</span></div>
             <div className="flex flex-col"><span className="text-lg font-black text-white">40+</span><span className="text-[8px] font-black uppercase tracking-widest text-anbit-muted">Καταστήματα</span></div>
          </div>
        </div>

        <div className="p-8 lg:p-12 dashboard-card border-white/10 bg-anbit-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-anbit-muted uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-anbit-muted" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/[0.03] border border-anbit-border rounded-xl pl-12 pr-4 py-3 text-sm focus:border-anbit-yellow outline-none transition-all font-bold" placeholder="your@email.com" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-anbit-muted uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-anbit-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.03] border border-anbit-border rounded-xl pl-12 pr-12 py-3 text-sm focus:border-anbit-yellow outline-none transition-all font-bold"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-anbit-muted hover:text-white transition-colors p-1"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Απόκρυψη κωδικού' : 'Εμφάνιση κωδικού'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="text-[10px] font-black text-red-400 uppercase tracking-widest bg-red-400/10 p-3 rounded-lg border border-red-400/20">{error}</div>}

            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-anbit-yellow text-anbit-yellow-content rounded-xl font-black text-sm uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Είσοδος <ArrowRight className="w-4 h-4" /></>}
            </button>

            <button type="button" onClick={handleDemoLogin} className="w-full py-3 bg-white/5 text-anbit-yellow rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-anbit-yellow/20">Γρήγορη Είσοδος (Demo)</button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
