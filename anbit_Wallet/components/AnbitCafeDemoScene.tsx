import React from 'react';
import { Smartphone, Wifi, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AnbitWordmark from './AnbitWordmark';

interface PhotoSceneProps {
  className?: string;
}

const PhotoScene: React.FC<PhotoSceneProps> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full bg-anbit-bg ${className}`}
    >
      <div className="relative w-full min-h-[420px] md:min-h-[520px] overflow-hidden border border-anbit-border rounded-2xl bg-anbit-card">
        {/* Background Image - Cafe Scene */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-anbit-bg via-anbit-bg/80 to-transparent" />

        {/* Content Layer */}
        <div className="relative z-10 flex items-center justify-center p-4 md:p-8">
          <div className="max-w-7xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Side */}
              <div className="space-y-6 bg-anbit-card/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl border border-anbit-border">
                <div className="space-y-4">
                  <Badge className="inline-flex items-center gap-1.5 bg-anbit-yellow text-anbit-yellow-content hover:opacity-90">
                    <span>Εμπειρία</span>
                    <AnbitWordmark className="text-sm text-anbit-yellow-content" />
                  </Badge>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-anbit-text leading-tight">
                    Απρόσκοπτη Εστίαση με Τεχνολογία NFC
                  </h1>
                  <p className="text-sm md:text-base text-anbit-muted leading-relaxed">
                    Παρακολούθησε φίλους να απολαμβάνουν μια σύγχρονη εμπειρία καφέ – από την περιήγηση
                    ψηφιακών μενού μέχρι το κέρδισμα ανταμοιβών με κάθε πληρωμή.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-anbit-card border border-anbit-border">
                    <div className="p-2 rounded-lg bg-anbit-yellow/15 text-anbit-yellow">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-anbit-text">Άγγιγμα NFC</h3>
                      <p className="text-sm text-anbit-muted">Άμεση πρόσβαση στο μενού</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-anbit-card border border-anbit-border">
                    <div className="p-2 rounded-lg bg-anbit-yellow/15 text-anbit-yellow">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-anbit-text">Ψηφιακό Μενού</h3>
                      <p className="text-sm text-anbit-muted">Περιηγηθείτε & παραγγείλτε εύκολα</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-anbit-card border border-anbit-border">
                    <div className="p-2 rounded-lg bg-anbit-yellow/15 text-anbit-yellow">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-anbit-text">Ανταμοιβές XP</h3>
                      <p className="text-sm text-anbit-muted">Κερδίστε με κάθε επίσκεψη</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-anbit-card border border-anbit-border">
                    <div className="p-2 rounded-lg bg-anbit-yellow/15 text-anbit-yellow">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-anbit-text">Γρήγορη Πληρωμή</h3>
                      <p className="text-sm text-anbit-muted">Ανέπαφη ολοκλήρωση</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side – desktop scene annotations */}
              <div className="relative h-[420px] md:h-[520px] hidden lg:block">
                <div className="absolute top-12 left-8 bg-anbit-card rounded-2xl shadow-xl p-4 max-w-xs border border-anbit-border animate-float">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-anbit-yellow/20 text-anbit-yellow">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-anbit-text">Άγγιγμα NFC</p>
                      <p className="text-xs text-anbit-muted">
                        Βάση τραπεζιού με λογότυπο <AnbitWordmark className="inline text-xs text-anbit-text" />
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-anbit-muted">
                    Ο πελάτης αγγίζει το τηλέφωνο για άμεση πρόσβαση στο ψηφιακό μενού.
                  </p>
                </div>

                <div className="absolute top-48 right-8 bg-anbit-card rounded-2xl shadow-xl p-4 max-w-xs border border-anbit-border animate-float-delayed">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-anbit-yellow/20 text-anbit-yellow">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-anbit-text">Περιήγηση Μενού</p>
                      <p className="text-xs text-anbit-muted">Διαδραστική ψηφιακή εμπειρία</p>
                    </div>
                  </div>
                  <p className="text-sm text-anbit-muted">
                    Δείτε προϊόντα με ενδείξεις πόντων και λεπτομερείς περιγραφές.
                  </p>
                </div>

                <div className="absolute bottom-32 left-12 bg-anbit-card rounded-2xl shadow-xl p-4 max-w-xs border border-anbit-border animate-float">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-anbit-yellow/20 text-anbit-yellow">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-anbit-text">Επιτυχής Πληρωμή</p>
                      <p className="text-xs text-anbit-muted">Κερδίσατε 150 XP</p>
                    </div>
                  </div>
                  <p className="text-sm text-anbit-muted">
                    Άμεση επιβεβαίωση με πίστωση πόντων ανταμοιβής.
                  </p>
                </div>

                <div className="absolute bottom-8 right-16 bg-gradient-to-r from-anbit-yellow to-red-700 text-anbit-yellow-content rounded-2xl shadow-xl p-4 max-w-xs animate-float-delayed">
                  <p className="font-bold text-lg mb-1">Αληθινές Στιγμές</p>
                  <p className="text-sm opacity-90">
                    Αυθεντική εμπειρία εστίασης καταγεγραμμένη σε φυσικό φως.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Stats Bar */}
            <div className="mt-8 md:mt-10 bg-anbit-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-anbit-border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-black text-anbit-yellow">4</p>
                  <p className="text-xs md:text-sm text-anbit-muted mt-1">Φίλοι που τρώνε</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-black text-anbit-yellow">1</p>
                  <p className="text-xs md:text-sm text-anbit-muted mt-1">Άγγιγμα NFC</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-black text-anbit-yellow">150</p>
                  <p className="text-xs md:text-sm text-anbit-muted mt-1">XP που κερδίσατε</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-black text-anbit-yellow">100%</p>
                  <p className="text-xs md:text-sm text-anbit-muted mt-1">Ανέπαφο</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating blobs */}
        <div className="pointer-events-none absolute top-10 right-10 w-16 h-16 bg-anbit-yellow/20 rounded-full blur-xl animate-pulse" />
        <div
          className="pointer-events-none absolute bottom-20 left-16 w-24 h-24 bg-anbit-yellow/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="pointer-events-none absolute top-1/2 right-1/4 w-20 h-20 bg-anbit-yellow/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>
    </div>
  );
};

const AnbitCafeDemoScene: React.FC = () => {
  return <PhotoScene />;
};

export default AnbitCafeDemoScene;

