import React, { useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Zap,
  MapPin,
  Clock,
  Phone,
  Globe2,
  Mail,
} from 'lucide-react';
import type { Partner, Product } from '../types';
import { useDashboardData } from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AnimatedSocialLinks, { type Social } from './ui/social-links';
import AnbitWordmark from './AnbitWordmark';
import ImgStack from './ui/image-stack';
import { AwardBadge } from './ui/award-badge';
import StoreMysteryBox from './StoreMysteryBox';

interface LocationState {
  partner?: Partner;
}

const StoreProfilePage: React.FC = () => {
  const { state } = useLocation() as { state?: LocationState };
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { partners } = useDashboardData(false);
  const { user } = useAuth();
  const { theme } = useTheme();

  const partner: Partner | undefined = useMemo(() => {
    if (state?.partner) return state.partner;
    if (!partnerId) return undefined;
    return partners.find((p) => p.id === partnerId);
  }, [state?.partner, partnerId, partners]);

  const menu: Product[] = useMemo(() => partner?.menu ?? [], [partner]);
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
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-black"
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
      {/* Header */}
      <header className="bg-[color:var(--anbit-card)] shadow-sm border-b border-[color:var(--anbit-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/network')}
            className="inline-flex h-9 items-center rounded-full border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] px-3 text-xs font-medium text-[color:var(--anbit-muted)] shadow-sm hover:bg-[color:var(--anbit-input)]"
          >
            ← Πίσω στα καταστήματα
          </button>
          <span className="flex flex-wrap items-baseline justify-end gap-2 text-slate-400">
            <AnbitWordmark className="text-sm text-slate-500" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Store Profile</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        {/* Top profile section */}
        <section>
          <div className="relative overflow-hidden rounded-3xl border border-[color:var(--anbit-yellow)] shadow-lg">
            <div className="flex flex-col gap-4 rounded-[22px] bg-[color:var(--anbit-card)] p-4 sm:flex-row sm:gap-5 sm:p-6">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[color:var(--anbit-input)] shadow-sm sm:h-24 sm:w-24">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                      {partner.name}
                    </h1>
                    <p className="text-xs text-[color:var(--anbit-muted)]">
                      {partner.location ?? 'Premium coffee & food experience'}
                    </p>
                  </div>
                  <div className="w-fit rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm">
                    <span className="text-amber-300">
                      ★ {partner.rating.toFixed(1)}
                    </span>
                    <span className="ml-1.5 text-white/70">
                      · {partner.reviewCount ?? 124} reviews
                    </span>
                  </div>
                </div>

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
            </div>
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
                  <ImgStack images={['/menu.jpg', '/menu1.jpg']} />
                </div>
              </div>
            </section>

            {/* Reviews */}
            <section className="rounded-3xl bg-[color:var(--anbit-card)] p-5 shadow-sm border border-[color:var(--anbit-border)]">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[color:var(--anbit-muted)]">
                    Store Reviews
                  </h2>
                  <ul className="mt-3 space-y-3 text-sm">
                    <li className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm">
                      <p className="font-semibold">Anna K.</p>
                      <p className="mt-1 text-xs text-amber-500">
                        ★★★★★ · 2 days ago
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--anbit-muted)]">
                        Εντυπωσιακός χώρος, άψογη εξυπηρέτηση και γρήγορο Wi‑Fi.
                      </p>
                    </li>
                    <li className="rounded-2xl bg-[color:var(--anbit-input)] p-3 shadow-sm">
                      <p className="font-semibold">Nikos P.</p>
                      <p className="mt-1 text-xs text-amber-500">
                        ★★★★☆ · 1 week ago
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--anbit-muted)]">
                        Πολύ καλός καφές και ωραία pastries. Θα ξανάρθω σίγουρα.
                      </p>
                    </li>
                  </ul>
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

            <StoreMysteryBox initialXp={storeXPForPartner} />

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
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-black"
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

