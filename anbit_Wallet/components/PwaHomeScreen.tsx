import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnbitWordmark from './AnbitWordmark';

interface PwaHomeScreenProps {
  totalXP: number;
  isAuthenticated: boolean;
  onOpenLogin: () => void;
}

const CATEGORIES = [
  {
    label: 'Burgers',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDl2NOJbTCoQPOwKyiiKKg0H8axaoboBJCOgy7ln7MyOrKMHi5zixOyxrZCPrgzDOHvOCKEE791Jzf1gaYYr7p0qhYViq-piglY_GDeUbgCSHsa4zoR-06qWBU8a-c9phz2u0OZ_6lQVbCRFg4eu7ekDN7DWPFMzVv39We_DvKDMdz0hNFcq5dKBTPxKehf4g4NbWxUDKXQlnoEGXaErIIznpipvJjkxyY-N73OiwcSRUIvvCA0EyWDL95eakaQlGyTGXBNL2oJSN0',
  },
  {
    label: 'Pizzas',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDR9sgo6SAJHT4TR64lV9tDNuAWbc1izJjozpRtl-dnDT2TT0UsoOc0SAHaGjUcd_4_JanicMBzF5ta8iTs-mlpU6OcMwzkKeDsh8KNhNiVNIXbw0ZCdoOaCUqc2sGYWTKBX7foZ_0AbQ_ILlOgRAY9kM7BqpNf4oefM07lfm_3JN18HdpzUHYK-B8JHJeoKIxbfjRcqDDpuBXWUS6Rh9nFe9P2eyS4BJ7mf-91ZxSubW0U9gFP5Rq7tmth5MOfZwGk4XO8PlWwjr8',
  },
  {
    label: 'Drinks',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCsvoWIChgT_6P-f9GqB1pfUWev1iwGL-MPRByE7QUvLmzKh_8d20Ag6MyqMQImqRsCbFdSuyVCIOSSY8cQEdg7G8Qg_oMix1kwsTc_iCEOEvC5xzfie7eECjjH0WMW0c5LFEffKaGoONzkCbLzzzx3F7ZnDWvk6_O0lcElDbKMc7bjNKc3dPkPYzqqYsJCftditMZSa80vYF4exC0-tTsiHRmukjvXfPSlq5cb8d5kpBErW3qOibuGG1VhjtikgrOlE4CPyOe6Fms',
  },
  {
    label: 'Sushi',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDauSUDdyrDxhoBiTkbm0VK2XLzUakJP7E4MW-iH-c6koDqLIalrN8anSS5lgmw0u0ucSVVsNWxaSUnBxWSRj96T552Oen0UWYjkYhCOHuQZMQn-DvkZvTT67i91pb4LdqMTdpPqWJV2Qztj-HAAD8qXPCtIctChwW8F6-ZICrrJn-yXHFS6xQk5rDWCA25rayaXNiRf6PjStomS6WHgAxv7tLKKpohniXUxyoxJQTbE3D9wn39dGX4L2esQSv_3PniWhwFeatkJN0',
  },
];

const PRODUCTS = [
  {
    name: 'Wagyu Gold Burger',
    description: 'Wagyu, truffle aioli, gold leaf.',
    price: '€18.50',
    xp: '+45 XP',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCVz2nGf4GSquuScq3G_PwaqT1qNdK-JtpNsr3AgEbBwoHc6y9usmpGeRCfGWBFEqIqh9Ti9Dq6HqsgOB8zd64B9bxoKgTn8cu8hx23cXB0bnm_5zpY9Rm5CsK492xTJZDMpKi7Pt0_uE4dLDemT5KMAHR0AmbP80o2ZjpEs0g-DYHa6wO974CKOOUPyzxboo_SBfB33L7n0imRhsPR0dtOP406IcuCRDxqqawnlB1o6fEQk0XXRYcJv4_GIlgvt2vnswQRW6BKOeY',
  },
  {
    name: 'Truffle Napoli',
    description: 'Buffalo, fresh truffle, basil.',
    price: '€14.20',
    xp: '+25 XP',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtyAdtqaYntgkmc6BuF--CUaQRf0YJ0WU9gdC4zoddXsUanbpCq5XyRyt_DPIH6DL0z8t1GdOR_7VMNe8WQ_yQUyw4zrQrqQ3iho03t0fRI2V2Z9W4c60E1srmJU0JLKfCtiDDcOw9XCwTVAk__hDuN2K1WzkkXB3XSZsV4Q6Ytbzj0HvuhmXsN6wz8Oo0hSF_MyZnJlUyx5-wuAjpmdkTRhfAfRyDSIrIAs-K7q9c-f53yQ9cu1mOLx26XBfpDGW3XdubqVf6bbQ',
  },
  {
    name: 'Passion Mojito',
    description: 'Fresh passion fruit, lime.',
    price: '€7.50',
    xp: '+15 XP',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDzYWLhsHBvpgdudx2vu0EGopKGdTUFiBBhsrRBeFMBQ_rKizQFkxJuL-WH7Soxl2NYkT354-SlLXIbgaJ7noAm1914FGX1DnzHONFXozGxcUi8_b6pPBn7yxYCIu8oqDTAWVTAFjUGjTuf1xUv8PI-fcpjTi7HwYFlAQNBsbCcrJbKcg9jhz32JGDy8t4IHRolyVXZLQEtmHcfVBu9if5PtPWDv1SJbXoJkVXJG6PT7Geo5xgZWfyudZIoNjojzV31igEsAW3sGmw',
  },
  {
    name: 'Lava Sphere',
    description: 'Dark chocolate, raspberry.',
    price: '€9.00',
    xp: '+30 XP',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXGIeXW2deAhtzQ-8rMRcIR61TkAV_N__TYNZzhjpmMYBqL9mYbnko0JXr5l54rPb_iWa6v3W5S48-HyclIttFxqyNZBpBoJl1M0GnvL_FSkAUqRrpNMpjlPi4LNmjGvc4HGGN_0v2L_b1lRVoNLjuWX3ENEsytcU3v6Qe9yc-7pAPcrwxlojnbGC5ownycnA3dvMUFFz8JA0pXbvezoe6EQTm8W1QvW_jVym2_YQNeO5nll3v4FidoYkcYjY9nhrmRCFtvjdXoj4',
  },
];

