import React, { useState } from 'react';
import {
  Bell,
  Building2,
  ChevronRight,
  Clock,
  CreditCard,
  Globe,
  Lock,
  LogOut,
  Moon,
  Save,
  Shield,
  Smartphone,
  Star,
  Sun,
  User,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-300';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

function SectionCard({ title, description, icon: Icon, children }: {
  title: string; description?: string;
  icon: React.FC<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-4.5 w-4.5 text-slate-700" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-400">{description}</p>}
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function Toggle({ value, onChange, label, desc }: {
  value: boolean; onChange: (v: boolean) => void;
  label: string; desc?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {desc && <p className="text-xs text-slate-400">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          value ? 'bg-slate-900' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform',
            value ? 'translate-x-5' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}

// ─── Days of week ─────────────────────────────────────────────────────────────
const DAYS = ['Δευ', 'Τρι', 'Τετ', 'Πεμ', 'Παρ', 'Σαβ', 'Κυρ'];

// ─── Main component ───────────────────────────────────────────────────────────
const MerchantSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Store info
  const [storeName, setStoreName] = useState(user?.username ?? '');
  const [storeDesc, setStoreDesc] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeWebsite, setStoreWebsite] = useState('');

  // Notifications
  const [notifyNewOrder, setNotifyNewOrder] = useState(true);
  const [notifyOrderSound, setNotifyOrderSound] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(false);
  const [notifyReviews, setNotifyReviews] = useState(true);

  // Operating hours
  const [openDays, setOpenDays] = useState<boolean[]>([true, true, true, true, true, true, false]);
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('22:00');

  // Loyalty
  const [xpMultiplier, setXpMultiplier] = useState('1');
  const [minOrderXp, setMinOrderXp] = useState('5');
  const [streakBonusXp, setStreakBonusXp] = useState('50');

  // Appearance
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Save state
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production: call api.updateMerchantSettings(...)
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleDay = (idx: number) => {
    setOpenDays((prev) => prev.map((d, i) => (i === idx ? !d : d)));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 text-slate-900">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-anbit-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Διαχείριση καταστήματος, ειδοποιήσεων και loyalty.</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition',
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-white hover:bg-slate-800',
          )}
        >
          <Save className="h-4 w-4" />
          {saved ? 'Αποθηκεύτηκε!' : 'Αποθήκευση'}
        </button>
      </div>

      {/* ── Store Info ─────────────────────────────────────────────────── */}
      <SectionCard title="Πληροφορίες Καταστήματος" description="Βασικά στοιχεία που βλέπουν οι πελάτες" icon={Building2}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Όνομα Καταστήματος *">
            <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
              placeholder="π.χ. Pax Burgers" className={inputCls} />
          </Field>
          <Field label="Τηλέφωνο">
            <input type="tel" value={storePhone} onChange={(e) => setStorePhone(e.target.value)}
              placeholder="+30 210 0000000" className={inputCls} />
          </Field>
        </div>
        <Field label="Περιγραφή">
          <textarea value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)}
            rows={3} placeholder="Σύντομη περιγραφή για το κατάστημά σου..."
            className={cn(inputCls, 'resize-none')} />
        </Field>
        <Field label="Διεύθυνση">
          <input type="text" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)}
            placeholder="π.χ. Ερμού 12, Αθήνα" className={inputCls} />
        </Field>
        <Field label="Website / Social" hint="Προαιρετικό link που εμφανίζεται στο προφίλ">
          <div className="relative">
            <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="url" value={storeWebsite} onChange={(e) => setStoreWebsite(e.target.value)}
              placeholder="https://..." className={cn(inputCls, 'pl-9')} />
          </div>
        </Field>
      </SectionCard>

      {/* ── Operating Hours ────────────────────────────────────────────── */}
      <SectionCard title="Ωράριο Λειτουργίας" description="Ποιες μέρες και ώρες είναι ανοιχτό το κατάστημα" icon={Clock}>
        {/* Days */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">Μέρες</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day, i) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
                  openDays[i]
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400',
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Hours */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Άνοιγμα">
            <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Κλείσιμο">
            <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className={inputCls} />
          </Field>
        </div>
      </SectionCard>

      {/* ── Notifications ──────────────────────────────────────────────── */}
      <SectionCard title="Ειδοποιήσεις" description="Διαχείριση push και sound notifications" icon={Bell}>
        <div className="space-y-4">
          <Toggle value={notifyNewOrder} onChange={setNotifyNewOrder}
            label="Ειδοποίηση νέας παραγγελίας" desc="Browser notification όταν έρθει νέα παραγγελία" />
          <Toggle value={notifyOrderSound} onChange={setNotifyOrderSound}
            label="Ήχος για νέες παραγγελίες" desc="Beep ήχος στο Orders Live Feed" />
          <Toggle value={notifyLowStock} onChange={setNotifyLowStock}
            label="Low Stock alert" desc="Ειδοποίηση όταν ένα προϊόν είναι sold out" />
          <Toggle value={notifyReviews} onChange={setNotifyReviews}
            label="Νέα reviews πελατών" desc="Ειδοποίηση για νέες αξιολογήσεις" />
        </div>
      </SectionCard>

      {/* ── Loyalty & XP ──────────────────────────────────────────────── */}
      <SectionCard title="Loyalty & XP" description="Ρύθμιση πόντων για παραγγελίες και streaks" icon={Zap}>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="XP Multiplier" hint="π.χ. 2x = διπλοί πόντοι">
            <div className="relative">
              <Star className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-400" />
              <input type="number" step="0.1" min="0.1" max="10" value={xpMultiplier}
                onChange={(e) => setXpMultiplier(e.target.value)} placeholder="1"
                className={cn(inputCls, 'pl-9')} />
            </div>
          </Field>
          <Field label="Min XP ανά παραγγελία" hint="Ελάχιστοι πόντοι ανά παραγγελία">
            <input type="number" step="1" min="0" value={minOrderXp}
              onChange={(e) => setMinOrderXp(e.target.value)} placeholder="5" className={inputCls} />
          </Field>
          <Field label="Bonus XP ολοκλήρωσης Streak" hint="Έξτρα XP για 100% streak">
            <input type="number" step="5" min="0" value={streakBonusXp}
              onChange={(e) => setStreakBonusXp(e.target.value)} placeholder="50" className={inputCls} />
          </Field>
        </div>

        {/* XP preview */}
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-500 mb-2">Παράδειγμα πόντων</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-slate-400">Παραγγελία €10 </span>
              <span className="font-bold text-amber-600">→ {Math.round(10 * Number(xpMultiplier || 1) + Number(minOrderXp || 0))} XP</span>
            </div>
            <div>
              <span className="text-slate-400">Ολοκλήρωση streak </span>
              <span className="font-bold text-amber-600">→ +{streakBonusXp} bonus XP</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Appearance ────────────────────────────────────────────────── */}
      <SectionCard title="Εμφάνιση" description="Θέμα dashboard" icon={Sun}>
        <div className="flex gap-3">
          {([
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
          ] as const).map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all',
                theme === value
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── Security ──────────────────────────────────────────────────── */}
      <SectionCard title="Ασφάλεια & Λογαριασμός" icon={Shield}>
        <div className="space-y-2">
          {[
            { icon: Lock, label: 'Αλλαγή κωδικού πρόσβασης', desc: 'Τελευταία αλλαγή: πρόσφατα' },
            { icon: Smartphone, label: 'Two-Factor Authentication', desc: '2FA για επιπλέον ασφάλεια' },
            { icon: CreditCard, label: 'Στοιχεία χρέωσης', desc: 'Διαχείριση πληρωμών και συνδρομής' },
          ].map(({ icon: Icon, label, desc }) => (
            <button
              key={label}
              type="button"
              className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left hover:bg-slate-100 transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <Icon className="h-4 w-4 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── Danger zone ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <h3 className="font-semibold text-red-800">Αποσύνδεση & Λογαριασμός</h3>
        <p className="mt-1 text-xs text-red-600">
          Αποσύνδεση από το Anbit Merchant Dashboard.
        </p>
        <button
          type="button"
          onClick={() => { logout(); navigate('/auth', { replace: true }); }}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          Αποσύνδεση
        </button>
      </div>
    </div>
  );
};

export default MerchantSettings;
