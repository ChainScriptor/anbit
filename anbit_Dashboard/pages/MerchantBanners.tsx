import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Flame,
  Image as ImageIcon,
  Loader2,
  Percent,
  Plus,
  Tag,
  Timer,
  Trash2,
  Upload,
  X,
  ZapIcon,
} from 'lucide-react';
import { useAuth } from '@/AuthContext';
import { api, type ApiProduct } from '@/services/api';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────
type TargetType = 'none' | 'products' | 'categories';

type MerchantBanner = {
  id: string; merchantId: string; title: string;
  imageUrl: string; createdAt: string;
};

type MerchantOffer = {
  id: string; merchantId: string; title: string; description: string;
  imageUrl: string; priceOriginal: number; priceDiscounted: number;
  points: number; discountPercent: number;
  targetType: TargetType; targetProductIds: string[]; targetCategories: string[];
  isActive: boolean; createdAt: string;
  // Time limit
  hasExpiry: boolean; expiresAt: string; // ISO string
};

type DayStreakOffer = {
  id: string; merchantId: string; title: string; description: string;
  productId: string; productName: string; // empty = any product
  streakDays: number; // e.g. 4
  dailyXp: number;
  completionBonusXp: number;
  isActive: boolean; createdAt: string;
  imageUrl: string;
};

type FormState = {
  title: string; description: string; imageUrl: string;
  priceOriginal: string; priceDiscounted: string; points: string;
  discountPercent: string; targetType: TargetType;
  targetProductIds: string[]; targetCategories: string[];
  hasExpiry: boolean; expiresAt: string;
};

type StreakFormState = {
  title: string; description: string; imageUrl: string;
  productId: string; streakDays: string;
  dailyXp: string; completionBonusXp: string;
};

// ─── Storage helpers ─────────────────────────────────────────────────────────
const BANNERS_KEY = 'anbit_merchant_banners_v1';
const OFFERS_KEY = 'anbit_merchant_offers_v2';
const STREAKS_KEY = 'anbit_merchant_streaks_v1';
const MAX_FILE_BYTES = 2 * 1024 * 1024;

function readLS<T>(key: string): T[] {
  try { const raw = localStorage.getItem(key); if (!raw) return []; const p = JSON.parse(raw) as T[]; return Array.isArray(p) ? p : []; } catch { return []; }
}
function writeLS<T>(key: string, list: T[]): void {
  localStorage.setItem(key, JSON.stringify(list));
}
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Αποτυχία ανάγνωσης αρχείου.'));
    reader.readAsDataURL(file);
  });
}

