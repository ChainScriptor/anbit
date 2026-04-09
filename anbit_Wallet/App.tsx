import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import XPProgressCircle from './components/XPProgressCircle';
import { FrostedHoverNav } from './components/ui/FrostedHoverNav';
import RewardSection from './components/RewardSection';
import Leaderboard from './components/Leaderboard';
import NetworkPage from './components/NetworkPage';
import QuestsPage from './components/QuestsPage';
import VaultPage from './components/VaultPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import SecurityPage from './components/SecurityPage';
import UserQRModal from './components/UserQRModal';
import ShopScannerPage from './components/ShopScannerPage';
import StoreMenuPage from './components/StoreMenuPage';
import StoreProfilePage from './components/StoreProfilePage';
import ActiveOperations from './components/ActiveOperations';
import RedemptionActiveModal from './components/RedemptionActiveModal';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { useOrder } from './context/OrderContext';
import { useLanguage } from './context/LanguageContext';
import { Partner, UserData, Reward } from './types';
import { MERCHANT_APPLY_URL } from './constants';
import { useDashboardData } from './hooks/useDashboardData';
import { FooterTaped } from './components/ui/FooterTaped';
import { OfferCarousel } from './components/ui/offer-carousel';
import { GREEK_OFFERS } from './data/greekOffers';
import ScanPage from './components/ScanPage';
import StoreFromQrPage from './components/StoreFromQrPage';
import { api } from './services/api';
import PwaHomeScreen from './components/PwaHomeScreen';
import CustomerLoginPage from './components/CustomerLoginPage';
import AnbitSplashScreen from './components/AnbitSplashScreen';

