
import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Quest, Partner } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { cn } from '@/lib/utils';
import { DiscoverButton } from './ui/discover-button';
import { loadFavoriteMerchantIds, subscribeFavoriteMerchantsChanged } from '@/lib/favoriteStores';
const DEAL_CARD_IMAGE_FALLBACK =
  'https://images.unsplash.com/photo-1544025162-766942260318?auto=format&fit=crop&q=80&w=1200&h=900';

function resolveQuestPartner(quest: Quest, partners: Partner[]): Partner | undefined {
  if (quest.partnerId) return partners.find((p) => p.id === quest.partnerId);
  if (quest.storeName) return partners.find((p) => p.name === quest.storeName);
  return undefined;
}

function getExpiresInDays(expiresIn: string): number {
  const days = parseInt(String(expiresIn).replace(/\D/g, ''), 10);
  return Number.isNaN(days) ? 999 : days;
}

function buildPricingFromReward(rewardXP: number): { discounted: number; old: number } {
  const discounted = Math.max(2.99, Number((rewardXP / 55 + 4.5).toFixed(2)));
  const old = Number((discounted * 1.28).toFixed(2));
  return { discounted, old };
}

function BrandedOfferCard({
  quest,
  partner,
  cardWidthClassName,
}: {
  quest: Quest;
  partner?: Partner;
  cardWidthClassName: string;
}) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const partnerName = partner?.name ?? quest.storeName ?? 'Partner Store';
  const partnerImage = partner?.image || quest.storeImage || DEAL_CARD_IMAGE_FALLBACK;
  const offerImage = quest.bannerImage || quest.storeImage || partner?.image || DEAL_CARD_IMAGE_FALLBACK;
  const pricing = buildPricingFromReward(quest.reward);
  const isXpHeavy = quest.reward >= 120;
  const lightAccentBg = theme === 'light' ? '#0a0a0a' : '#009DE0';
  const lightAccentHoverBg = theme === 'light' ? '#171717' : '#007BB5';
  const lightAccentText = theme === 'light' ? '#0a0a0a' : '#009DE0';

  return (
    <motion.article
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={cn(
        'shrink-0 rounded-2xl border border-white/10 bg-[#141414] p-3 shadow-[0_12px_24px_rgba(0,0,0,0.24)]',
        theme === 'light' &&
          'border-zinc-200/90 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-zinc-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]',
        cardWidthClassName,
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (!partner) return;
          navigate(`/store-profile/${partner.id}`, { state: { partner } });
        }}
        className="relative block w-full overflow-hidden rounded-xl text-left"
        disabled={!partner}
      >
        <img src={offerImage} alt={quest.title} className="h-40 w-full rounded-xl object-cover" />
        <div className="absolute inset-x-0 top-2 z-10 flex flex-col items-center justify-center gap-1 text-center">
          <img
            src={partnerImage}
            alt={partnerName}
            className="h-10 w-10 rounded-full bg-white object-cover shadow-md"
            style={{ border: `1px solid ${lightAccentBg}` }}
          />
          <p className="max-w-[90%] truncate rounded-full bg-black/45 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] backdrop-blur-sm">
            {partnerName}
          </p>
        </div>
        <span
          className="absolute left-2 top-2 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
          style={{ background: lightAccentBg }}
        >
          {isXpHeavy ? '+XP' : 'Deal'}
        </span>
      </button>

      <div className="mt-3 space-y-2">
        <h4 className={cn('line-clamp-2 text-sm font-bold leading-snug', theme === 'light' ? 'text-zinc-900' : 'text-white')}>
          {quest.title}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold" style={{ color: lightAccentText }}>€{pricing.discounted.toFixed(2)}</span>
          <span className={cn('text-xs line-through', theme === 'light' ? 'text-zinc-500' : 'text-white/45')}>
            €{pricing.old.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: lightAccentText }}>
          <Star className="h-3.5 w-3.5" style={{ fill: lightAccentText, color: lightAccentText }} strokeWidth={0} />
          +{quest.reward} XP
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors"
            style={{
              background: lightAccentBg,
              boxShadow: theme === 'light'
                ? '0 8px 18px rgba(10,10,10,0.24)'
                : '0 8px 18px rgba(0,157,224,0.28)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = lightAccentHoverBg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = lightAccentBg;
            }}
          >
            Claim Offer
          </button>
          <button
            type="button"
            className={cn(
              'rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors',
              theme === 'light'
                ? 'border-zinc-300 bg-zinc-50 text-neutral-900 hover:bg-zinc-100'
                : 'border-white/20 text-white hover:bg-white/10',
            )}
          >
            View Rules
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function CarouselSection({
  title,
  offers,
  partners,
}: {
  title: string;
  offers: Quest[];
  partners: Partner[];
}) {
  const { theme } = useTheme();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const navClass = theme === 'light'
    ? 'border-zinc-200 bg-white text-zinc-900 shadow-sm hover:bg-zinc-100'
    : 'border-white/15 bg-black/45 text-white hover:bg-black/65';

  const displayOffers = useMemo(
    () => (expanded ? offers : offers.slice(0, 8)),
    [expanded, offers],
  );
  const cardWidth = offers.length <= 1 ? 'w-[min(86vw,26rem)]' : 'w-[min(82vw,18rem)]';

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.8, 420);
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className={cn('text-lg font-bold', theme === 'light' ? 'text-zinc-900' : 'text-white')}>{title}</h3>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{
            borderColor: theme === 'light' ? 'rgba(10,10,10,0.25)' : 'rgba(0,157,224,0.35)',
            color: theme === 'light' ? '#0a0a0a' : '#009DE0',
            background: 'transparent',
          }}
        >
          {expanded ? 'Show Less' : 'View All'}
        </button>
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => scrollBy('left')}
          className={cn('absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border p-2', navClass)}
          aria-label={`Scroll ${title} left`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div ref={scrollRef} className="flex gap-3 overflow-x-auto px-8 pb-2 no-scrollbar scroll-smooth">
          {displayOffers.map((quest) => (
            <BrandedOfferCard
              key={quest.id}
              quest={quest}
              partner={resolveQuestPartner(quest, partners)}
              cardWidthClassName={cardWidth}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scrollBy('right')}
          className={cn('absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border p-2', navClass)}
          aria-label={`Scroll ${title} right`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

const QuestsPage: React.FC<{
  quests: Quest[];
  partners: Partner[];
}> = ({ quests, partners }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [discoverTab, setDiscoverTab] = useState<'popular' | 'favorites'>('popular');
  const [favoriteMerchantIds, setFavoriteMerchantIds] = useState(() => loadFavoriteMerchantIds());

  React.useEffect(() => {
    return subscribeFavoriteMerchantsChanged(() => {
      setFavoriteMerchantIds(loadFavoriteMerchantIds());
    });
  }, []);

  const filteredQuests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let list = [...quests];

    if (q) {
      list = list.filter((quest) => {
        const partner = resolveQuestPartner(quest, partners);
        const partnerName = (partner?.name ?? quest.storeName ?? '').toLowerCase();
        const title = (quest.title ?? '').toLowerCase();
        const description = (quest.description ?? '').toLowerCase();
        return partnerName.includes(q) || title.includes(q) || description.includes(q);
      });
    }

    if (discoverTab === 'favorites') {
      list = list.filter((quest) => {
        const partner = resolveQuestPartner(quest, partners);
        if (!partner) return false;
        return favoriteMerchantIds.has(partner.id);
      });
    }

    return list;
  }, [discoverTab, favoriteMerchantIds, partners, quests, searchQuery]);

  const sortedByXp = useMemo(() => [...filteredQuests].sort((a, b) => b.reward - a.reward), [filteredQuests]);
  const topXpBoosters = useMemo(() => sortedByXp.filter((q) => q.reward >= 80), [sortedByXp]);
  const flashDeals = useMemo(
    () => [...quests]
      .filter((q) => getExpiresInDays(q.expiresIn) <= 3)
      .sort((a, b) => getExpiresInDays(a.expiresIn) - getExpiresInDays(b.expiresIn)),
    [quests],
  );
  const exclusiveForYou = useMemo(() => {
    const used = new Set<string>([...topXpBoosters.map((q) => q.id), ...flashDeals.map((q) => q.id)]);
    return sortedByXp.filter((q) => !used.has(q.id)).slice(0, 14);
  }, [sortedByXp, topXpBoosters, flashDeals]);

  return (
    <motion.div
      className={cn(
        'space-y-8 rounded-2xl p-4 pb-10 md:space-y-10 md:p-6',
        theme === 'light'
          ? 'border border-zinc-200 bg-[#f6f7f9]'
          : 'bg-[#0a0a0a]',
      )}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <section className="space-y-1">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2
              className={cn(
                'playpen-sans text-[26px] font-bold leading-tight tracking-tight sm:text-[30px]',
                theme === 'light' ? 'text-neutral-900' : 'text-anbit-text',
              )}
            >
              Deals
            </h2>
            <p className={cn('text-sm', theme === 'light' ? 'text-zinc-600' : 'text-white/55')}>{t('quests')}</p>
          </div>
          <DiscoverButton
            compact
            className="w-full max-w-md justify-start md:w-auto md:max-w-[min(100%,30rem)] md:justify-end"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeDiscoverTab={discoverTab}
            onDiscoverTabChange={(tab) => setDiscoverTab(tab)}
            labels={{
              popular: t('discoverPopular'),
              favorites: t('discoverFavorites'),
              searchPlaceholder: t('searchPartners'),
            }}
          />
        </div>
      </section>

      <div className="space-y-8">
        <CarouselSection title="Top XP Boosters" offers={topXpBoosters} partners={partners} />
        <CarouselSection title="Flash Deals (Expiring Soon)" offers={flashDeals} partners={partners} />
        <CarouselSection title="Exclusive for You" offers={exclusiveForYou} partners={partners} />
      </div>
    </motion.div>
  );
};


export default QuestsPage;
