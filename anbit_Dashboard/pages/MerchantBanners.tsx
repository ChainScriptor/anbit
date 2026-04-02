import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Tag, Trash2, Upload } from 'lucide-react';
import { useAuth } from '@/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MerchantBanner = {
  id: string;
  merchantId: string;
  title: string;
  imageUrl: string;
  createdAt: string;
};

const STORAGE_KEY = 'anbit_merchant_banners_v1';
const OFFERS_STORAGE_KEY = 'anbit_merchant_offers_v1';
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ACCENT = '#0a0a0a';
const OMNES_HEADING_STYLE: React.CSSProperties = {
  fontFamily: 'OmnesBoldItalic, sans-serif',
  fontStyle: 'italic',
  fontWeight: 700,
};

type MerchantOffer = {
  id: string;
  merchantId: string;
  title: string;
  description: string;
  discountLabel: string;
  isActive: boolean;
  createdAt: string;
};

function readAllBanners(): MerchantBanner[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MerchantBanner[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllBanners(list: MerchantBanner[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function readAllOffers(): MerchantOffer[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OFFERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MerchantOffer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllOffers(list: MerchantOffer[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(list));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

const MerchantBanners: React.FC = () => {
  const { user } = useAuth();
  const merchantId = user?.id ?? '';
  const [title, setTitle] = useState('');
  const [banners, setBanners] = useState<MerchantBanner[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [offers, setOffers] = useState<MerchantOffer[]>([]);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerDiscountLabel, setOfferDiscountLabel] = useState('');

  useEffect(() => {
    const own = readAllBanners()
      .filter((b) => String(b.merchantId).toLowerCase() === merchantId.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setBanners(own);
  }, [merchantId]);
  useEffect(() => {
    const own = readAllOffers()
      .filter((o) => String(o.merchantId).toLowerCase() === merchantId.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOffers(own);
  }, [merchantId]);

  const countLabel = useMemo(() => `${banners.length} banner${banners.length === 1 ? '' : 's'}`, [banners.length]);
  const offersCountLabel = useMemo(
    () => `${offers.length} offer${offers.length === 1 ? '' : 's'}`,
    [offers.length],
  );

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !merchantId) return;
      setError(null);
      setMessage(null);
      setIsUploading(true);
      try {
        const all = readAllBanners();
        const next: MerchantBanner[] = [];

        for (const file of Array.from(files)) {
          if (!file.type.startsWith('image/')) {
            throw new Error(`Το αρχείο "${file.name}" δεν είναι εικόνα.`);
          }
          if (file.size > MAX_FILE_SIZE_BYTES) {
            throw new Error(`Το "${file.name}" είναι πάνω από 2MB.`);
          }
          const imageUrl = await fileToDataUrl(file);
          next.push({
            id: crypto.randomUUID(),
            merchantId,
            title: title.trim() || file.name.replace(/\.[^.]+$/, ''),
            imageUrl,
            createdAt: new Date().toISOString(),
          });
        }

        const merged = [...next, ...all];
        writeAllBanners(merged);
        setBanners(
          merged
            .filter((b) => String(b.merchantId).toLowerCase() === merchantId.toLowerCase())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        );
        setTitle('');
        setMessage('Τα banners αποθηκεύτηκαν και είναι διαθέσιμα στο PWA store view.');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Αποτυχία upload banner.');
      } finally {
        setIsUploading(false);
      }
    },
    [merchantId, title],
  );

  const handleDelete = useCallback(
    (bannerId: string) => {
      const all = readAllBanners();
      const next = all.filter((b) => b.id !== bannerId);
      writeAllBanners(next);
      setBanners((prev) => prev.filter((b) => b.id !== bannerId));
      setMessage('Το banner διαγράφηκε.');
      setError(null);
    },
    [],
  );
  const handleCreateOffer = useCallback(() => {
    if (!merchantId) return;
    const cleanTitle = offerTitle.trim();
    if (!cleanTitle) {
      setError('Βάλε τίτλο προσφοράς.');
      setMessage(null);
      return;
    }

    const all = readAllOffers();
    const nextOffer: MerchantOffer = {
      id: crypto.randomUUID(),
      merchantId,
      title: cleanTitle,
      description: offerDescription.trim(),
      discountLabel: offerDiscountLabel.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const merged = [nextOffer, ...all];
    writeAllOffers(merged);
    setOffers(
      merged
        .filter((o) => String(o.merchantId).toLowerCase() === merchantId.toLowerCase())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    );
    setOfferTitle('');
    setOfferDescription('');
    setOfferDiscountLabel('');
    setMessage('Η προσφορά αποθηκεύτηκε.');
    setError(null);
  }, [merchantId, offerDescription, offerDiscountLabel, offerTitle]);

  const handleToggleOffer = useCallback((offerId: string) => {
    const all = readAllOffers();
    const next = all.map((o) =>
      o.id === offerId ? { ...o, isActive: !o.isActive } : o,
    );
    writeAllOffers(next);
    setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, isActive: !o.isActive } : o)));
    setMessage('Η κατάσταση της προσφοράς ενημερώθηκε.');
    setError(null);
  }, []);

  const handleDeleteOffer = useCallback((offerId: string) => {
    const all = readAllOffers();
    const next = all.filter((o) => o.id !== offerId);
    writeAllOffers(next);
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
    setMessage('Η προσφορά διαγράφηκε.');
    setError(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-black tracking-tight text-slate-900" style={OMNES_HEADING_STYLE}>
          Store Banners
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ανέβασε banners για το κατάστημά σου. Θα εμφανίζονται στο PWA όταν ανοίγει το store μέσω QR.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Σύνολο: {countLabel}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-black tracking-tight text-slate-900" style={OMNES_HEADING_STYLE}>
            Banner Upload
          </h2>
          <span className="text-[11px] font-semibold text-slate-500">Max 2MB / image</span>
        </div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Τίτλος banner (προαιρετικό)</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="π.χ. Happy Hour 18:00-20:00"
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none focus:ring-2"
          style={{ ['--tw-ring-color' as string]: `${ACCENT}33` }}
        />
        <div className="mt-4">
          <label
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
            style={{ backgroundColor: ACCENT }}
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload banner εικόνες'}
            <input
              type="file"
              accept="image/*,.avif,image/avif"
              multiple
              className="hidden"
              disabled={isUploading}
              onChange={(e) => void handleUpload(e.target.files)}
            />
          </label>
          <p className="mt-2 text-[11px] text-slate-500">PNG/JPG/WEBP/AVIF · Μπορείς να επιλέξεις πολλαπλές εικόνες.</p>
        </div>

        {message && <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {banners.map((banner) => (
          <article key={banner.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <img src={banner.imageUrl} alt={banner.title || 'banner'} className="h-44 w-full object-cover" />
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{banner.title || 'Banner'}</p>
                <p className="text-[11px] text-slate-500">{new Date(banner.createdAt).toLocaleString('el-GR')}</p>
              </div>
              <Button
                type="button"
                onClick={() => handleDelete(banner.id)}
                variant="outline"
                size="icon"
                className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                aria-label="Delete banner"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </article>
        ))}
        {banners.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs font-medium text-slate-500">
            Δεν υπάρχουν banners ακόμα.
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900" style={OMNES_HEADING_STYLE}>
              Merchant Offers
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Δημιούργησε προσφορές για το κατάστημά σου.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {offersCountLabel}
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={offerTitle}
            onChange={(e) => setOfferTitle(e.target.value)}
            placeholder="Τίτλος προσφοράς"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none focus:ring-2"
            style={{ ['--tw-ring-color' as string]: `${ACCENT}33` }}
          />
          <input
            value={offerDiscountLabel}
            onChange={(e) => setOfferDiscountLabel(e.target.value)}
            placeholder="Discount label (π.χ. -20% ή 1+1)"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none focus:ring-2"
            style={{ ['--tw-ring-color' as string]: `${ACCENT}33` }}
          />
          <textarea
            value={offerDescription}
            onChange={(e) => setOfferDescription(e.target.value)}
            placeholder="Περιγραφή προσφοράς"
            className="sm:col-span-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none focus:ring-2"
            style={{ ['--tw-ring-color' as string]: `${ACCENT}33` }}
          />
        </div>
        <Button
          type="button"
          onClick={handleCreateOffer}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#0a0a0a] px-5 text-xs font-semibold text-white hover:bg-[#111]"
        >
          <Plus className="h-4 w-4" />
          Δημιουργία προσφοράς
        </Button>

        <div className="mt-4 space-y-2">
          {offers.map((offer) => (
            <article
              key={offer.id}
              className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-slate-500" />
                  <p className="truncate text-sm font-semibold text-slate-900">{offer.title}</p>
                  {offer.discountLabel ? (
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      {offer.discountLabel}
                    </span>
                  ) : null}
                </div>
                {offer.description ? (
                  <p className="mt-1 text-xs text-slate-600">{offer.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  onClick={() => handleToggleOffer(offer.id)}
                  size="sm"
                  className={cn(
                    'h-8 rounded-lg px-2.5 text-[10px] font-semibold',
                    offer.isActive
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300',
                  )}
                >
                  {offer.isActive ? 'Active' : 'Inactive'}
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDeleteOffer(offer.id)}
                  variant="outline"
                  size="icon"
                  className="rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50"
                  aria-label="Delete offer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
          {offers.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-xs font-medium text-slate-500">
              Δεν υπάρχουν προσφορές ακόμα.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantBanners;