const App: React.FC = () => {
  const { isAuthenticated, user, isLoading: isAuthLoading, logout } = useAuth();
  const { session } = useOrder();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginRoute = location.pathname === '/login';
  const dashboardFeed = useDashboardData(!!isAuthenticated && !isLoginRoute);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeOrderPartner, setActiveOrderPartner] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [storeMenuPartner, setStoreMenuPartner] = useState<Partner | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null); // e.g. session expired or other global auth message
  const [xpPlaceholderMessage, setXpPlaceholderMessage] = useState<string | null>(null);
  const [splashDone, setSplashDone] = useState(false);
  useEffect(() => { setUserData(user ?? null); }, [user]);
  useEffect(() => { if (user) setAuthMessage(null); }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setXpPlaceholderMessage(null);
      return;
    }

    let cancelled = false;
    const loadUserXP = async () => {
      try {
        const breakdown = await api.getUserXP({ limit: 100, offset: 0 });
        if (cancelled) return;

        const totalXP = breakdown.reduce((sum, row) => sum + (Number(row.xp) || 0), 0);
        const storeXP = breakdown.reduce<Record<string, number>>((acc, row) => {
          const merchantId = String(row.merchantId);
          acc[merchantId] = Number(row.xp) || 0;
          return acc;
        }, {});
        const levelSize = 1000;
        const currentLevel = Math.max(1, Math.floor(totalXP / levelSize) + 1);
        const prevLevelXp = (currentLevel - 1) * levelSize;
        const nextLevelXP = currentLevel * levelSize;
        const levelProgress = Math.round(((totalXP - prevLevelXp) / levelSize) * 100);

        setUserData((prev) =>
          prev
            ? {
              ...prev,
              totalXP,
              storeXP,
              currentLevel,
              currentLevelName: `Level ${currentLevel}`,
              nextLevelXP,
              levelProgress: Math.max(0, Math.min(100, levelProgress)),
            }
            : prev,
        );
        setXpPlaceholderMessage(null);
      } catch (e) {
        if (cancelled) return;
        const status = (e as { response?: { status?: number } })?.response?.status;
        if (status === 401 || status === 404) {
          setXpPlaceholderMessage('Login για να δεις τα XP σου');
        }
      }
    };

    void loadUserXP();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id]);

  // On 401 from API: logout, show message, navigate without full-page refresh
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message?: string }>).detail;
      logout();
      setAuthMessage(detail?.message || 'Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.');
      if (location.pathname.startsWith('/profile')) {
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener('anbit:auth:401', handler);
    return () => window.removeEventListener('anbit:auth:401', handler);
  }, [logout, navigate, location.pathname]);

  const openLogin = useCallback((onSuccess?: () => void) => {
    setAuthMessage(null);
    if (onSuccess) setAuthSuccessCallback(() => onSuccess);
    setAuthModalMode('login');
    setAuthModalOpen(true);
  }, []);
  const openRegister = useCallback((onSuccess?: () => void) => {
    setAuthMessage(null);
    if (onSuccess) setAuthSuccessCallback(() => onSuccess);
    setAuthModalMode('register');
    setAuthModalOpen(true);
  }, []);
  const openLoginPage = useCallback((returnTo?: string) => {
    const target = returnTo ?? location.pathname;
    navigate(`/login?returnTo=${encodeURIComponent(target)}`);
  }, [location.pathname, navigate]);
  const closeAuthModal = useCallback(() => {
    setAuthSuccessCallback(null);
    setAuthModalOpen(false);
  }, []);
  useEffect(() => {
    if (!isAuthLoading) setIsLoaded(true);
  }, [isAuthLoading]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [location.pathname]);

  const handleOpenPartnerMenu = (partner: Partner) => {
    setSelectedPartner(partner);
    setStoreMenuPartner(partner);
    navigate('/network');
  };
  const handleOpenStoreProfile = (partner: Partner) => {
    navigate(`/store-profile/${partner.id}`, { state: { partner } });
  };
  const handleRedeemClick = (reward: Reward) => {
    // Check if user has enough points for THIS partner
    const storePoints = userData?.storeXP[reward.partnerId] || 0;
    if (storePoints >= reward.xpCost) {
      setSelectedReward(reward);
      setIsRedemptionModalOpen(true);
    } else {
      alert("ΑΝΕΠΑΡΚΕΣ ΥΠΟΛΟΙΠΟ ΠΟΝΤΩΝ ΣΕ ΑΥΤΟ ΤΟ ΚΑΤΑΣΤΗΜΑ");
    }
  };

  const handleOrderComplete = useCallback(async (xpEarned: number) => {
    if (!userData || !selectedPartner) return;

    setActiveOrderPartner(selectedPartner.name);

    setTimeout(async () => {
      setUserData(prev => {
        if (!prev) return null;

        const currentStoreXP = prev.storeXP[selectedPartner.id] || 0;
        const newStoreXP = {
          ...prev.storeXP,
          [selectedPartner.id]: currentStoreXP + xpEarned
        };

        return {
          ...prev,
          storeXP: newStoreXP
        };
      });
      setTimeout(() => setActiveOrderPartner(null), 3000);
    }, 2000);
  }, [userData, selectedPartner]);

  const dashboardContent = userData ? (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        <div className="xl:col-span-8 space-y-8 lg:space-y-12">
          <AnimatePresence>{activeOrderPartner && <ActiveOperations partnerName={activeOrderPartner} />}</AnimatePresence>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <XPProgressCircle user={userData} placeholderMessage={xpPlaceholderMessage ?? undefined} />
            </div>
            <div className="lg:col-span-5 dashboard-card p-6 lg:p-10 flex flex-col justify-between relative overflow-hidden group min-h-[300px]">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-anbit-yellow rounded-full animate-pulse" />
                  <span className="section-title text-anbit-muted text-[10px] lg:text-xs">{t('warriorNetwork')}</span>
                </div>
                <h2 className="section-title-lg text-anbit-text leading-tight">
                  {t('masterLegacy')}
                </h2>
                <p className="text-anbit-muted text-xs lg:text-sm font-medium leading-relaxed max-w-[200px]">
                  {userData.name}, {t('watchingProgress')}
                </p>
              </div>
              <button onClick={() => navigate('/quests')} className="w-full bg-[#e63533] border border-[#e63533] text-white py-3 lg:py-4 rounded-xl font-semibold text-xs lg:text-sm tracking-wide hover:bg-[#cf2f2d] hover:border-[#cf2f2d] transition-all">
                {t('commandCenter')}
              </button>
            </div>
          </div>
          <RewardSection rewards={dashboardFeed.rewards} onViewAll={() => navigate('/profile')} />
          <section className="space-y-4">
            <h2 className="section-title text-anbit-text text-lg lg:text-xl">{t('dealsOfTheDay')}</h2>
            <OfferCarousel offers={GREEK_OFFERS} />
          </section>
        </div>
        <div className="xl:col-span-4 space-y-6 lg:space-y-8">
          <div className="w-full overflow-hidden rounded-2xl">
            <FrostedHoverNav />
          </div>
          <div className="dashboard-card overflow-hidden"><Leaderboard entries={dashboardFeed.leaderboard} /></div>
          <div className="bg-anbit-bg border border-anbit-border rounded-3xl p-6 lg:p-8 text-center space-y-3">
            <h4 className="section-title text-anbit-text text-sm lg:text-base">{t('becomeMerchant')}</h4>
            <p className="text-anbit-muted text-[10px] lg:text-xs font-medium">{t('joinEcosystem')}</p>
            <a
              href={MERCHANT_APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-anbit-text font-semibold text-[8px] lg:text-[10px] tracking-wide border-b border-anbit-yellow pb-0.5 hover:text-anbit-yellow transition-colors"
            >
              {t('applyNow')}
            </a>
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        <div className="xl:col-span-8 space-y-8 lg:space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 dashboard-card p-6 lg:p-10 flex flex-col justify-center items-center min-h-[280px] text-center">
              <p className="text-anbit-muted text-sm lg:text-base mb-4">{t('warriorNetwork')}</p>
              <h2 className="section-title-lg text-anbit-text leading-tight mb-2">{t('masterLegacy')}</h2>
              <p className="text-anbit-muted text-xs lg:text-sm max-w-[260px] mb-6">Συνδέσου για να δεις την πρόοδό σου και τα rewards σου.</p>
              <button onClick={openLogin} className="py-3 px-6 bg-anbit-yellow text-anbit-yellow-content rounded-xl font-bold text-sm hover:opacity-90">Σύνδεση</button>
            </div>
            <div className="lg:col-span-5 dashboard-card p-6 lg:p-10 flex flex-col justify-between min-h-[280px]">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-anbit-yellow rounded-full animate-pulse" />
                  <span className="section-title text-anbit-muted text-[10px] lg:text-xs">{t('warriorNetwork')}</span>
                </div>
                <h2 className="section-title-lg text-anbit-text leading-tight">{t('masterLegacy')}</h2>
                <p className="text-anbit-muted text-xs lg:text-sm font-medium leading-relaxed max-w-[200px]">Συνδέσου για να ξεκλειδώσεις το κέντρο επιβράβευσης.</p>
              </div>
              <button onClick={openRegister} className="w-full bg-[#e63533] border border-[#e63533] text-white py-3 lg:py-4 rounded-xl font-semibold text-xs lg:text-sm hover:bg-[#cf2f2d] hover:border-[#cf2f2d] transition-all">Εγγραφή</button>
            </div>
          </div>
          <RewardSection rewards={dashboardFeed.rewards} onViewAll={openRegister} />
          <section className="space-y-4">
            <h2 className="section-title text-anbit-text text-lg lg:text-xl">{t('dealsOfTheDay')}</h2>
            <OfferCarousel offers={GREEK_OFFERS} />
          </section>
        </div>
        <div className="xl:col-span-4 space-y-6 lg:space-y-8">
          <div className="w-full overflow-hidden rounded-2xl">
            <FrostedHoverNav />
          </div>
          <div className="dashboard-card overflow-hidden"><Leaderboard entries={dashboardFeed.leaderboard} /></div>
          <div className="bg-anbit-bg border border-anbit-border rounded-3xl p-6 lg:p-8 text-center space-y-3">
            <h4 className="section-title text-anbit-text text-sm lg:text-base">{t('becomeMerchant')}</h4>
            <p className="text-anbit-muted text-[10px] lg:text-xs font-medium">{t('joinEcosystem')}</p>
            <a
              href={MERCHANT_APPLY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-anbit-text font-semibold text-[8px] lg:text-[10px] tracking-wide border-b border-anbit-yellow pb-0.5 hover:text-anbit-yellow transition-colors"
            >
              {t('applyNow')}
            </a>
          </div>
        </div>
      </div>
    </>
  );

  const isStoreOrderLink =
    location.pathname.startsWith('/store/') || location.pathname === '/scan';
  const isStoreProfileRoute = location.pathname.startsWith('/store-profile/');
  const hideChrome = isStoreOrderLink || isLoginRoute;

  if (!splashDone) {
    return <AnbitSplashScreen onComplete={() => setSplashDone(true)} />;
  }

  const showAuthOverlay = !isLoaded || isAuthLoading;

  return (
    <div className="min-h-screen bg-anbit-bg text-anbit-text font-sans antialiased overflow-x-hidden relative">
      <motion.div
        key="app-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: showAuthOverlay ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        className={`flex flex-col min-h-screen ${showAuthOverlay ? 'pointer-events-none' : ''}`}
        aria-hidden={showAuthOverlay}
      >
            {authMessage && !isLoginRoute && (
              <div className="sticky top-0 z-[50] flex items-center justify-between gap-4 bg-amber-500/20 border-b border-amber-500/40 px-4 py-3 text-sm">
                <p className="text-amber-200 flex-1">{authMessage}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={openLogin} className="px-3 py-1.5 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 transition-colors">
                    Σύνδεση
                  </button>
                  <button type="button" onClick={() => setAuthMessage(null)} className="p-1.5 text-amber-200 hover:text-white rounded transition-colors" aria-label="Κλείσιμο">
                    ×
                  </button>
                </div>
              </div>
            )}
            {!hideChrome && (
              <Header
                isAuthenticated={!!userData}
                onOpenQR={userData ? () => setIsQRModalOpen(true) : undefined}
                totalXP={userData?.totalXP ?? 0}
                onOpenLogin={!userData ? openLoginPage : undefined}
                onOpenRegister={!userData ? openRegister : undefined}
              />
            )}
            <main className={hideChrome
              ? 'flex-1 min-h-screen w-full p-0'
              : isStoreProfileRoute
                ? 'flex-1 min-h-screen w-full p-0'
                : 'flex-1 w-full max-w-[1600px] mx-auto pt-28 lg:pt-32 px-4 lg:px-8 pb-4 lg:pb-8'}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<CustomerLoginPage />} />
                <Route path="/dashboard" element={dashboardContent} />
                <Route path="/scanner" element={<ShopScannerPage partners={dashboardFeed.partners} onOpenPartnerMenu={handleOpenPartnerMenu} />} />
                <Route
                  path="/scan"
                  element={
                    <PwaHomeScreen
                      totalXP={userData?.totalXP ?? 2450}
                      isAuthenticated={!!userData}
                      onOpenLogin={() => openLoginPage('/profile')}
                    />
                  }
                />
                <Route path="/scan/:shortCode" element={<ScanPage />} />
                <Route
                  path="/store/:shortCode"
                  element={
                    userData ? (
                      <StoreFromQrPage
                        isAuthenticated={!!userData}
                        onOpenLogin={openLogin}
                        onOpenRegister={openRegister}
                        onOrderComplete={(xpEarned) => {
                          if (userData && selectedPartner) {
                            handleOrderComplete(xpEarned);
                          }
                        }}
                      />
                    ) : (
                      <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />
                    )
                  }
                />
                <Route path="/network" element={
                  storeMenuPartner ? (
                    <StoreMenuPage
                      partner={storeMenuPartner}
                      onBack={() => setStoreMenuPartner(null)}
                      isAuthenticated={!!userData}
                      onOpenLogin={openLogin}
                      onOpenRegister={openRegister}
                      onOrderComplete={(xpEarned) => {
                        if (userData && storeMenuPartner) {
                          handleOrderComplete(xpEarned);
                        }
                        setStoreMenuPartner(null);
                      }}
                    />
                  ) : (
                    <NetworkPage
                      partners={dashboardFeed.partners}
                      storeXP={userData?.storeXP ?? {}}
                      onOpenQR={userData ? () => setIsQRModalOpen(true) : openLogin}
                      onOrderComplete={userData ? handleOrderComplete : openLogin}
                      unlockedMerchantId={session?.merchantId ?? null}
                      onOpenStoreMenu={(partner) => {
                        setSelectedPartner(partner);
                        setStoreMenuPartner(partner);
                      }}
                      onOpenStoreProfile={handleOpenStoreProfile}
                    />
                  )
                } />
                <Route path="/store-profile/:partnerId" element={<StoreProfilePage />} />
                <Route path="/quests" element={<QuestsPage quests={dashboardFeed.quests} user={userData} />} />
                <Route path="/profile/*" element={userData ? <ProfilePage user={userData} partners={dashboardFeed.partners} /> : <Navigate to="/login" replace />} />
                <Route path="/settings" element={userData ? <SettingsPage user={userData} /> : <Navigate to="/dashboard" replace />} />
                <Route path="/security" element={userData ? <SecurityPage user={userData} /> : <Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
            {!hideChrome && <FooterTaped t={t} />}
            <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} mode={authModalMode} onSwitchMode={setAuthModalMode} onSuccess={authSuccessCallback ?? undefined} />
            {userData && <UserQRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} user={userData} />}
            <RedemptionActiveModal isOpen={isRedemptionModalOpen} onClose={() => setIsRedemptionModalOpen(false)} rewardName={selectedReward?.title || ''} partnerName={selectedReward?.partner || ''} />
      </motion.div>
      {showAuthOverlay ? <AnbitSplashScreen key="auth-overlay" /> : null}
    </div>
  );
};

export default App;