// Expiry helpers
function formatExpiry(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('el-GR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}
function isExpired(iso: string): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}
function timeLeft(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'Έληξε';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}μ ${h % 24}ω`;
  return h > 0 ? `${h}ω ${m}λ` : `${m}λ`;
}

const EMPTY_FORM: FormState = {
  title: '', description: '', imageUrl: '',
  priceOriginal: '', priceDiscounted: '', points: '', discountPercent: '',
  targetType: 'none', targetProductIds: [], targetCategories: [],
  hasExpiry: false, expiresAt: '',
};

const EMPTY_STREAK: StreakFormState = {
  title: '', description: '', imageUrl: '',
  productId: '', streakDays: '4', dailyXp: '10', completionBonusXp: '50',
};

// ─── Shared sub-components ────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</label>
      {children}
    </div>
  );
}
const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 placeholder:text-slate-300';

// ─── Image upload zone ────────────────────────────────────────────────────────
function ImageUploadZone({ imageUrl, onClear, onRef, minHeight = 160 }: {
  imageUrl: string; onClear: () => void; onRef: (el: HTMLInputElement | null) => void; minHeight?: number;
}) {
  return (
    <div style={{ minHeight }} className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-400 hover:bg-slate-100">
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="" className="h-full w-full rounded-xl object-cover" style={{ minHeight }} />
          <button type="button" onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
            <ImageIcon className="h-5 w-5 text-slate-400" />
          </div>
          <span className="text-xs font-medium text-slate-400">Κλικ για upload</span>
          <span className="text-[10px] text-slate-300">PNG / JPG / WEBP · max 2MB</span>
        </div>
      )}
      <input ref={onRef} type="file" accept="image/*" className="hidden" />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const MerchantBanners: React.FC = () => {
  const { user } = useAuth();
  const merchantId = user?.id ?? '';
  const [tab, setTab] = useState<'offers' | 'streaks' | 'banners'>('offers');

  // ── Data ────────────────────────────────────────────────────────────────────
  const [banners, setBanners] = useState<MerchantBanner[]>([]);
  const [offers, setOffers] = useState<MerchantOffer[]>([]);
  const [streaks, setStreaks] = useState<DayStreakOffer[]>([]);
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [apiCategories, setApiCategories] = useState<string[]>([]);

  // ── Offer form ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Streak form ─────────────────────────────────────────────────────────────
  const [streakForm, setStreakForm] = useState<StreakFormState>(EMPTY_STREAK);
  const [streakError, setStreakError] = useState<string | null>(null);
  const [isSavingStreak, setIsSavingStreak] = useState(false);
  const streakImageRef = useRef<HTMLInputElement>(null);

  // ── Banner ──────────────────────────────────────────────────────────────────
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!merchantId) return;
    setBanners(readLS<MerchantBanner>(BANNERS_KEY).filter((b) => b.merchantId?.toLowerCase() === merchantId.toLowerCase()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setOffers(readLS<MerchantOffer>(OFFERS_KEY).filter((o) => o.merchantId?.toLowerCase() === merchantId.toLowerCase()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setStreaks(readLS<DayStreakOffer>(STREAKS_KEY).filter((s) => s.merchantId?.toLowerCase() === merchantId.toLowerCase()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [merchantId]);

  useEffect(() => {
    api.getProducts()
      .then((data) => setApiProducts(data.filter((p) => p.merchantId?.toLowerCase() === merchantId.toLowerCase() || !p.merchantId)))
      .catch(() => {});
    api.getMerchantCategories().then(setApiCategories).catch(() => {});
  }, [merchantId]);

  // ── Offer helpers ───────────────────────────────────────────────────────────
  const set = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  }, []);

  const toggleProductTarget = useCallback((id: string) => {
    setForm((prev) => ({ ...prev, targetProductIds: prev.targetProductIds.includes(id) ? prev.targetProductIds.filter((x) => x !== id) : [...prev.targetProductIds, id] }));
  }, []);

  const toggleCategoryTarget = useCallback((cat: string) => {
    setForm((prev) => ({ ...prev, targetCategories: prev.targetCategories.includes(cat) ? prev.targetCategories.filter((x) => x !== cat) : [...prev.targetCategories, cat] }));
  }, []);

  const handleImageSelect = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setFormError('Επίλεξε αρχείο εικόνας.'); return; }
    if (file.size > MAX_FILE_BYTES) { setFormError('Μέγιστο μέγεθος 2MB.'); return; }
    const url = await fileToDataUrl(file);
    setForm((prev) => ({ ...prev, imageUrl: url }));
    setFormError(null);
  }, []);

  // ── Save offer ──────────────────────────────────────────────────────────────
  const handleSaveOffer = useCallback(async () => {
    if (!merchantId) return;
    const title = form.title.trim();
    if (!title) { setFormError('Συμπλήρωσε τίτλο προσφοράς.'); return; }
    const priceOriginal = Number(form.priceOriginal.replace(',', '.'));
    const priceDiscounted = Number(form.priceDiscounted.replace(',', '.'));
    if (form.priceOriginal && isNaN(priceOriginal)) { setFormError('Μη έγκυρη τιμή πριν discount.'); return; }
    if (form.priceDiscounted && isNaN(priceDiscounted)) { setFormError('Μη έγκυρη τιμή μετά discount.'); return; }
    if (form.hasExpiry && !form.expiresAt) { setFormError('Ορίσε ημερομηνία λήξης.'); return; }
    if (form.hasExpiry && new Date(form.expiresAt).getTime() <= Date.now()) { setFormError('Η ημερομηνία λήξης πρέπει να είναι στο μέλλον.'); return; }
    if (form.targetType === 'products' && form.targetProductIds.length === 0) { setFormError('Επίλεξε τουλάχιστον ένα προϊόν.'); return; }
    if (form.targetType === 'categories' && form.targetCategories.length === 0) { setFormError('Επίλεξε τουλάχιστον μια κατηγορία.'); return; }

    setIsSaving(true);
    try {
      const newOffer: MerchantOffer = {
        id: crypto.randomUUID(), merchantId, title,
        description: form.description.trim(), imageUrl: form.imageUrl,
        priceOriginal: form.priceOriginal ? priceOriginal : 0,
        priceDiscounted: form.priceDiscounted ? priceDiscounted : 0,
        points: form.points ? Number(form.points) : 0,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : 0,
        targetType: form.targetType,
        targetProductIds: form.targetType === 'products' ? form.targetProductIds : [],
        targetCategories: form.targetType === 'categories' ? form.targetCategories : [],
        isActive: true, createdAt: new Date().toISOString(),
        hasExpiry: form.hasExpiry, expiresAt: form.hasExpiry ? form.expiresAt : '',
      };
      const merged = [newOffer, ...readLS<MerchantOffer>(OFFERS_KEY)];
      writeLS(OFFERS_KEY, merged);
      setOffers(merged.filter((o) => o.merchantId?.toLowerCase() === merchantId.toLowerCase()));
      setForm(EMPTY_FORM); setFormError(null); setTargetOpen(false);
    } finally { setIsSaving(false); }
  }, [form, merchantId]);

  // ── Save streak ─────────────────────────────────────────────────────────────
  const handleStreakImageSelect = useCallback(async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setStreakError('Επίλεξε αρχείο εικόνας.'); return; }
    if (file.size > MAX_FILE_BYTES) { setStreakError('Μέγιστο μέγεθος 2MB.'); return; }
    const url = await fileToDataUrl(file);
    setStreakForm((prev) => ({ ...prev, imageUrl: url }));
    setStreakError(null);
  }, []);

  const handleSaveStreak = useCallback(async () => {
    if (!merchantId) return;
    const title = streakForm.title.trim();
    if (!title) { setStreakError('Συμπλήρωσε τίτλο streak.'); return; }
    const days = Number(streakForm.streakDays);
    if (!days || days < 2 || days > 30) { setStreakError('Ορίσε αριθμό ημερών (2–30).'); return; }
    const dailyXp = Number(streakForm.dailyXp);
    if (!dailyXp || dailyXp < 1) { setStreakError('Ορίσε daily XP > 0.'); return; }

    setIsSavingStreak(true);
    try {
      const product = apiProducts.find((p) => p.id === streakForm.productId);
      const newStreak: DayStreakOffer = {
        id: crypto.randomUUID(), merchantId, title,
        description: streakForm.description.trim(),
        imageUrl: streakForm.imageUrl,
        productId: streakForm.productId,
        productName: product?.name ?? (streakForm.productId ? 'Unknown' : 'Οποιοδήποτε προϊόν'),
        streakDays: days,
        dailyXp, completionBonusXp: Number(streakForm.completionBonusXp) || 0,
        isActive: true, createdAt: new Date().toISOString(),
      };
      const merged = [newStreak, ...readLS<DayStreakOffer>(STREAKS_KEY)];
      writeLS(STREAKS_KEY, merged);
      setStreaks(merged.filter((s) => s.merchantId?.toLowerCase() === merchantId.toLowerCase()));
      setStreakForm(EMPTY_STREAK); setStreakError(null);
    } finally { setIsSavingStreak(false); }
  }, [streakForm, merchantId, apiProducts]);

  // ── Banner ──────────────────────────────────────────────────────────────────
  const handleBannerUpload = useCallback(async (files: FileList | null) => {
    if (!files || !merchantId) return;
    setBannerError(null); setBannerSuccess(null); setBannerUploading(true);
    try {
      const all = readLS<MerchantBanner>(BANNERS_KEY);
      const next: MerchantBanner[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) throw new Error(`"${file.name}" δεν είναι εικόνα.`);
        if (file.size > MAX_FILE_BYTES) throw new Error(`"${file.name}" > 2MB.`);
        const imageUrl = await fileToDataUrl(file);
        next.push({ id: crypto.randomUUID(), merchantId, title: bannerTitle.trim() || file.name.replace(/\.[^.]+$/, ''), imageUrl, createdAt: new Date().toISOString() });
      }
      const merged = [...next, ...all];
      writeLS(BANNERS_KEY, merged);
      setBanners(merged.filter((b) => b.merchantId?.toLowerCase() === merchantId.toLowerCase()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setBannerTitle('');
      setBannerSuccess(`${next.length} banner${next.length > 1 ? 's' : ''} αποθηκεύτηκε.`);
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : 'Αποτυχία upload.');
    } finally { setBannerUploading(false); }
  }, [merchantId, bannerTitle]);

  const handleDeleteBanner = useCallback((id: string) => {
    const next = readLS<MerchantBanner>(BANNERS_KEY).filter((b) => b.id !== id);
    writeLS(BANNERS_KEY, next);
    setBanners((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleToggleOffer = useCallback((id: string) => {
    const all = readLS<MerchantOffer>(OFFERS_KEY).map((o) => o.id === id ? { ...o, isActive: !o.isActive } : o);
    writeLS(OFFERS_KEY, all);
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, isActive: !o.isActive } : o));
  }, []);

  const handleDeleteOffer = useCallback((id: string) => {
    writeLS(OFFERS_KEY, readLS<MerchantOffer>(OFFERS_KEY).filter((o) => o.id !== id));
    setOffers((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const handleToggleStreak = useCallback((id: string) => {
    const all = readLS<DayStreakOffer>(STREAKS_KEY).map((s) => s.id === id ? { ...s, isActive: !s.isActive } : s);
    writeLS(STREAKS_KEY, all);
    setStreaks((prev) => prev.map((s) => s.id === id ? { ...s, isActive: !s.isActive } : s));
  }, []);

  const handleDeleteStreak = useCallback((id: string) => {
    writeLS(STREAKS_KEY, readLS<DayStreakOffer>(STREAKS_KEY).filter((s) => s.id !== id));
    setStreaks((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const discountSavings = form.priceOriginal && form.priceDiscounted
    ? ((Number(form.priceOriginal) - Number(form.priceDiscounted)) / Number(form.priceOriginal) * 100).toFixed(0)
    : null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-0 sm:px-1">
      {/* Header */}
      <div>
        <h1 className="font-anbit-display text-2xl font-bold tracking-tight text-slate-900">Offers & Banners</h1>
        <p className="mt-1 text-sm text-slate-500">Δημιούργησε προσφορές, day streaks και banners για τους πελάτες σου.</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
        <div className="inline-flex min-w-max gap-1 rounded-xl bg-slate-100 p-1">
          {([
            { key: 'offers', label: `Offers (${offers.length})` },
            { key: 'streaks', label: `Day Streaks (${streaks.length})` },
            { key: 'banners', label: `Banners (${banners.length})` },
          ] as const).map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={cn('whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all',
                tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════ OFFERS TAB ══════════════════════ */}
      {tab === 'offers' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Νέα Προσφορά</h2>
              <p className="mt-0.5 text-xs text-slate-400">Συμπλήρωσε τα στοιχεία και επίλεξε τα προϊόντα που επηρεάζει η έκπτωση.</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Image + basic */}
              <div className="grid gap-5 grid-cols-1 md:grid-cols-[200px_1fr]">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Εικόνα</label>
                  <div role="button" tabIndex={0}
                    onClick={() => imageInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && imageInputRef.current?.click()}
                    className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-400 hover:bg-slate-100"
                    style={{ minHeight: 160 }}>
                    {form.imageUrl ? (
                      <>
                        <img src={form.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" style={{ minHeight: 160 }} />
                        <button type="button" onClick={(e) => { e.stopPropagation(); setForm((p) => ({ ...p, imageUrl: '' })); }}
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200"><ImageIcon className="h-5 w-5 text-slate-400" /></div>
                        <span className="text-xs font-medium text-slate-400">Κλικ για upload</span>
                        <span className="text-[10px] text-slate-300">PNG / JPG / WEBP · max 2MB</span>
                      </div>
                    )}
                  </div>
                  <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => void handleImageSelect(e.target.files?.[0])} />
                </div>
                <div className="space-y-4">
                  <Field label="Τίτλος Προσφοράς *">
                    <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)}
                      placeholder="π.χ. Καλοκαιρινή προσφορά" className={inputCls} />
                  </Field>
                  <Field label="Περιγραφή">
                    <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                      placeholder="Σύντομη περιγραφή..." rows={3} className={cn(inputCls, 'resize-none')} />
                  </Field>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label="Τιμή Πριν">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">€</span>
                    <input type="number" step="0.01" min="0" value={form.priceOriginal}
                      onChange={(e) => set('priceOriginal', e.target.value)} placeholder="0.00" className={cn(inputCls, 'pl-8')} />
                  </div>
                </Field>
                <Field label={`Τιμή Μετά${discountSavings ? ` (−${discountSavings}%)` : ''}`}>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-emerald-500">€</span>
                    <input type="number" step="0.01" min="0" value={form.priceDiscounted}
                      onChange={(e) => set('priceDiscounted', e.target.value)} placeholder="0.00" className={cn(inputCls, 'pl-8')} />
                  </div>
                </Field>
                <Field label="Πόντοι (XP)">
                  <div className="relative">
                    <ZapIcon className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-400" />
                    <input type="number" step="1" min="0" value={form.points}
                      onChange={(e) => set('points', e.target.value)} placeholder="0" className={cn(inputCls, 'pl-8')} />
                  </div>
                </Field>
              </div>

              {/* ── Time limit ─────────────────────────────────────────── */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <button type="button"
                  onClick={() => set('hasExpiry', !form.hasExpiry)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
                      <Timer className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">Χρονικό Όριο</span>
                    {form.hasExpiry && form.expiresAt && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        Λήξη: {formatExpiry(form.expiresAt)}
                      </span>
                    )}
                  </div>
                  <div className={cn('relative h-5 w-9 rounded-full transition-colors', form.hasExpiry ? 'bg-slate-900' : 'bg-slate-300')}>
                    <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', form.hasExpiry ? 'translate-x-4' : 'translate-x-0.5')} />
                  </div>
                </button>
                {form.hasExpiry && (
                  <div className="border-t border-slate-100 p-4 space-y-3">
                    <p className="text-xs text-slate-500">Η προσφορά απενεργοποιείται αυτόματα μετά την ημερομηνία που ορίζεις.</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Ημερομηνία & Ώρα Λήξης">
                        <div className="relative">
                          <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          <input type="datetime-local" value={form.expiresAt}
                            onChange={(e) => set('expiresAt', e.target.value)}
                            min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                            className={cn(inputCls, 'pl-9')} />
                        </div>
                      </Field>
                      {/* Quick presets */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">Γρήγορη Επιλογή</label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { label: '2 ώρες', ms: 2 * 3600000 },
                            { label: '1 μέρα', ms: 86400000 },
                            { label: '3 μέρες', ms: 3 * 86400000 },
                            { label: '1 εβδομάδα', ms: 7 * 86400000 },
                          ].map((p) => (
                            <button key={p.label} type="button"
                              onClick={() => set('expiresAt', new Date(Date.now() + p.ms).toISOString().slice(0, 16))}
                              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-400 transition">
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Discount targeting ─────────────────────────────────── */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <button type="button" onClick={() => setTargetOpen((v) => !v)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
                      <Percent className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">Εφαρμογή % Έκπτωσης</span>
                    {form.discountPercent && form.targetType !== 'none' && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        −{form.discountPercent}% σε {form.targetType === 'products' ? `${form.targetProductIds.length} προϊόντα` : `${form.targetCategories.length} κατηγορίες`}
                      </span>
                    )}
                  </div>
                  <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform', targetOpen && 'rotate-180')} />
                </button>
                {targetOpen && (
                  <div className="border-t border-slate-100 p-4 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Εφαρμογή σε</label>
                      <div className="flex flex-wrap gap-2">
                        {(['none', 'products', 'categories'] as TargetType[]).map((t) => (
                          <button key={t} type="button" onClick={() => set('targetType', t)}
                            className={cn('rounded-lg px-3.5 py-2 text-xs font-semibold transition-all',
                              form.targetType === t ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                            {t === 'none' ? 'Καμία' : t === 'products' ? 'Συγκεκριμένα Προϊόντα' : 'Κατηγορίες'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {form.targetType !== 'none' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-semibold text-slate-600 shrink-0">Ποσοστό έκπτωσης:</label>
                          <div className="relative w-28">
                            <input type="number" step="1" min="0" max="100" value={form.discountPercent}
                              onChange={(e) => set('discountPercent', e.target.value)} placeholder="0"
                              className={cn(inputCls, 'pr-7 text-center')} />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
                          </div>
                        </div>
                        {form.targetType === 'products' && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500">Επίλεξε προϊόντα ({form.targetProductIds.length} επιλεγμένα)</label>
                            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                              {apiProducts.length === 0
                                ? <p className="px-4 py-3 text-xs text-slate-400">Δεν βρέθηκαν προϊόντα.</p>
                                : apiProducts.map((p) => {
                                  const checked = form.targetProductIds.includes(p.id);
                                  return (
                                    <label key={p.id} className={cn('flex cursor-pointer items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50', checked && 'bg-slate-50')}>
                                      <input type="checkbox" checked={checked} onChange={() => toggleProductTarget(p.id)} className="h-4 w-4 rounded border-slate-300 text-slate-900" />
                                      {p.imageUrl && <img src={p.imageUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />}
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
                                        <p className="text-xs text-slate-400">€{Number(p.price).toFixed(2)} · {p.category}</p>
                                      </div>
                                      {checked && <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{form.discountPercent ? `−${form.discountPercent}%` : '✓'}</span>}
                                    </label>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                        {form.targetType === 'categories' && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500">Επίλεξε κατηγορίες ({form.targetCategories.length} επιλεγμένες)</label>
                            <div className="flex flex-wrap gap-2">
                              {apiCategories.length === 0
                                ? <p className="text-xs text-slate-400">Δεν βρέθηκαν κατηγορίες.</p>
                                : apiCategories.map((cat) => {
                                  const checked = form.targetCategories.includes(cat);
                                  return (
                                    <button key={cat} type="button" onClick={() => toggleCategoryTarget(cat)}
                                      className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
                                        checked ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400')}>
                                      {cat}{checked && form.discountPercent && ` −${form.discountPercent}%`}
                                    </button>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
                  <X className="h-3.5 w-3.5 shrink-0" />{formError}
                </div>
              )}
              <div className="flex justify-end">
                <button type="button" onClick={() => void handleSaveOffer()} disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Αποθήκευση Προσφοράς
                </button>
              </div>
            </div>
          </div>

          {/* Offers list */}
          {offers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Προσφορές</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {offers.map((offer) => {
                  const expired = offer.hasExpiry && offer.expiresAt ? isExpired(offer.expiresAt) : false;
                  return (
                    <article key={offer.id} className={cn('overflow-hidden rounded-2xl border bg-white shadow-sm transition', offer.isActive && !expired ? 'border-slate-200' : 'border-slate-100 opacity-60')}>
                      {offer.imageUrl && <img src={offer.imageUrl} alt={offer.title} className="h-36 w-full object-cover" />}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-900 truncate">{offer.title}</p>
                              {offer.discountPercent > 0 && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">−{offer.discountPercent}%</span>}
                              {expired && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">Έληξε</span>}
                              {offer.hasExpiry && !expired && offer.expiresAt && (
                                <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                  <Timer className="h-2.5 w-2.5" />{timeLeft(offer.expiresAt)}
                                </span>
                              )}
                            </div>
                            {offer.description && <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{offer.description}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => handleToggleOffer(offer.id)}
                              className={cn('rounded-lg px-2.5 py-1 text-[10px] font-bold transition',
                                offer.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
                              {offer.isActive ? 'Ενεργή' : 'Ανενεργή'}
                            </button>
                            <button type="button" onClick={() => handleDeleteOffer(offer.id)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {(offer.priceOriginal > 0 || offer.priceDiscounted > 0) && (
                          <div className="flex items-center gap-2 pt-1">
                            {offer.priceOriginal > 0 && <span className="text-sm text-slate-400 line-through">€{offer.priceOriginal.toFixed(2)}</span>}
                            {offer.priceDiscounted > 0 && <span className="text-sm font-bold text-emerald-600">€{offer.priceDiscounted.toFixed(2)}</span>}
                            {offer.points > 0 && <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-amber-600"><ZapIcon className="h-3 w-3" />{offer.points} XP</span>}
                          </div>
                        )}
                        {offer.hasExpiry && offer.expiresAt && (
                          <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Calendar className="h-3 w-3" />
                            Λήξη: {formatExpiry(offer.expiresAt)}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
          {offers.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><Tag className="h-5 w-5 text-slate-300" /></div>
              <p className="text-sm font-semibold text-slate-400">Δεν υπάρχουν προσφορές ακόμα</p>
              <p className="mt-1 text-xs text-slate-300">Συμπλήρωσε τη φόρμα παραπάνω</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════ DAY STREAKS TAB ══════════════════════ */}
      {tab === 'streaks' && (
        <div className="space-y-6">
          {/* Explainer */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <Flame className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Τι είναι τα Day Streaks;</p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700">
                Ορίζεις ένα προϊόν (ή οποιοδήποτε) και έναν αριθμό ημερών. Ο πελάτης που παραγγέλνει αυτό το προϊόν για Ν συνεχόμενες μέρες κερδίζει daily XP κάθε μέρα, και bonus XP όταν ολοκληρώσει το streak.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">Νέο Day Streak</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Image + basic */}
              <div className="grid gap-5 grid-cols-1 md:grid-cols-[180px_1fr]">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Εικόνα</label>
                  <div role="button" tabIndex={0}
                    onClick={() => streakImageRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && streakImageRef.current?.click()}
                    className="relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-slate-400"
                    style={{ minHeight: 140 }}>
                    {streakForm.imageUrl ? (
                      <>
                        <img src={streakForm.imageUrl} alt="" className="h-full w-full rounded-xl object-cover" style={{ minHeight: 140 }} />
                        <button type="button" onClick={(e) => { e.stopPropagation(); setStreakForm((p) => ({ ...p, imageUrl: '' })); }}
                          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                        <Flame className="h-8 w-8 text-amber-300" />
                        <span className="text-xs text-slate-400">Εικόνα streak</span>
                      </div>
                    )}
                  </div>
                  <input ref={streakImageRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => void handleStreakImageSelect(e.target.files?.[0])} />
                </div>
                <div className="space-y-4">
                  <Field label="Τίτλος Streak *">
                    <input type="text" value={streakForm.title}
                      onChange={(e) => setStreakForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="π.χ. 4 μέρες καφέ, κέρδισε XP" className={inputCls} />
                  </Field>
                  <Field label="Περιγραφή">
                    <textarea value={streakForm.description}
                      onChange={(e) => setStreakForm((p) => ({ ...p, description: e.target.value }))}
                      rows={2} placeholder="Παραγγέλνεις καφέ κάθε μέρα για 4 μέρες και κερδίζεις..."
                      className={cn(inputCls, 'resize-none')} />
                  </Field>
                </div>
              </div>

              {/* Product + days */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <Field label="Προϊόν Streak">
                  <select value={streakForm.productId}
                    onChange={(e) => setStreakForm((p) => ({ ...p, productId: e.target.value }))}
                    className={inputCls}>
                    <option value="">Οποιοδήποτε προϊόν</option>
                    {apiProducts.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — €{Number(p.price).toFixed(2)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Αριθμός Ημερών *" >
                  <input type="number" step="1" min="2" max="30" value={streakForm.streakDays}
                    onChange={(e) => setStreakForm((p) => ({ ...p, streakDays: e.target.value }))}
                    placeholder="4" className={inputCls} />
                </Field>
              </div>

              {/* XP */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <Field label="Daily XP ανά μέρα *">
                  <div className="relative">
                    <ZapIcon className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-amber-400" />
                    <input type="number" step="1" min="1" value={streakForm.dailyXp}
                      onChange={(e) => setStreakForm((p) => ({ ...p, dailyXp: e.target.value }))}
                      placeholder="10" className={cn(inputCls, 'pl-8')} />
                  </div>
                </Field>
                <Field label="Bonus XP ολοκλήρωσης">
                  <div className="relative">
                    <Flame className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-orange-400" />
                    <input type="number" step="5" min="0" value={streakForm.completionBonusXp}
                      onChange={(e) => setStreakForm((p) => ({ ...p, completionBonusXp: e.target.value }))}
                      placeholder="50" className={cn(inputCls, 'pl-8')} />
                  </div>
                </Field>
              </div>

              {/* Preview */}
              {streakForm.streakDays && streakForm.dailyXp && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                  <p className="text-xs font-semibold text-amber-700 mb-2">Προεπισκόπηση Streak</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {Array.from({ length: Math.min(Number(streakForm.streakDays) || 4, 7) }).map((_, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-300 bg-white">
                          <Flame className="h-4 w-4 text-amber-400" />
                        </div>
                        <span className="text-[9px] font-bold text-amber-600">+{streakForm.dailyXp} XP</span>
                      </div>
                    ))}
                    {Number(streakForm.streakDays) > 7 && (
                      <span className="text-xs text-amber-500 font-semibold">+{Number(streakForm.streakDays) - 7} ακόμη</span>
                    )}
                    {Number(streakForm.completionBonusXp) > 0 && (
                      <div className="flex flex-col items-center gap-1 ml-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-500">
                          <ZapIcon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-[9px] font-bold text-amber-700">+{streakForm.completionBonusXp} bonus</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-amber-600">
                    Σύνολο: {Number(streakForm.streakDays) * Number(streakForm.dailyXp) + Number(streakForm.completionBonusXp || 0)} XP για {Number(streakForm.streakDays)} μέρες streak
                  </p>
                </div>
              )}

              {streakError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
                  <X className="h-3.5 w-3.5 shrink-0" />{streakError}
                </div>
              )}
              <div className="flex justify-end">
                <button type="button" onClick={() => void handleSaveStreak()} disabled={isSavingStreak}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 disabled:opacity-60">
                  {isSavingStreak ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flame className="h-4 w-4" />}
                  Αποθήκευση Streak
                </button>
              </div>
            </div>
          </div>

          {/* Streaks list */}
          {streaks.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {streaks.map((streak) => (
                <article key={streak.id} className={cn('overflow-hidden rounded-2xl border bg-white shadow-sm', streak.isActive ? 'border-amber-200' : 'border-slate-100 opacity-60')}>
                  {streak.imageUrl && <img src={streak.imageUrl} alt={streak.title} className="h-32 w-full object-cover" />}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-amber-500 shrink-0" />
                          <p className="font-semibold text-slate-900">{streak.title}</p>
                        </div>
                        {streak.description && <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{streak.description}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => handleToggleStreak(streak.id)}
                          className={cn('rounded-lg px-2.5 py-1 text-[10px] font-bold transition',
                            streak.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}>
                          {streak.isActive ? 'Ενεργό' : 'Ανενεργό'}
                        </button>
                        <button type="button" onClick={() => handleDeleteStreak(streak.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Streak info */}
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                        {streak.streakDays} μέρες
                      </span>
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                        +{streak.dailyXp} XP/μέρα
                      </span>
                      {streak.completionBonusXp > 0 && (
                        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">
                          +{streak.completionBonusXp} bonus XP
                        </span>
                      )}
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                        {streak.productName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Σύνολο: <span className="font-semibold text-amber-600">{streak.streakDays * streak.dailyXp + streak.completionBonusXp} XP</span> για πλήρες streak
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
                <Flame className="h-5 w-5 text-amber-300" />
              </div>
              <p className="text-sm font-semibold text-slate-400">Δεν υπάρχουν Day Streaks ακόμα</p>
              <p className="mt-1 text-xs text-slate-300">Δημιούργησε το πρώτο streak παραπάνω</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════ BANNERS TAB ══════════════════════ */}
      {tab === 'banners' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h2 className="font-semibold text-slate-900">Banner Upload</h2>
              <p className="mt-0.5 text-xs text-slate-400">Εικόνες που εμφανίζονται στο PWA store view κατά το άνοιγμα QR.</p>
            </div>
            <Field label="Τίτλος (προαιρετικό)">
              <input type="text" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)}
                placeholder="π.χ. Happy Hour 18:00-20:00" className={inputCls} />
            </Field>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition">
              <Upload className="h-4 w-4" />
              {bannerUploading ? 'Uploading...' : 'Επιλογή εικόνων'}
              <input type="file" accept="image/*" multiple className="hidden" disabled={bannerUploading} onChange={(e) => void handleBannerUpload(e.target.files)} />
            </label>
            <p className="text-[11px] text-slate-400">PNG / JPG / WEBP / AVIF · Πολλαπλές εικόνες · max 2MB/αρχείο</p>
            {bannerSuccess && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{bannerSuccess}</p>}
            {bannerError && <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">{bannerError}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {banners.map((banner) => (
              <article key={banner.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <img src={banner.imageUrl} alt={banner.title} className="h-40 w-full object-cover" />
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{banner.title || 'Banner'}</p>
                    <p className="text-[11px] text-slate-400">{new Date(banner.createdAt).toLocaleString('el-GR')}</p>
                  </div>
                  <button type="button" onClick={() => handleDeleteBanner(banner.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}
            {banners.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"><ImageIcon className="h-5 w-5 text-slate-300" /></div>
                <p className="text-sm font-semibold text-slate-400">Δεν υπάρχουν banners ακόμα</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantBanners;