const PwaHomeScreen: React.FC<PwaHomeScreenProps> = ({
  totalXP,
  isAuthenticated,
  onOpenLogin,
}) => {
  const navigate = useNavigate();
  const xpLabel = `${(totalXP || 2450).toLocaleString()} XP`;

  return (
    <div className="min-h-screen bg-black text-white font-['Plus_Jakarta_Sans'] italic font-extrabold">
      <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/80 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button type="button" className="text-[#0a0a0a] active:scale-95">
            <span className="material-symbols-outlined not-italic">menu</span>
          </button>
          <AnbitWordmark as="h1" className="text-xl text-white" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">
            <span className="material-symbols-outlined text-sm text-yellow-500 not-italic">
              stars
            </span>
            <span className="text-[10px] tracking-wider uppercase">{xpLabel}</span>
          </div>
          <button type="button" className="text-white/70 active:scale-95">
            <span className="material-symbols-outlined not-italic">notifications</span>
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 pb-32 pt-20">
        <section className="mb-6">
          <div className="relative">
            <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 not-italic">
              search
            </span>
            <input
              type="text"
              placeholder="Αναζήτηση & Φιλτράρισμα"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 py-3 pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]"
            />
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 not-italic">
              tune
            </span>
          </div>
        </section>

        <section className="relative mb-8 overflow-hidden rounded-2xl bg-[#0a0a0a] p-6">
          <h4 className="mb-1 text-xl uppercase tracking-tighter">XP Multiplier Active!</h4>
          <p className="mb-4 max-w-[70%] text-sm leading-snug text-white/90">
            Κερδίστε x2 XP σε κάθε παραγγελία για τις επόμενες 2 ώρες.
          </p>
          <button type="button" className="rounded-md bg-white px-4 py-2 text-[10px] uppercase tracking-widest text-black">
            Περισσότερα
          </button>
          <span className="material-symbols-outlined absolute -bottom-4 -right-4 rotate-12 text-[100px] text-white/10 not-italic">
            rocket_launch
          </span>
        </section>

        <section className="mb-8 overflow-hidden">
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.label} className="group flex-none cursor-pointer">
                <div className="relative mb-2 h-24 w-24 overflow-hidden rounded-xl border border-zinc-800 transition-all group-hover:border-[#0a0a0a]">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <p className="text-center text-[10px] uppercase tracking-tight text-zinc-400 transition-colors group-hover:text-white">
                  {cat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          {PRODUCTS.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 transition-all hover:bg-zinc-900/50"
            >
              <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute left-2 top-2 rounded border border-white/10 bg-black/60 px-2 py-0.5 backdrop-blur-sm">
                  <span className="text-[9px] uppercase tracking-widest text-yellow-500">{p.xp}</span>
                </div>
              </div>
              <h3 className="mb-0.5 line-clamp-1 text-sm">{p.name}</h3>
              <p className="mb-3 line-clamp-1 text-[11px] text-zinc-500">{p.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">{p.price}</span>
                <button type="button" className="rounded-md bg-white px-3 py-1.5 text-[10px] tracking-widest text-black">
                  ADD
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-white/5 bg-black/90 px-4 pb-8 pt-4 backdrop-blur-lg">
        <button type="button" onClick={() => navigate('/dashboard')} className="flex flex-col items-center text-[#0a0a0a]">
          <span className="material-symbols-outlined not-italic">restaurant_menu</span>
          <span className="mt-1 text-[9px] uppercase tracking-wider">Menu</span>
        </button>
        <button type="button" onClick={() => navigate('/network')} className="flex flex-col items-center text-zinc-500 hover:text-white">
          <span className="material-symbols-outlined not-italic">account_balance_wallet</span>
          <span className="mt-1 text-[9px] uppercase tracking-wider">XP Wallet</span>
        </button>
        <button
          type="button"
          onClick={() => (isAuthenticated ? navigate('/profile') : onOpenLogin())}
          className="flex flex-col items-center text-zinc-500 hover:text-white"
        >
          <span className="material-symbols-outlined not-italic">person</span>
          <span className="mt-1 text-[9px] uppercase tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default PwaHomeScreen;
