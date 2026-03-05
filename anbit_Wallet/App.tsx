
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import PartnerMenuModal from './components/PartnerMenuModal';
import StoreMenuPage from './components/StoreMenuPage';
import ActiveOperations from './components/ActiveOperations';
import RedemptionActiveModal from './components/RedemptionActiveModal';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { Partner, UserData, Reward } from './types';
import { DASHBOARD_URL } from './constants';
import { useDashboardData } from './hooks/useDashboardData';
import { FooterTaped } from './components/ui/FooterTaped';
import AnbitCafeDemoScene from './components/AnbitCafeDemoScene';
import { OfferCarousel } from './components/ui/offer-carousel';
import { GREEK_OFFERS } from './data/greekOffers';

const App: React.FC = () => {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { t } = useLanguage();
  const dashboardFeed = useDashboardData();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeOrderPartner, setActiveOrderPartner] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isPartnerMenuOpen, setIsPartnerMenuOpen] = useState(false);
  const [storeMenuPartner, setStoreMenuPartner] = useState<Partner | null>(null);
  useEffect(() => { if (user) setUserData(user); }, [user]);
  useEffect(() => { if (!isAuthLoading) setTimeout(() => setIsLoaded(true), 600); }, [isAuthLoading]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeTab]);

  const handleOpenPartnerMenu = (partner: Partner) => { setSelectedPartner(partner); setIsPartnerMenuOpen(true); };
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

  if (!isAuthenticated && !isAuthLoading) return <LoginPage />;

  const renderContent = () => {
    if (!userData) return null;
    switch (activeTab) {
      case 'Scanner': return <ShopScannerPage partners={dashboardFeed.partners} onOpenPartnerMenu={handleOpenPartnerMenu} />;
      case 'Network':
        if (storeMenuPartner) {
          return (
            <StoreMenuPage
              partner={storeMenuPartner}
              onBack={() => setStoreMenuPartner(null)}
              onOrderComplete={(xpEarned) => {
                setSelectedPartner(storeMenuPartner);
                handleOrderComplete(xpEarned);
                setStoreMenuPartner(null);
              }}
            />
          );
        }
        return (
          <NetworkPage
            partners={dashboardFeed.partners}
            storeXP={userData.storeXP}
            onOpenQR={() => setIsQRModalOpen(true)}
            onOrderComplete={handleOrderComplete}
            onOpenStoreMenu={(partner) => {
              setSelectedPartner(partner);
              setStoreMenuPartner(partner);
            }}
          />
        );
      case 'Quests': return <QuestsPage quests={dashboardFeed.quests} user={userData} />;
      case 'Profile': return <ProfilePage user={userData} partners={dashboardFeed.partners} />;
      case 'Settings': return <SettingsPage user={userData} />;
      case 'Security': return <SecurityPage user={userData} />;
      default:
        return (
          <>
            <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-6 lg:mb-8">
              <AnbitCafeDemoScene />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
            <div className="xl:col-span-8 space-y-8 lg:space-y-12">
              <AnimatePresence>{activeOrderPartner && <ActiveOperations partnerName={activeOrderPartner} />}</AnimatePresence>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7"><XPProgressCircle user={userData} /></div>
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
                   <button onClick={() => setActiveTab('Quests')} className="w-full bg-anbit-card border border-anbit-border text-anbit-text py-3 lg:py-4 rounded-xl font-semibold text-xs lg:text-sm tracking-wide hover:bg-anbit-yellow hover:text-anbit-yellow-content transition-all">
                     {t('commandCenter')}
                   </button>
                </div>
              </div>
              <RewardSection rewards={dashboardFeed.rewards} onViewAll={() => setActiveTab('Profile')} />
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
                 <a href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer" className="text-anbit-text font-semibold text-[8px] lg:text-[10px] tracking-wide border-b border-anbit-yellow pb-0.5 hover:text-anbit-yellow transition-colors">{t('applyNow')}</a>
              </div>
            </div>
          </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-anbit-bg text-anbit-text font-sans antialiased overflow-x-hidden">
      <AnimatePresence mode="wait">
        {!isLoaded || isAuthLoading ? (
          <motion.div key="loader" className="fixed inset-0 z-[100] bg-anbit-bg flex items-center justify-center" exit={{ opacity: 0 }}>
            <div className="flex flex-col items-center gap-4">
               <div className="w-10 h-10 border-4 border-anbit-yellow border-t-transparent rounded-full animate-spin" />
               <span className="font-medium text-xs tracking-wide text-anbit-yellow animate-pulse">Συγχρονισμός...</span>
            </div>
          </motion.div>
        ) : (
          <motion.div key="app-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col min-h-screen">
            {userData && <Header activeTab={activeTab} setActiveTab={setActiveTab} onOpenQR={() => setIsQRModalOpen(true)} totalXP={userData.totalXP} />}
            <main className="flex-1 w-full max-w-[1600px] mx-auto pt-20 px-4 lg:px-8 pb-4 lg:pb-8">{renderContent()}</main>
            <FooterTaped setActiveTab={setActiveTab} t={t} />
            {userData && <UserQRModal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} user={userData} />}
            <PartnerMenuModal isOpen={isPartnerMenuOpen} onClose={() => setIsPartnerMenuOpen(false)} partner={selectedPartner} onOrderComplete={handleOrderComplete} />
            <RedemptionActiveModal isOpen={isRedemptionModalOpen} onClose={() => setIsRedemptionModalOpen(false)} rewardName={selectedReward?.title || ''} partnerName={selectedReward?.partner || ''} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
