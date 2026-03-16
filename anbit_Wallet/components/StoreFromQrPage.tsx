import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { api, type ApiProduct } from '../services/api';
import { useOrder } from '../context/OrderContext';
import { Partner, Product } from '../types';
import StoreMenuPage from './StoreMenuPage';
import { useDashboardData } from '../hooks/useDashboardData';
import { useLanguage } from '../context/LanguageContext';

const STORE_LANG_KEY = 'anbit-store-lang-chosen';

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
  const navigate = useNavigate();
  const { setSession } = useOrder();
  const { partners } = useDashboardData(isAuthenticated);
  const { language, setLanguage } = useLanguage();

  const [langChosen, setLangChosen] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem(STORE_LANG_KEY) === '1' : false
  );
  const [selectedLang, setSelectedLang] = useState<'el' | 'en'>(language);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!shortCode) {
        setError('Μη έγκυρος κωδικός QR.');
        return;
      }

      try {
        const details = await api.getQrCodeDetails(shortCode);

        setSession({
          merchantId: details.merchantId,
          tableNumber: details.tableId,
        });

        // 1) Προσπάθησε να βρεις partner από τα ήδη φορτωμένα δεδομένα
        let found = partners.find((p) => p.id === details.merchantId) ?? null;

        // 2) Αν δεν υπάρχει και ο χρήστης είναι συνδεδεμένος, φέρε products από API
        if (!found && isAuthenticated) {
          const allProducts: ApiProduct[] = await api.getProducts();
          const merchantProducts = allProducts.filter(
            (p) => p.merchantId === details.merchantId,
          );

          if (merchantProducts.length > 0) {
            const menu: Product[] = merchantProducts.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              xpReward: p.xp,
              image:
                'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400',
              category: p.category ?? 'Menu',
            }));

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
        }

        if (!found) {
          setError('Δεν βρέθηκε κατάστημα για αυτό το QR.');
          return;
        }

        setPartner(found);
      } catch (e) {
        console.error('Failed to resolve QR code', e);
        setError('Το QR δεν βρέθηκε ή έληξε.');
      }
    };

    run();
  }, [shortCode, partners, setSession]);

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

