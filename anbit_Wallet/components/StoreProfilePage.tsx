import React, { useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Star,
  Zap,
  MapPin,
  Clock,
  Phone,
  Globe2,
  Mail,
} from 'lucide-react';
import type { Partner, Product } from '../types';
import { useDashboardData } from '../hooks/useDashboardData';
import AnimatedSocialLinks, { type Social } from './ui/social-links';

interface LocationState {
  partner?: Partner;
}

const StoreProfilePage: React.FC = () => {
  const { state } = useLocation() as { state?: LocationState };
  const { partnerId } = useParams<{ partnerId: string }>();
  const navigate = useNavigate();
  const { partners } = useDashboardData(false);

  const partner: Partner | undefined = useMemo(() => {
    if (state?.partner) return state.partner;
    if (!partnerId) return undefined;
    return partners.find((p) => p.id === partnerId);
  }, [state?.partner, partnerId, partners]);

  const menu: Product[] = useMemo(() => partner?.menu ?? [], [partner]);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/network')}
            className="inline-flex h-9 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50"
          >
            ← Πίσω στα καταστήματα
          </button>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Anbit Store Profile
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        {/* Top profile section */}
        <section className="grid gap-6 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FF5733] via-[#FF8C42] to-[#FFC300] p-[1px] shadow-lg">
            <div className="flex gap-5 rounded-[22px] bg-white/90 p-5 sm:p-6">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 shadow-sm sm:h-24 sm:w-24">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                      {partner.name}
                    </h1>
                    <p className="text-xs text-slate-500">
                      {partner.location ?? 'Premium coffee & food experience'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm">
                    <span className="text-amber-300">
                      ★ {partner.rating.toFixed(1)}
                    </span>
                    <span className="ml-1.5 text-white/70">
                      · {partner.reviewCount ?? 124} reviews
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      XP Badge
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-900">
                      <Zap className="h-4 w-4 text-[#FFD700]" />
                      Gold
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Orders served
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      2.4K
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Avg. Prep Time
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {partner.deliveryTime ?? '8–12'}'
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Socials */}
          <section className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Social
              </h2>
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Συνδέσου με το {partner.name} στα social.
            </p>
            <div className="mt-3">
              <AnimatedSocialLinks socials={socials} />
            </div>
          </section>
        </section>

        {/* Main grid */}
        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="space-y-6">
            {/* Product catalog */}
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Product Catalog
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Ο πλήρης κατάλογος του καταστήματος.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {menu.map((product) => (
                  <article
                    key={product.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                        <p className="text-sm font-semibold text-slate-900">
                          €{product.price.toFixed(2)}
                        </p>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-black"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {menu.length === 0 && (
                  <p className="col-span-full py-6 text-center text-xs text-slate-500">
                    Δεν υπάρχουν ακόμα προϊόντα για αυτό το κατάστημα.
                  </p>
                )}
              </div>
            </section>

            {/* Reviews */}
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Store Reviews
                  </h2>
                  <ul className="mt-3 space-y-3 text-sm text-slate-700">
                    <li className="rounded-2xl bg-slate-50 p-3 shadow-sm">
                      <p className="font-semibold">Anna K.</p>
                      <p className="mt-1 text-xs text-amber-500">
                        ★★★★★ · 2 days ago
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Εντυπωσιακός χώρος, άψογη εξυπηρέτηση και γρήγορο Wi‑Fi.
                      </p>
                    </li>
                    <li className="rounded-2xl bg-slate-50 p-3 shadow-sm">
                      <p className="font-semibold">Nikos P.</p>
                      <p className="mt-1 text-xs text-amber-500">
                        ★★★★☆ · 1 week ago
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Πολύ καλός καφές και ωραία pastries. Θα ξανάρθω σίγουρα.
                      </p>
                    </li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Product Reviews
                  </h2>
                  <ul className="mt-3 space-y-3 text-sm text-slate-700">
                    <li className="rounded-2xl bg-slate-50 p-3 shadow-sm">
                      <p className="font-semibold">Signature Flat White</p>
                      <p className="mt-1 text-xs text-amber-500">
                        4.9 · 320 ratings
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Βελούδινο, ισορροπημένο – από τα καλύτερα της πόλης.
                      </p>
                    </li>
                    <li className="rounded-2xl bg-slate-50 p-3 shadow-sm">
                      <p className="font-semibold">Vegan Banana Bread</p>
                      <p className="mt-1 text-xs text-amber-500">
                        4.7 · 190 ratings
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        Πλούσια γεύση, όχι πολύ γλυκό, ιδανικό με καφέ.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Right column: store info, deals, reservation */}
          <aside className="space-y-6">
            {/* Store info */}
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Store Information
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <dt className="mt-0.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </dt>
                  <dd className="flex-1 text-slate-800">
                    {partner.location ?? 'To be announced'}
                    <div className="mt-1 h-24 w-full overflow-hidden rounded-xl bg-slate-100">
                      <div className="flex h-full items-center justify-center text-[11px] text-slate-400">
                        Map preview
                      </div>
                    </div>
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="mt-0.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                  </dt>
                  <dd className="flex-1 text-slate-800">
                    08:00 – 23:00
                    <br />
                    <span className="text-xs text-emerald-600">Open now</span>
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="mt-0.5">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </dt>
                  <dd className="flex-1 text-slate-800">
                    +30 210 000 0000
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="mt-0.5">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </dt>
                  <dd className="flex-1 text-slate-800">
                    hello@
                    {partner.name.toLowerCase().replace(/\s+/g, '')}.gr
                  </dd>
                </div>
                <div className="flex items-start gap-3">
                  <dt className="mt-0.5">
                    <Globe2 className="h-4 w-4 text-slate-400" />
                  </dt>
                  <dd className="flex-1 text-slate-800">
                    www.
                    {partner.name.toLowerCase().replace(/\s+/g, '')}
                    .gr
                  </dd>
                </div>
              </dl>
            </section>

            {/* Deals of the day */}
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Deals of the Day
                </h2>
                <span className="rounded-full bg-gradient-to-r from-[#FF5733] to-[#FFC300] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                  Limited time
                </span>
              </div>
              <div className="mt-4 grid gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-md">
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
                <div className="rounded-2xl bg-gradient-to-br from-[#FF5733] to-[#FFC300] p-4 text-slate-900 shadow-md">
                  <p className="text-xs uppercase tracking-wide text-black/60">
                    Squad Offer
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    -15% on groups of 4+
                  </p>
                  <p className="mt-3 text-xs text-black/70">
                    Applies automatically at checkout.
                  </p>
                </div>
              </div>
            </section>

            {/* Reservation system */}
            <section className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Reservation
                </h2>
                <span className="rounded-full bg-gradient-to-r from-[#FF5733] to-[#FFC300] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                  Live
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Κλείσε τραπέζι στο {partner.name} σε μερικά δευτερόλεπτα.
              </p>
              <form
                className="mt-4 grid gap-3 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Reservation request sent! (demo)');
                }}
              >
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Ημερομηνία
                  </label>
                  <input
                    type="date"
                    required
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 focus:border-[#FF5733] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Ώρα
                  </label>
                  <input
                    type="time"
                    required
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 focus:border-[#FF5733] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Άτομα
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    defaultValue={2}
                    required
                    className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 focus:border-[#FF5733] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-600">
                    Σημείωση (προαιρετικό)
                  </label>
                  <textarea
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-[#FF5733] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5733]/20"
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
          </aside>
        </section>
      </main>
    </div>
  );
};

export default StoreProfilePage;

