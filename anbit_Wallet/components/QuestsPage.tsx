
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, X } from 'lucide-react';
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

const CLAIMED_QUEST_IDS_KEY = 'anbit_claimed_quest_ids';

function readClaimedQuestIds(): Set<string> {
  try {
    const raw = localStorage.getItem(CLAIMED_QUEST_IDS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

function persistClaimedQuestId(id: string) {
  const next = readClaimedQuestIds();
  next.add(id);
  localStorage.setItem(CLAIMED_QUEST_IDS_KEY, JSON.stringify([...next]));
}

function QuestOfferRulesModal({
  quest,
  partner,
  isOpen,
  onClose,
  t,
}: {
  quest: Quest;
  partner?: Partner;
  isOpen: boolean;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const { theme } = useTheme();
  const daysNum = quest.expiresIn.replace(/\D/g, '') || '0';
  const storeName = partner?.name ?? quest.storeName ?? t('partnerStore');

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key={`rules-${quest.id}`}
          role="presentation"
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/75 p-0 font-sans backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quest-rules-modal-title"
            className={cn(
              'relative flex max-h-[min(92dvh,820px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] shadow-2xl sm:max-h-[min(88dvh,720px)] sm:rounded-2xl',
            )}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 28 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[color:var(--anbit-border)] px-4 pb-3 pt-4 sm:px-5">
              <div className="min-w-0 pr-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-anbit-muted">{t('viewRules')}</p>
                <h2
                  id="quest-rules-modal-title"
                  className="playpen-sans mt-0.5 text-lg font-bold leading-tight text-[color:var(--anbit-text)] sm:text-xl"
                >
                  {quest.title}
                </h2>
                <p className="mt-1 text-xs text-anbit-muted">{storeName}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] text-[color:var(--anbit-text)] transition-colors hover:bg-[color:var(--anbit-border)]/40"
                aria-label={t('close')}
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
              <p className="text-sm font-semibold text-anbit-brand">
                {t('offerDetailRewardLine').replace('{xp}', String(quest.reward))}
              </p>
              <p className="mt-1 text-xs text-anbit-muted">
                {t('offerDetailProgress')
                  .replace('{current}', String(quest.progress))
                  .replace('{total}', String(quest.total))}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[color:var(--anbit-text)]">{quest.description}</p>
              <p className="mt-3 text-sm text-anbit-muted">
                {t('expiresInDays')} {daysNum} {t('daysLeft')}. {t('offerDetailExpiryNote')}
              </p>
              <div
                className={cn(
                  'mt-5 space-y-2.5 border-l-2 pl-3 text-sm leading-relaxed',
                  theme === 'light' ? 'border-zinc-300 text-neutral-700' : 'border-[color:var(--anbit-border)] text-[color:var(--anbit-muted)]',
                )}
              >
                <p>{t('offerDetailStep1')}</p>
                <p>{t('offerDetailStep2')}</p>
                <p>{t('offerDetailStep3')}</p>
                <p>{t('offerDetailStep4')}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [offerClaimed, setOfferClaimed] = useState(() => readClaimedQuestIds().has(quest.id));

  useEffect(() => {
    setOfferClaimed(readClaimedQuestIds().has(quest.id));
  }, [quest.id]);

  const partnerName = partner?.name ?? quest.storeName ?? 'Partner Store';
  const partnerImage = partner?.image || quest.storeImage || DEAL_CARD_IMAGE_FALLBACK;
  const offerImage = quest.bannerImage || quest.storeImage || partner?.image || DEAL_CARD_IMAGE_FALLBACK;
  const pricing = buildPricingFromReward(quest.reward);
  const isXpHeavy = quest.reward >= 120;
  const brandColor = 'var(--anbit-brand)';
  const lightAccentText = 'var(--anbit-brand)';
  /** Μαλακή μετάβαση φωτό → κάρτα (χωρίς SVG path) ώστε να μην εμφανίζεται ραχοειδής γραμμή στο hover/scale. */
  const offerImageFadeStyle = {
    background: `linear-gradient(
      to top,
      var(--anbit-card) 0%,
      var(--anbit-card) 18%,
      color-mix(in srgb, var(--anbit-card) 82%, transparent) 40%,
      color-mix(in srgb, var(--anbit-card) 35%, transparent) 58%,
      transparent 100%
    )`,
  } as const;

  return (
    <>
    <motion.article
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={cn(
        'shrink-0 overflow-hidden rounded-2xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] p-3 shadow-sm transition-shadow',
        theme === 'light' && 'hover:border-[color:var(--anbit-border)] hover:shadow-md',
        theme === 'dark' && 'hover:border-anbit-brand/25',
        cardWidthClassName,
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (!partner) return;
          navigate(`/store-profile/${partner.id}`, { state: { partner } });
        }}
        className="relative isolate block w-full overflow-hidden rounded-t-xl bg-[color:var(--anbit-card)] text-left"
        disabled={!partner}
      >
        <div className="relative overflow-hidden rounded-t-xl">
          <img
            src={offerImage}
            alt={quest.title}
            className="block h-40 w-full object-cover"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[104px]"
            style={offerImageFadeStyle}
          />
        </div>
        <img
          src={partnerImage}
          alt=""
          className={cn(
            'pointer-events-none absolute bottom-4 left-1/2 z-[2] h-20 w-20 -translate-x-1/2 rounded-3xl bg-white object-cover shadow-lg',
            theme === 'light' ? 'ring-2 ring-black/[0.08]' : 'ring-2 ring-white/25',
          )}
          style={{ border: `1px solid ${brandColor}` }}
        />
        <span
          className="absolute left-2 top-2 z-[3] rounded-md bg-anbit-brand px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-anbit-brand-foreground"
        >
          {isXpHeavy ? '+XP' : 'XP'}
        </span>
      </button>

      <p className="playpen-sans mt-2 line-clamp-2 px-2 text-center text-[15px] font-extrabold leading-tight tracking-tight text-[color:var(--anbit-text)] sm:text-base">
        {partnerName}
      </p>

      <div className="mt-2 space-y-2">
        <h4 className={cn('line-clamp-2 text-sm font-bold leading-snug text-[color:var(--anbit-text)]')}>
          {quest.title}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold" style={{ color: lightAccentText }}>€{pricing.discounted.toFixed(2)}</span>
          <span className="text-xs line-through text-anbit-muted">
            €{pricing.old.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-anbit-brand">
          <Star className="h-3.5 w-3.5 fill-anbit-brand text-anbit-brand" strokeWidth={0} />
          +{quest.reward} XP
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            disabled={offerClaimed}
            onClick={() => {
              if (offerClaimed) return;
              persistClaimedQuestId(quest.id);
              setOfferClaimed(true);
            }}
            className={cn(
              'flex-1 rounded-lg py-2.5 text-sm font-semibold shadow-md transition-colors',
              offerClaimed
                ? 'cursor-default border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] text-anbit-muted'
                : 'bg-anbit-brand text-anbit-brand-foreground hover:bg-anbit-brand-hover',
            )}
          >
            {offerClaimed ? t('claimOfferClaimed') : t('claimOffer')}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setRulesOpen(true);
            }}
            className="rounded-lg border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] px-4 py-2.5 text-sm font-medium text-[color:var(--anbit-text)] transition-colors hover:bg-[color:var(--anbit-border)]/30"
          >
            {t('viewRules')}
          </button>
        </div>
      </div>
    </motion.article>
    <QuestOfferRulesModal quest={quest} partner={partner} isOpen={rulesOpen} onClose={() => setRulesOpen(false)} t={t} />
    </>
  );
}

function CarouselSection({
  title,
  offers,
  partners,
  onViewAll,
  t,
}: {
  title: string;
  offers: Quest[];
  partners: Partner[];
  onViewAll: () => void;
  t: (key: string) => string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const navClass =
    'border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)]/95 text-[color:var(--anbit-text)] shadow-sm backdrop-blur-sm hover:bg-[color:var(--anbit-card)]';

  const displayOffers = useMemo(() => offers.slice(0, 8), [offers]);
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
        <h3 className="text-lg font-bold text-[color:var(--anbit-text)]">{title}</h3>
        {offers.length > 8 ? (
          <button
            type="button"
            onClick={onViewAll}
            className="rounded-lg border border-[color:var(--anbit-brand)]/35 bg-transparent px-3 py-1.5 text-xs font-semibold text-anbit-brand transition-colors hover:bg-anbit-brand/10"
          >
            {t('viewAll')}
          </button>
        ) : null}
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
  const { t } = useLanguage();
  const [offerModal, setOfferModal] = useState<{ title: string; offers: Quest[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [discoverTab, setDiscoverTab] = useState<'popular' | 'favorites'>('popular');
  const [favoriteMerchantIds, setFavoriteMerchantIds] = useState(() => loadFavoriteMerchantIds());

  React.useEffect(() => {
    return subscribeFavoriteMerchantsChanged(() => {
      setFavoriteMerchantIds(loadFavoriteMerchantIds());
    });
  }, []);

  useEffect(() => {
    if (!offerModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOfferModal(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [offerModal]);

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
      className="space-y-8 bg-transparent px-4 pb-10 pt-0 md:space-y-10 md:px-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif' }}
    >
      <section className="space-y-1">
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2 className="playpen-sans text-[26px] font-bold leading-tight tracking-tight text-[color:var(--anbit-text)] sm:text-[30px]">
              {t('quests')}
            </h2>
            <p className="text-sm text-anbit-muted">{t('storeOffersSubtitle')}</p>
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
        <CarouselSection
          title="Top XP Boosters"
          offers={topXpBoosters}
          partners={partners}
          t={t}
          onViewAll={() => setOfferModal({ title: 'Top XP Boosters', offers: topXpBoosters })}
        />
        <CarouselSection
          title="Flash Deals (Expiring Soon)"
          offers={flashDeals}
          partners={partners}
          t={t}
          onViewAll={() => setOfferModal({ title: 'Flash Deals (Expiring Soon)', offers: flashDeals })}
        />
        <CarouselSection
          title="Exclusive for You"
          offers={exclusiveForYou}
          partners={partners}
          t={t}
          onViewAll={() => setOfferModal({ title: 'Exclusive for You', offers: exclusiveForYou })}
        />
      </div>

      <AnimatePresence>
        {offerModal ? (
          <motion.div
            key={offerModal.title}
            role="presentation"
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 font-sans backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOfferModal(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="quests-offers-modal-title"
              className={cn(
                'relative flex w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] shadow-2xl',
                'max-h-[min(92dvh,840px)] sm:max-h-[min(88dvh,780px)] sm:rounded-2xl',
              )}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[color:var(--anbit-border)] px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
                <div className="min-w-0 pr-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-anbit-muted">{t('allOffers')}</p>
                  <h2
                    id="quests-offers-modal-title"
                    className="playpen-sans mt-0.5 text-xl font-bold leading-tight text-[color:var(--anbit-text)] sm:text-2xl"
                  >
                    {offerModal.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOfferModal(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] text-[color:var(--anbit-text)] transition-colors hover:bg-[color:var(--anbit-border)]/40"
                  aria-label={t('close')}
                >
                  <X className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
                {offerModal.offers.length === 0 ? (
                  <p className="py-8 text-center text-sm text-anbit-muted">{t('questsFilterEmpty')}</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {offerModal.offers.map((quest) => (
                      <BrandedOfferCard
                        key={quest.id}
                        quest={quest}
                        partner={resolveQuestPartner(quest, partners)}
                        cardWidthClassName="w-full min-w-0"
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};


export default QuestsPage;
