import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { api } from '../services/api';
import { useOrder } from '../context/OrderContext';
import { Partner, Product } from '../types';
import StoreMenuPage from './StoreMenuPage';
import { useDashboardData } from '../hooks/useDashboardData';
import { useLanguage } from '../context/LanguageContext';

const STORE_LANG_KEY = 'anbit-store-lang-chosen';
const STORE_QR_PARTNER_CACHE_PREFIX = 'anbit-store-partner-cache:';
const MERCHANT_PRODUCTS_POLL_INTERVAL_MS = 30_000;

const LANGUAGES = [
  { code: 'el' as const, name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
];

interface StoreFromQrPageProps {
  onOrderComplete?: (xpEarned: number) => void;
  isAuthenticated?: boolean;
  onOpenLogin?: (onSuccess?: () => void) => void;
  onOpenRegister?: (onSuccess?: () => void) => void;
}

const StoreFromQrPage: React.FC<StoreFromQrPageProps> = ({
  onOrderComplete,
  isAuthenticated = false,
  onOpenLogin,
  onOpenRegister,
}) => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const cachedPartner =
    typeof window !== 'undefined' && shortCode
      ? (() => {
          try {
            const raw = sessionStorage.getItem(`${STORE_QR_PARTNER_CACHE_PREFIX}${shortCode}`);
            return raw ? (JSON.parse(raw) as Partner) : null;
          } catch {
            return null;
          }
        })()
      : null;

  const navigate = useNavigate();
  const { setSession } = useOrder();
  const { partners } = useDashboardData(isAuthenticated);
  const { language, setLanguage } = useLanguage();

  const [langChosen, setLangChosen] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem(STORE_LANG_KEY) === '1' : false
  );
  const [selectedLang, setSelectedLang] = useState<'el' | 'en'>(language);
  const [partner, setPartner] = useState<Partner | null>(cachedPartner);
  const [error, setError] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const resolvingRef = useRef(false);
  const resolvedShortCodeRef = useRef<string | null>(null);
  const [pollMerchantId, setPollMerchantId] = useState<string | null>(null);

  useEffect(() => {
    if (!shortCode) {
      setError('Μη έγκυρος κωδικός QR.');
      return;
    }

    // Prevent duplicate API calls for the same shortCode
    if (resolvingRef.current || resolvedShortCodeRef.current === shortCode) {
      return;
    }

    let cancelled = false;
    resolvingRef.current = true;
    setIsResolving(true);

    const run = async () => {
      try {
        const details = await api.getQrCodeDetails(shortCode);

        setSession({
          merchantId: details.merchantId,
          tableNumber: details.tableId,
        });

        const normalizedMerchantId = details.merchantId.toLowerCase();

        // 1) Προσπάθησε να βρεις partner από τα ήδη φορτωμένα δεδομένα
        let found =
          partners.find((p) => p.id?.toLowerCase() === normalizedMerchantId) ?? null;

        // 2) Πάντα φέρνουμε το merchant menu από API για να εμφανίζονται
        // άμεσα νέες κατηγορίες/προϊόντα από το merchant dashboard.
        const merchantProducts = [];
        const pageSize = 100;
        let offset = 0;
        while (true) {
          const page = await api.getProducts({
            merchantId: details.merchantId,
            limit: pageSize,
            offset,
          });
          merchantProducts.push(...page);
          if (page.length < pageSize) break;
          offset += pageSize;
        }

        const menu: Product[] = merchantProducts.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          xpReward: p.xp,
          image:
            p.imageUrl ||
            'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: p.category ?? 'Menu',
        }));

        if (found) {
          found = {
            ...found,
            menu,
          };
        } else {
          found = {
            id: details.merchantId,
            name: `Store ${details.merchantId.slice(0, 6)}`,
            category: 'burger',
            image:
              'https://images.pexels.com/photos/323682/pexels-photo-323682.jpeg?auto=compress&cs=tinysrgb&w=400',
            location: 'Unknown',
            rating: 4.8,
            reviewCount: undefined,
            deliveryTime: undefined,
            minOrder: undefined,
            bonusXp: undefined,
            menu,
          };
        }

        if (!found) {
          setError('Δεν βρέθηκε κατάστημα για αυτό το QR.');
          return;
        }

        setPartner(found);
        setPollMerchantId(details.merchantId);
        if (shortCode && typeof window !== 'undefined') {
          sessionStorage.setItem(`${STORE_QR_PARTNER_CACHE_PREFIX}${shortCode}`, JSON.stringify(found));
        }
        resolvedShortCodeRef.current = shortCode;
      } catch (e) {
        console.error('Failed to resolve QR code', e);
        const status = (e as { response?: { status?: number } })?.response?.status;
        // Το menu για merchant πλέον είναι AllowAnonymous, άρα μην κατευθύνεις σε login εδώ.
        setError('Το QR δεν βρέθηκε ή έληξε.');
      } finally {
        // Always release flags, even if effect was cancelled,
        // otherwise StrictMode remounts can leave the page in endless loading.
        resolvingRef.current = false;
        setIsResolving(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [shortCode, setSession, isAuthenticated]);

  // Poll merchant products so new categories/products appear without requiring a page refresh.
  useEffect(() => {
    if (!pollMerchantId) return;
    let cancelled = false;

    const fetchMenu = async () => {
      // Do not update state after unmount.
      if (cancelled) return;
      const merchantProducts: any[] = [];
      const pageSize = 100;
      let offset = 0;

      while (true) {
        const page = await api.getProducts({
          merchantId: pollMerchantId,
          limit: pageSize,
          offset,
        });
        merchantProducts.push(...page);
        if (page.length < pageSize) break;
        offset += pageSize;
      }

      if (cancelled) return;

      const menu: Product[] = merchantProducts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        xpReward: p.xp,
        image:
          p.imageUrl ||
          'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: p.category ?? 'Menu',
      }));

      setPartner((prev) => (prev ? { ...prev, menu } : prev));
    };

    void fetchMenu();
    const intervalId = window.setInterval(() => {
      void fetchMenu();
    }, MERCHANT_PRODUCTS_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [pollMerchantId]);

  const handleStartOrdering = () => {
    setLanguage(selectedLang);
    if (typeof window !== 'undefined') localStorage.setItem(STORE_LANG_KEY, '1');
    setLangChosen(true);
  };

  if (!langChosen) {
    return (
      <div className="min-h-screen bg-white text-[#333] flex flex-col p-6 safe-area-inset" data-theme="light">
        <h1 className="text-xl font-bold text-[#333] mb-6 mt-4">
          Choose your language:
        </h1>
        <ul className="space-y-2 flex-1">
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                onClick={() => setSelectedLang(lang.code)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[rgba(0,0,0,0.12)] bg-white hover:bg-gray-50 text-left transition-colors"
              >
                <span className="text-2xl" aria-hidden>{lang.flag}</span>
                <span className="flex-1 font-medium text-[#333]">{lang.name}</span>
                {selectedLang === lang.code && (
                  <Check className="w-5 h-5 text-[#333] shrink-0" strokeWidth={2.5} />
                )}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={handleStartOrdering}
          className="w-full py-4 rounded-xl bg-[#333333] text-white font-bold text-base hover:bg-[#222] transition-colors mt-4"
        >
          Start ordering!
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white p-4">
        <p className="text-sm text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  if (!partner && isResolving) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-white">
        <div className="w-10 h-10 border-4 border-[#333] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#666] font-medium tracking-wide uppercase">
          Φόρτωση καταλόγου καταστήματος...
        </p>
      </div>
    );
  }

  // Guard against race conditions where resolving finished but partner is still null.
  if (!partner) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-white">
        <div className="w-10 h-10 border-4 border-[#333] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#666] font-medium tracking-wide uppercase">
          Φόρτωση καταλόγου καταστήματος...
        </p>
      </div>
    );
  }

  return (
    <StoreMenuPage
      partner={partner}
      onBack={() => navigate('/dashboard')}
      onOrderComplete={onOrderComplete}
      isAuthenticated={isAuthenticated}
      onOpenLogin={onOpenLogin}
      onOpenRegister={onOpenRegister}
    />
  );
};

export default StoreFromQrPage;

