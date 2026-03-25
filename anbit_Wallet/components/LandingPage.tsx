import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AuthModal from './AuthModal';
import AnbitWordmark from './AnbitWordmark';

const LandingPage: React.FC = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-anbit-bg text-anbit-text flex flex-col">
      {/* Navbar – κουμπιά όπως είναι (Σύνδεση / Εγγραφή) */}
      <nav className="sticky top-0 z-50 w-full border-b border-anbit-border bg-anbit-card/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-anbit-yellow rounded-lg flex items-center justify-center -rotate-6">
              <span className="text-anbit-yellow-content font-black text-lg italic">A</span>
            </div>
            <AnbitWordmark className="text-lg text-anbit-text" />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openLogin}
              className="px-4 py-2 text-sm font-semibold text-anbit-text hover:text-anbit-yellow transition-colors"
            >
              Σύνδεση
            </button>
            <button
              type="button"
              onClick={openRegister}
              className="px-4 py-2.5 text-sm font-bold bg-anbit-yellow text-anbit-yellow-content rounded-lg hover:opacity-90 transition-opacity"
            >
              Εγγραφή
            </button>
          </div>
        </div>
      </nav>

      {/* Αρχική σελίδα Anbit – κύριο περιεχόμενο */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <section className="mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8"
          >
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-anbit-text tracking-tight uppercase italic leading-tight mb-4">
                Το μεγαλύτερο δίκτυο <span className="text-anbit-yellow">rewards</span> στη Θεσσαλονίκη
              </h1>
              <p className="text-anbit-muted text-base sm:text-lg max-w-xl mb-8">
                Συνδέσου ή εγγράψου και άρχισε να συγκεντρώνεις πόντους από τα αγαπημένα σου καταστήματα.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openRegister}
                  className="px-6 py-3.5 bg-anbit-yellow text-anbit-yellow-content rounded-xl font-black text-sm uppercase tracking-wider hover:opacity-90 transition-opacity"
                >
                  Δημιουργία λογαριασμού
                </button>
                <button
                  type="button"
                  onClick={openLogin}
                  className="px-6 py-3.5 border-2 border-anbit-border text-anbit-text rounded-xl font-bold text-sm hover:border-anbit-yellow hover:text-anbit-yellow transition-colors"
                >
                  Σύνδεση
                </button>
              </div>
            </div>
            <div className="flex gap-6 sm:gap-10 pt-4 lg:pt-0 border-t lg:border-t-0 border-anbit-border">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-anbit-text">15k+</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-anbit-muted">Μέλη</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl font-black text-anbit-text">40+</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-anbit-muted">Καταστήματα</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Κάρτα προβολής */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-anbit-border bg-anbit-card p-6 sm:p-8 lg:p-10 mb-12"
        >
          <h2 className="mb-2 flex flex-wrap items-baseline gap-2 text-xl sm:text-2xl font-black uppercase italic text-anbit-text">
            <AnbitWordmark className="text-xl sm:text-2xl text-anbit-text" />
            <span>Rewards</span>
          </h2>
          <p className="text-anbit-muted text-sm sm:text-base mb-6 max-w-2xl">
            Μέλος του δικτύου; Κάνε σκανάρισμα στο κατάστημα, συγκέντρωσε πόντους και ξεκλείδωσε rewards.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-anbit-text">
              <span className="w-2 h-2 bg-anbit-yellow rounded-full" />
              <span className="text-sm font-medium">Συνδέσου με το email σου</span>
            </div>
            <div className="flex items-center gap-2 text-anbit-text">
              <span className="w-2 h-2 bg-anbit-yellow rounded-full" />
              <span className="text-sm font-medium">Εγγραφή σε λίγα δευτερόλεπτα</span>
            </div>
          </div>
        </motion.section>

        {/* Κάτω τμήμα */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center sm:text-left border-t border-anbit-border pt-8 text-anbit-muted text-sm"
        >
          <p>Το μεγαλύτερο δίκτυο επιβράβευσης στη Θεσσαλονίκη. Συνδέσου ή εγγράψου από τα κουμπιά πάνω.</p>
        </motion.footer>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authModalMode}
        onSwitchMode={(mode) => setAuthModalMode(mode)}
      />
    </div>
  );
};

export default LandingPage;
