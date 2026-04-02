import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';

const LOGIN_RETURN_TO_KEY = 'anbit_login_return_to';

const ScanPage: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const { setSession } = useOrder();
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!shortCode) {
        setError('Μη έγκυρος κωδικός QR.');
        return;
      }

      try {
        const details = await api.getQrCodeDetails(shortCode);
        const merchantId = details.merchantId;

        setSession({
          merchantId,
          tableNumber: details.tableId,
        });

        const storePath = `/store/${shortCode}`;

        // Για QR flow: πρώτα login, μετά redirect στο ordering PWA store page.
        if (!isAuthenticated) {
          sessionStorage.setItem(LOGIN_RETURN_TO_KEY, storePath);
          navigate(`/login?returnTo=${encodeURIComponent(storePath)}`, { replace: true });
          return;
        }

        navigate(storePath, { replace: true });
      } catch (e) {
        console.error('Failed to resolve QR code', e);
        setError('Το QR δεν βρέθηκε ή έληξε.');
      }
    };

    run();
  }, [shortCode, navigate, setSession, isAuthenticated]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-sm text-red-400 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-4 border-anbit-yellow border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-anbit-muted font-medium tracking-wide uppercase">
        Σάρωση QR... φόρτωση καταστήματος
      </p>
    </div>
  );
};

export default ScanPage;

