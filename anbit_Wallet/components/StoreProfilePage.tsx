import React, { useMemo, useState, useRef } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  Zap,
  MapPin,
  Clock,
  Phone,
  Globe2,
  Mail,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import type { Partner, Product, Quest } from '../types';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { QuestOfferCard } from './QuestOfferCard';
import { offerCarouselNavButtonClass } from './ui/offer-carousel';
import { cn } from '@/lib/utils';
import AnimatedSocialLinks, { type Social } from './ui/social-links';
import ImgStack from './ui/image-stack';
import { AwardBadge } from './ui/award-badge';
import StoreMysteryBox from './StoreMysteryBox';

interface LocationState {
  partner?: Partner;
}

interface StoreReview {
  id: string;
  author: string;
  rating: number;
  timeAgo: string;
  comment: string;
}

function questBelongsToStore(quest: Quest, partner: Partner): boolean {
  if (quest.partnerId && quest.partnerId === partner.id) return true;
  const sn = quest.storeName?.trim().toLowerCase();
  const pn = partner.name?.trim().toLowerCase();
  return Boolean(sn && pn && sn === pn);
}

const StoreProfilePage: React.FC = () => {
  const { state } = useLocation() as { state?: LocationState };
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { partners, quests } = useDashboardData(!!user);
  const { theme } = useTheme();
  const offersScrollRef = useRef<HTMLDivElement | null>(null);
  const [isMenuPreviewOpen, setIsMenuPreviewOpen] = useState(false);
  const [storeReviews, setStoreReviews] = useState<StoreReview[]>([
    {
      id: 'review-1',
      author: 'Anna K.',
      rating: 5,
      timeAgo: '2 days ago',
      comment: 'Εντυπωσιακός χώρος, άψογη εξυπηρέτηση και γρήγορο Wi‑Fi.',
    },
    {
      id: 'review-2',
      author: 'Nikos P.',
      rating: 4,
      timeAgo: '1 week ago',
      comment: 'Πολύ καλός καφές και ωραία pastries. Θα ξανάρθω σίγουρα.',
    },
  ]);
  const [reviewForm, setReviewForm] = useState({
    author: '',
    rating: 5,
    comment: '',
  });
  const [reviewsPage, setReviewsPage] = useState(1);
  const partner: Partner | undefined = useMemo(() => {
    if (state?.partner) return state.partner;
    if (!partnerId) return undefined;
    return partners.find((p) => p.id === partnerId);
  }, [state?.partner, partnerId, partners]);

  const menu: Product[] = useMemo(() => partner?.menu ?? [], [partner]);

  const partnerQuests = useMemo(() => {
    if (!partner) return [];
    return quests.filter((q) => questBelongsToStore(q, partner));
  }, [quests, partner]);

  const scrollPartnerOffers = (dir: 'left' | 'right') => {
    const el = offersScrollRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.85, 360);
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };
  const REVIEWS_PER_PAGE = 4;
  const totalReviewPages = Math.max(1, Math.ceil(storeReviews.length / REVIEWS_PER_PAGE));
  const paginatedStoreReviews = useMemo(() => {
    const start = (reviewsPage - 1) * REVIEWS_PER_PAGE;
    return storeReviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [storeReviews, reviewsPage]);
  const storeXPForPartner = useMemo(() => {
    if (!partner) return 0;
    return user?.storeXP ? user.storeXP[partner.id] ?? 0 : 0;
  }, [user?.storeXP, partner]);

  if (!partner) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md rounded-3xl bg-white px-6 py-8 shadow-sm border border-slate-200 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-900">
            Το κατάστημα δεν βρέθηκε.
          </p>
          <p className="text-xs text-slate-500">
            Ίσως ο σύνδεσμος έληξε ή το κατάστημα έχει αφαιρεθεί.
          </p>
          <button
            type="button"
            onClick={() => navigate('/quests')}
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-anbit-brand px-4 py-2.5 text-xs font-semibold text-anbit-brand-foreground shadow-sm hover:bg-anbit-brand-hover"
          >
            Επιστροφή στα καταστήματα
          </button>
        </div>
      </div>
    );
  }

  const socials: Social[] = [
    {
      name: 'Instagram',
      image:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'TikTok',
      image:
        'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Google',
      image:
        'https://images.unsplash.com/photo-1592609931041-40265b692757?auto=format&fit=crop&w=200&q=80',
    },
  ];

  return (
    <div
      className="min-h-screen font-sans antialiased"
      data-theme={theme}
      style={{
        backgroundColor: 'var(--anbit-bg)',
        color: 'var(--anbit-text)',
      }}
    >
      {/* Full-width hero */}
      <section className="relative w-full overflow-hidden border-b border-[color:var(--anbit-border)]">
        <div className="relative h-[260px] w-full sm:h-[320px] lg:h-[380px]">
          <img
            src={partner.image}
            alt={partner.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/75" />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1180px] px-3 pb-4 sm:px-5 sm:pb-6">
          <div className="flex items-end justify-between gap-3">
            <div className="flex min-w-0 items-end gap-3 sm:gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/20 bg-black/30 shadow-lg backdrop-blur-sm sm:h-20 sm:w-20">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 pb-0.5">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {partner.name}
                </h1>
                <p className="mt-1 text-xs text-white/80 sm:text-sm">
                  {partner.location ?? 'Premium coffee & food experience'}
                </p>
              </div>
            </div>
            <div className="w-fit rounded-2xl bg-black/45 px-3 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
              <span className="text-amber-300">★ {partner.rating.toFixed(1)}</span>
              <span className="ml-1.5 text-white/75">· {partner.reviewCount ?? 124} reviews</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-white/85 sm:text-xs">
            <span className="text-[#009DE0]">Επιλογή τοποθεσίας</span>
            <span>•</span>
            <span>Ανοιχτό μέχρι 12:00 μ.μ.</span>
            <span>•</span>
            <span>Ελάχιστη παραγγελία {partner.minOrder ?? '6,00 €'}</span>
            <span>•</span>
            <span className="text-[#009DE0]">Λεπτομέρειες εστιατορίου</span>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1180px] px-3 pb-14 pt-4 sm:px-5 sm:pt-5">
        {/* Top profile section */}
        <section>
          <div className="rounded-3xl border border-[color:var(--anbit-yellow)] bg-[color:var(--anbit-card)] p-4 shadow-lg sm:p-6">
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:text-sm lg:grid-cols-3">
              <div className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-wide text-[color:var(--anbit-muted)]">
                  XP στο κατάστημα
                </p>
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
                  <Zap className="h-4 w-4 text-[color:var(--anbit-yellow)]" />
                  <span>{storeXPForPartner.toLocaleString()} XP</span>
                </p>
              </div>
              <div className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-wide text-[color:var(--anbit-muted)]">
                  Orders served
                </p>
                <p className="mt-1 text-sm font-semibold">
                  2.4K
                </p>
              </div>
              <div className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-wide text-[color:var(--anbit-muted)]">
                  Featured Badge
                </p>
                <div className="mt-2">
                  <AwardBadge type="product-of-the-week" place={1} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Προσφορές Anbit (quests) για αυτό το κατάστημα */}
        <section className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-extrabold tracking-tight">Προσφορές καταστήματος</h2>
            {partnerQuests.length > 0 ? (
              <Link
                to="/quests"
                className="text-sm font-semibold text-anbit-brand transition-colors hover:text-anbit-brand-hover"
              >
                Όλες οι προσφορές Anbit →
              </Link>
            ) : null}
          </div>
          {partnerQuests.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] px-4 py-8 text-center text-sm text-[color:var(--anbit-muted)]">
              Δεν υπάρχουν ενεργές προσφορές για αυτό το κατάστημα αυτή τη στιγμή.{' '}
              <Link to="/quests" className="font-semibold text-anbit-brand hover:underline">
                Δες το Anbit Quests
              </Link>
            </p>
          ) : (
            <div className="group relative mt-4 w-full min-w-0">
              <button
                type="button"
                onClick={() => scrollPartnerOffers('left')}
                className={cn(offerCarouselNavButtonClass, 'left-0')}
                aria-label="Προηγούμενες προσφορές"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div
                ref={offersScrollRef}
                className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
              >
                {partnerQuests.map((quest, index) => (
                  <div
                    key={quest.id}
                    className="w-[min(100vw-2.5rem,280px)] shrink-0 snap-start sm:w-[300px] md:w-[min(22rem,85vw)]"
                  >
                    <QuestOfferCard quest={quest} index={index} t={t} partner={partner ?? null} />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => scrollPartnerOffers('right')}
                className={cn(offerCarouselNavButtonClass, 'right-0')}
                aria-label="Επόμενες προσφορές"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </section>

        {/* Main grid */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-6">
            {/* Product catalog */}
            <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">
                    Product Catalog
                  </h2>
                  <p className="mt-1 text-xs text-[color:var(--anbit-muted)]">
                    Swipe/drag stack για τις σελίδες του μενού.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] px-2 sm:px-4">
                <div className="flex items-center justify-center">
                  <ImgStack
                    images={['/menu.jpg', '/menu1.jpg']}
                    onPreviewOpenChange={setIsMenuPreviewOpen}
                  />
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)]">
              <form
                className="mb-4 w-full rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const author = reviewForm.author.trim();
                  const comment = reviewForm.comment.trim();
                  if (!author || !comment) return;

                  const newReview: StoreReview = {
                    id: `review-${Date.now()}`,
                    author,
                    rating: reviewForm.rating,
                    timeAgo: 'Μόλις τώρα',
                    comment,
                  };
                  setStoreReviews((prev) => [newReview, ...prev]);
                  setReviewsPage(1);
                  setReviewForm({ author: '', rating: 5, comment: '' });
                }}
              >
                <p className="text-xs font-semibold text-[color:var(--anbit-muted)]">Πρόσθεσε review</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_120px]">
                  <input
                    type="text"
                    value={reviewForm.author}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="Το όνομά σου"
                    className="h-9 w-full rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] px-3 text-xs text-[color:var(--anbit-text)] focus:outline-none focus:ring-2 focus:ring-anbit-brand/30"
                    required
                  />
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                    className="h-9 w-full rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] px-3 text-xs text-[color:var(--anbit-text)] focus:outline-none focus:ring-2 focus:ring-anbit-brand/30"
                    aria-label="Βαθμολογία"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r}★</option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                  placeholder="Γράψε την εμπειρία σου..."
                  className="w-full rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] px-3 py-2 text-xs text-[color:var(--anbit-text)] focus:outline-none focus:ring-2 focus:ring-anbit-brand/30"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-xl bg-anbit-brand px-3 py-2 text-xs font-semibold text-anbit-brand-foreground transition-colors hover:bg-anbit-brand-hover"
                  >
                    Δημοσίευση
                  </button>
                </div>
              </form>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">
                    Store Reviews
                  </h2>
                  <ul className="mt-3 space-y-3 text-sm">
                    {paginatedStoreReviews.map((review) => (
                      <li key={review.id} className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm">
                        <p className="font-semibold">{review.author}</p>
                        <p className="mt-1 text-xs text-amber-500">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)} · {review.timeAgo}
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--anbit-muted)]">
                          {review.comment}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {totalReviewPages > 1 && (
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewsPage((prev) => Math.max(1, prev - 1))}
                        disabled={reviewsPage === 1}
                        className="rounded-lg border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] px-2.5 py-1 text-xs font-semibold text-[color:var(--anbit-text)] disabled:opacity-40"
                      >
                        Προηγ.
                      </button>
                      {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setReviewsPage(page)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                            page === reviewsPage
                              ? 'bg-anbit-brand text-anbit-brand-foreground'
                              : 'border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] text-[color:var(--anbit-text)]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setReviewsPage((prev) => Math.min(totalReviewPages, prev + 1))}
                        disabled={reviewsPage === totalReviewPages}
                        className="rounded-lg border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] px-2.5 py-1 text-xs font-semibold text-[color:var(--anbit-text)] disabled:opacity-40"
                      >
                        Επόμ.
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Product Reviews
                  </h2>
                  <ul className="mt-3 space-y-3 text-sm">
                    <li className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm">
                      <p className="font-semibold">Signature Flat White</p>
                      <p className="mt-1 text-xs text-amber-500">
                        4.9 · 320 ratings
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--anbit-muted)]">
                        Βελούδινο, ισορροπημένο – από τα καλύτερα της πόλης.
                      </p>
                    </li>
                    <li className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm">
                      <p className="font-semibold">Vegan Banana Bread</p>
                      <p className="mt-1 text-xs text-amber-500">
                        4.7 · 190 ratings
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--anbit-muted)]">
                        Πλούσια γεύση, όχι πολύ γλυκό, ιδανικό με καφέ.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Right column: deals, reservation, social, store info */}
          <aside className="space-y-6">
            {!isMenuPreviewOpen && <StoreMysteryBox initialXp={storeXPForPartner} />}

            {/* Reservation system */}
            <section className="rounded-3xl bg-[color:var(--anbit-card)] p-0 shadow-sm border border-[color:var(--anbit-yellow)] overflow-hidden">
              <div className="flex items-center justify-between gap-2 bg-[color:var(--anbit-yellow)] px-5 py-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-yellow-content)]">
                    Reservation
                  </h2>
                  <p className="mt-0.5 text-[11px] font-medium text-[color:var(--anbit-yellow-content)]/90">
                    Κάνε κράτηση και κέρδισε XP από το τραπέζι σου.
                  </p>
                </div>
                <span className="rounded-full bg-[color:var(--anbit-card)]/15 px-3 py-1 text-[11px] font-semibold text-[color:var(--anbit-yellow-content)] shadow-sm border border-[color:var(--anbit-yellow-content)]/30">
                  Live XP
                </span>
              </div>
              <p className="mt-3 px-5 text-xs text-[color:var(--anbit-muted)]">
                Κλείσε τραπέζι στο {partner.name} σε μερικά δευτερόλεπτα.
              </p>
              <form
                className="mt-4 grid gap-3 sm:grid-cols-2 px-5 pb-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Reservation request sent! (demo)');
                }}
              >
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[color:var(--anbit-muted)]">
                    Ημερομηνία
                  </label>
                  <input
                    type="date"
                    required
                    className="h-9 w-full rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] px-3 text-xs text-[color:var(--anbit-text)] focus:border-[color:var(--anbit-yellow)] focus:bg-[color:var(--anbit-card)] focus:outline-none focus:ring-2 focus:ring-[color:var(--anbit-yellow)]/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[color:var(--anbit-muted)]">
                    Ώρα
                  </label>
                  <input
                    type="time"
                    required
                    className="h-9 w-full rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] px-3 text-xs text-[color:var(--anbit-text)] focus:border-[color:var(--anbit-yellow)] focus:bg-[color:var(--anbit-card)] focus:outline-none focus:ring-2 focus:ring-[color:var(--anbit-yellow)]/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-[color:var(--anbit-muted)]">
                    Άτομα
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    defaultValue={2}
                    required
                    className="h-9 w-full rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] px-3 text-xs text-[color:var(--anbit-text)] focus:border-[color:var(--anbit-yellow)] focus:bg-[color:var(--anbit-card)] focus:outline-none focus:ring-2 focus:ring-[color:var(--anbit-yellow)]/20"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-[color:var(--anbit-muted)]">
                    Σημείωση (προαιρετικό)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-input)] px-3 py-2 text-xs text-[color:var(--anbit-text)] focus:border-[color:var(--anbit-yellow)] focus:bg-[color:var(--anbit-card)] focus:outline-none focus:ring-2 focus:ring-[color:var(--anbit-yellow)]/20"
                    placeholder="Αλλεργίες, ειδική περίσταση, προτιμώμενο σημείο..."
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end pt-1">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-anbit-brand px-4 py-2.5 text-xs font-semibold text-anbit-brand-foreground shadow-md transition hover:bg-anbit-brand-hover"
                  >
                    Επιβεβαίωση κράτησης
                  </button>
                </div>
              </form>
            </section>

            {/* Socials */}
            <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)]">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">
                  Social
                </h2>
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-1 text-xs text-[color:var(--anbit-muted)]">
                Συνδέσου με το {partner.name} στα social.
              </p>
              <div className="mt-3">
                <AnimatedSocialLinks socials={socials} />
              </div>
            </section>

            {/* Store info */}
            <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)]">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">
                Store Information
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <dt className="mt-0.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </dt>
                  <dd className="flex-1">
                    {partner.location ?? 'To be announced'}
                    <div className="mt-1 h-24 w-full overflow-hidden rounded-xl bg-[color:var(--anbit-input)]">
                      <div className="flex h-full items-center justify-center text-[11px] text-[color:var(--anbit-muted)]">
                        Map preview
                      </div>
                    </div>
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="mt-0.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                  </dt>
                  <dd className="flex-1">
                    08:00 – 23:00
                    <br />
                    <span className="text-xs text-emerald-500">Open now</span>
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="mt-0.5">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </dt>
                  <dd className="flex-1">
                    +30 210 000 0000
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="mt-0.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </dt>
                  <dd className="flex-1">
                    hello@
                    {partner.name.toLowerCase().replace(/\s+/g, '')}.gr
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="mt-0.5">
                    <Globe2 className="h-4 w-4 text-slate-400" />
                  </dt>
                  <dd className="flex-1">
                    www.
                    {partner.name.toLowerCase().replace(/\s+/g, '')}
                    .gr
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default StoreProfilePage;

