import React, { useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Zap,
  MapPin,
  Clock,
  Phone,
  Globe2,
  Mail,
  ChevronRight,
} from 'lucide-react';
import type { Partner, Product } from '../types';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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

const StoreProfilePage: React.FC = () => {
  const { state } = useLocation() as { state?: LocationState };
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { partners } = useDashboardData(false);
  const { user } = useAuth();
  const { theme } = useTheme();
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
            onClick={() => navigate('/network')}
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-[#e63533] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#cf2f2d]"
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
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-4 sm:px-6 sm:pb-6">
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

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6 sm:pt-6">
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

        {/* Προσφορές & προνόμια */}
        <section className="mt-6">
          <h2 className="text-2xl font-extrabold tracking-tight">Προσφορές & προνόμια</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <article className="relative overflow-visible rounded-2xl bg-[#0a171a] p-6 shadow-sm transition-opacity hover:opacity-95">
              <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[color:var(--anbit-bg)]" aria-hidden />
              <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[color:var(--anbit-bg)]" aria-hidden />
              <div className="flex items-center gap-5">
                <div className="shrink-0">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#e63533" fillOpacity="0.2" />
                    <path d="M24 40C32.8366 40 40 32.8366 40 24C40 15.1634 32.8366 8 24 8C15.1634 8 8 15.1634 8 24C8 32.8366 15.1634 40 24 40Z" stroke="#e63533" strokeDasharray="2 2" strokeWidth="2" />
                    <path d="M18 18L30 30M19 30C19.5523 30 20 29.5523 20 29C20 28.4477 19.5523 28 19 28C18.4477 28 18 28.4477 18 29C18 29.5523 18.4477 30 19 30ZM29 20C29.5523 20 30 19.5523 30 19C30 18.4477 29.5523 18 29 18C28.4477 18 28 18.4477 28 19C28 19.5523 28.4477 20 29 20Z" stroke="#e63533" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold leading-tight md:text-base">
                    -50% στις 3 πρώτες σου παραγγελίες αξίας 10€ & άνω. Μέγιστη έκπτωση 7€
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[#009DE0]">
                    <span>Εμφάνιση λεπτομερειών</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </article>

            <article className="relative overflow-visible rounded-2xl bg-gradient-to-r from-[#e63533] to-[#a82422] p-6 shadow-sm transition-opacity hover:opacity-95">
              <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[color:var(--anbit-bg)]" aria-hidden />
              <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[color:var(--anbit-bg)]" aria-hidden />
              <div className="flex items-center gap-5">
                <div className="shrink-0 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-sm font-extrabold italic tracking-tight text-white">
                  Anbit<span className="ml-0.5 align-top text-xs not-italic font-bold">+</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold leading-tight text-white md:text-base">
                    Λάβετε 0 € χρέωση παράδοσης και πολλά άλλα!
                  </h3>
                  <div className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-white">
                    <span>Δοκιμάστε για 30 μέρες δωρεάν!</span>
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">▶</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
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
                    className="h-9 w-full rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] px-3 text-xs text-[color:var(--anbit-text)] focus:outline-none focus:ring-2 focus:ring-[#e63533]/30"
                    required
                  />
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                    className="h-9 w-full rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] px-3 text-xs text-[color:var(--anbit-text)] focus:outline-none focus:ring-2 focus:ring-[#e63533]/30"
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
                  className="w-full rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] px-3 py-2 text-xs text-[color:var(--anbit-text)] focus:outline-none focus:ring-2 focus:ring-[#e63533]/30"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center rounded-xl bg-[#e63533] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#cf2f2d]"
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
                              ? 'bg-[#e63533] text-white'
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
            {/* Deals of the day */}
            <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)]">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">
                  Deals of the Day
                </h2>
                <span className="rounded-full bg-[color:var(--anbit-yellow)] px-3 py-1 text-[11px] font-semibold text-[color:var(--anbit-yellow-content)] shadow-sm">
                  Limited time
                </span>
              </div>
              <div className="mt-4 grid gap-4">
                <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-md">
                  <p className="text-xs uppercase tracking-wide text-slate-300">
                    Morning Combo
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    Coffee + pastry with extra XP
                  </p>
                  <p className="mt-3 text-xs text-slate-300">
                    From €4.90 · +30 XP
                  </p>
                </div>
                <div className="rounded-2xl bg-[color:var(--anbit-yellow)] p-4 text-[color:var(--anbit-yellow-content)] shadow-md">
                  <p className="text-xs uppercase tracking-wide opacity-80">
                    Squad Offer
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    -15% on groups of 4+
                  </p>
                  <p className="mt-3 text-xs opacity-80">
                    Applies automatically at checkout.
                  </p>
                </div>
              </div>
            </section>

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
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#e63533] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#cf2f2d]"
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

