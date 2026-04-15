/**
 * AnbitScanMenuPage — Dark-Mode Wolt-Grade Animated In-Store PWA
 * ──────────────────────────────────────────────────────────────
 * Color palette: bg #0a0a0a, cards #141414, accent #2563eb, XP gold #F5C518
 * Animations:
 *  • Parallax hero image (scrollY → translateY + scale)
 *  • Scroll-triggered floating mini-header morphs in
 *  • layoutId sliding pill for category switching (#2563eb active)
 *  • Staggered card entrance with category-section layout
 *  • Spring-physics cart badge pop on count change
 *  • IntersectionObserver → active category tracks scroll position
 *  • Category click → smooth-scroll to corresponding section
 *  • useSpring XP counter for buttery smooth counting
 */
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useAnimationControls,
  LayoutGroup,
} from 'framer-motion';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  Zap,
  Wifi,
  Check,
  ChevronRight,
  Gift,
  Clock,
  CheckCircle2,
  Loader2,
  Sparkles,
  Trophy,
  Lock,
  MapPin,
  X,
  MoreVertical,
  Info,
  Languages,
  Globe,
  Tag,
  ChefHat,
  LogOut,
} from 'lucide-react';
import type { Quest } from '../types';
import type { Partner, UserData } from '../types';
import type { CartItemData } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────
const XP_GOLD = '#F5C518';
const ACCENT = '#2563eb';
const XP_PER_EUR = 100; // 100 XP = €1 → 1 XP = €0.01 (1 λεπτό)
const LOOT_REWARDS = [
  { emoji: '☕', title: 'Δωρεάν Καφές', subtitle: 'Ισχύει στην επόμενη επίσκεψή σου' },
  { emoji: '🍕', title: 'Pizza 1+1', subtitle: '15% έκπτωση στην επόμενη παραγγελία' },
  { emoji: '⚡', title: '2× XP Boost', subtitle: 'Στις επόμενες 3 παραγγελίες σου' },
  { emoji: '🎯', title: 'Mystery Discount', subtitle: '5–20% έκπτωση — ξεκλείδωσε το!' },
  { emoji: '🏆', title: 'VIP Status', subtitle: 'Πρόσβαση VIP για μία εβδομάδα' },
];

// ─── Product Customization ────────────────────────────────────────────────────
interface ProductChoice { id: string; label: string; priceAdd?: number }
interface ProductCustomizationOption {
  id: string; label: string; required?: boolean;
  type: 'single' | 'multi';
  choices: ProductChoice[];
}

function getProductOptions(product: { name: string; category: string; description: string }): ProductCustomizationOption[] {
  const txt = `${product.name} ${product.description} ${product.category}`.toLowerCase();
  const opts: ProductCustomizationOption[] = [];

  if (/καφ|coffee|espresso|cappuccino|latte|freddo|frappe/.test(txt)) {
    opts.push({ id: 'sugar', label: 'Ζάχαρη', required: true, type: 'single', choices: [
      { id: 'plain', label: 'Σκέτος' }, { id: 'medium', label: 'Μέτριος' },
      { id: 'sweet', label: 'Γλυκός' }, { id: 'very', label: 'Πολύγλυκος' },
    ]});
    opts.push({ id: 'milk', label: 'Γάλα', type: 'single', choices: [
      { id: 'normal', label: 'Κανονικό' }, { id: 'oat', label: 'Βρώμης +0.50€', priceAdd: 0.5 },
      { id: 'almond', label: 'Αμυγδάλου +0.50€', priceAdd: 0.5 }, { id: 'none', label: 'Χωρίς' },
    ]});
    opts.push({ id: 'size', label: 'Μέγεθος', type: 'single', choices: [
      { id: 'small', label: 'Small' }, { id: 'medium', label: 'Medium' },
      { id: 'large', label: 'Large +0.50€', priceAdd: 0.5 },
    ]});
  } else if (/burger|smash|μπέικ|bbq|chees/.test(txt)) {
    opts.push({ id: 'cooking', label: 'Ψήσιμο', required: true, type: 'single', choices: [
      { id: 'medium', label: 'Medium' }, { id: 'well', label: 'Well Done' },
    ]});
    opts.push({ id: 'extras', label: 'Extras', type: 'multi', choices: [
      { id: 'xcheese', label: 'Έξτρα τυρί +0.50€', priceAdd: 0.5 },
      { id: 'bacon', label: 'Μπέικον +1.00€', priceAdd: 1 },
      { id: 'noOnion', label: 'Χωρίς κρεμμύδι' },
      { id: 'noSauce', label: 'Χωρίς σάλτσα' },
    ]});
  } else if (/pizza|πίτσ/.test(txt)) {
    opts.push({ id: 'crust', label: 'Ζύμη', required: true, type: 'single', choices: [
      { id: 'thin', label: 'Λεπτή' }, { id: 'thick', label: 'Χοντρή' },
    ]});
    opts.push({ id: 'extras', label: 'Extras', type: 'multi', choices: [
      { id: 'xcheese', label: 'Έξτρα τυρί +0.80€', priceAdd: 0.8 },
      { id: 'pepperoni', label: 'Πεπερόνι +1.00€', priceAdd: 1 },
      { id: 'mushrooms', label: 'Μανιτάρια +0.50€', priceAdd: 0.5 },
    ]});
  } else if (/σαλάτ|salad/.test(txt)) {
    opts.push({ id: 'dressing', label: 'Dressing', type: 'single', choices: [
      { id: 'none', label: 'Χωρίς' }, { id: 'oil', label: 'Λαδόξιδο' },
      { id: 'mustard', label: 'Μουστάρδα' }, { id: 'caesar', label: 'Caesar' },
    ]});
  } else if (/panuozzo|σάντουιτς|toast|wrap/.test(txt)) {
    opts.push({ id: 'extras', label: 'Extras', type: 'multi', choices: [
      { id: 'xcheese', label: 'Έξτρα τυρί +0.50€', priceAdd: 0.5 },
      { id: 'noSauce', label: 'Χωρίς σάλτσα' },
      { id: 'noVeg', label: 'Χωρίς λαχανικά' },
    ]});
  }
  return opts;
}

// ─── Category emoji mapping ───────────────────────────────────────────────────
function getCategoryEmoji(cat: string): string {
  const s = cat.toLowerCase();
  if (/burger|μπέργκ|smash/.test(s)) return '🍔';
  if (/pizza|πίτσ/.test(s)) return '🍕';
  if (/panuozzo/.test(s)) return '🥙';
  if (/σαλάτ|salad/.test(s)) return '🥗';
  if (/souvlaki|σουβλάκ|kebab/.test(s)) return '🍢';
  if (/καφέ|coffee|espresso|cappuccino|latte|freddo/.test(s)) return '☕';
  if (/ποτ|drink|juice|χυμ/.test(s)) return '🥤';
  if (/γλυκ|dessert|παγωτ|sweet/.test(s)) return '🍰';
  if (/σνακ|snack/.test(s)) return '🧆';
  if (/pasta|μακαρ/.test(s)) return '🍝';
  if (/θαλασσ|seafood|fish|ψαρ/.test(s)) return '🦐';
  if (/κρέα|meat|μοσχ|χοιρ/.test(s)) return '🥩';
  if (/wrap|toast/.test(s)) return '🌯';
  if (/menu|μενού/.test(s)) return '🍽️';
  if (/ορεκτ|starter/.test(s)) return '🫙';
  return '🍴';
}

// ─── Animation variants ───────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.96 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};
const springConfig = { stiffness: 380, damping: 28, mass: 0.8 };

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useXPSpringCounter(target: number): number {
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 60, damping: 18, mass: 1.2 });
  const [display, setDisplay] = useState(0);

  useEffect(() => { raw.set(target); }, [target, raw]);

  useEffect(() => {
    const unsub = spring.on('change', (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return display;
}

// ─── NFCBadge ─────────────────────────────────────────────────────────────────
function NFCBadge({ entryMethod }: { entryMethod: 'nfc' | 'qr' }) {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0, y: -8 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: 0.55, type: 'spring', stiffness: 300, damping: 20 }}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/35 px-3 py-1.5 backdrop-blur-md"
    >
      <motion.div
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Wifi className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
      </motion.div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-white">
        {entryMethod === 'nfc' ? 'NFC Verified' : 'QR Verified'}
      </span>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.85, type: 'spring', stiffness: 400 }}
      >
        <Check className="h-3 w-3 text-emerald-400" strokeWidth={3} />
      </motion.div>
    </motion.div>
  );
}

// ─── XP Dashboard ─────────────────────────────────────────────────────────────
function XPDashboard({
  partner,
  user,
  storeXpBalance,
}: {
  partner: Partner;
  user: UserData | null;
  storeXpBalance: number;
}) {
  const displayXp = useXPSpringCounter(storeXpBalance);
  const level = user?.currentLevel ?? 1;
  const levelName = user?.currentLevelName ?? 'Starter';
  const progress = Math.min(user?.levelProgress ?? 0, 1);
  const nextXP = user?.nextLevelXP ?? 1000;

  return (
    <motion.div
      initial={{ y: 32, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: 0.18, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative mx-4 -mt-14 z-10 rounded-[1.75rem] bg-[#111] px-5 py-5 shadow-[0_24px_64px_-8px_rgba(0,0,0,0.85)]"
    >
      {/* Blue shimmer top edge */}
      <motion.div
        className="pointer-events-none absolute inset-x-8 top-0 h-px rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${ACCENT}80, transparent)` }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/38">
            Υπόλοιπό σου στο
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-white/55">{partner.name}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <motion.span
              className="font-black leading-none tabular-nums tracking-tight"
              style={{ color: XP_GOLD, fontSize: '3rem', textShadow: `0 0 32px ${XP_GOLD}70, 0 0 8px ${XP_GOLD}40` }}
              key={storeXpBalance}
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 0.45 }}
            >
              {displayXp.toLocaleString('el-GR')}
            </motion.span>
            <motion.span
              className="text-xl font-black"
              style={{ color: XP_GOLD, opacity: 0.7 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >XP</motion.span>
          </div>
        </div>

        <motion.div
          className="flex shrink-0 flex-col items-end gap-1.5 pt-1"
          initial={{ x: 12, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="rounded-xl px-3 py-1.5" style={{ background: `${ACCENT}22`, border: `1px solid ${ACCENT}44` }}>
            <span className="text-sm font-black" style={{ color: ACCENT }}>LV {level}</span>
          </div>
          <span className="text-[10px] font-medium text-white/30">{levelName}</span>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-[10px] font-medium text-white/30">
          <span>Πρόοδος επιπέδου</span>
          <span>{nextXP.toLocaleString('el-GR')} XP</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${ACCENT}80, ${ACCENT})` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1.4, delay: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
      </div>

      {/* Ambient pulse glow — gold + blue */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[1.75rem]"
        animate={{
          boxShadow: [
            `0 0 0px 0px ${XP_GOLD}00, 0 0 0px 0px ${ACCENT}00`,
            `0 0 40px 10px ${XP_GOLD}18, 0 0 28px 6px ${ACCENT}14`,
            `0 0 0px 0px ${XP_GOLD}00, 0 0 0px 0px ${ACCENT}00`,
          ],
        }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />
    </motion.div>
  );
}

// ─── Mode Toggle ──────────────────────────────────────────────────────────────
type AppMode = 'eur' | 'xp' | 'shop';

const MODE_TABS: { id: AppMode; label: string; icon: React.ReactNode }[] = [
  { id: 'eur',  label: 'Μενού',      icon: <span className="text-base leading-none font-black">€</span> },
  { id: 'xp',   label: 'Προσφορές',  icon: <Tag className="h-4 w-4" strokeWidth={2} /> },
  { id: 'shop', label: 'XP Shop',    icon: <Sparkles className="h-4 w-4" strokeWidth={2} /> },
];

function ModeToggle({ mode, onChange }: { mode: AppMode; onChange: (m: AppMode) => void }) {
  return (
    <LayoutGroup id="mode-toggle">
      <div className="mx-4 mt-4 flex rounded-2xl bg-[#1a1a1a] p-1 gap-0.5">
        {MODE_TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold z-0"
          >
            {mode === id && (
              <motion.div
                layoutId="modeActiveBg"
                className="absolute inset-0 rounded-xl shadow-sm"
                style={{ background: id === 'shop' ? `${XP_GOLD}cc` : id === 'xp' ? '#e63533' : ACCENT }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className={cn('relative z-10 flex items-center gap-1.5',
              mode === id ? 'text-white' : 'text-white/35',
              mode === id && id === 'shop' ? 'text-black' : '',
            )}>
              {icon}
              <span className="text-[12px]">{label}</span>
            </span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

// ─── Category Pills ───────────────────────────────────────────────────────────
function CategoryPills({
  categories,
  active,
  onSelect,
}: {
  categories: string[];
  active: string;
  onSelect: (c: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active pill into view
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const btn = el.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    btn?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [active]);

  return (
    <LayoutGroup id="category-pills">
      <div ref={scrollRef} className="flex gap-1 overflow-x-auto px-4 pb-0 pt-3 no-scrollbar">
        {['Όλα', ...categories].map((cat) => (
          <button
            key={cat}
            data-cat={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className="relative shrink-0 px-3 pb-3 pt-1 text-sm font-bold z-0"
          >
            <span className={cn(
              'relative flex items-center gap-1.5',
              active === cat ? 'text-white' : 'text-white/45',
            )}>
              <span className="text-sm leading-none">
                {cat === 'Όλα' ? '✦' : getCategoryEmoji(cat)}
              </span>
              <span>{cat}</span>
            </span>
            {active === cat && (
              <motion.div
                layoutId="categoryActivePill"
                className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full"
                style={{ background: ACCENT }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

// ─── Product Card (horizontal list row — Wolt style) ─────────────────────────
function ProductCard({
  product,
  quantity,
  onAdd,
  onRemove,
  onOpen,
  mode,
  storeXpBalance,
}: {
  product: { id: string; name: string; description: string; price: number; xpReward: number; image: string; category: string };
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
  onOpen: () => void;
  mode: 'eur' | 'xp';
  storeXpBalance: number;
}) {
  const xpCost = Math.round(product.price * XP_PER_EUR);
  const canRedeem = storeXpBalance >= xpCost;
  const shortfall = xpCost - storeXpBalance;

  return (
    <motion.div
      variants={cardVariants}
      className="flex items-start gap-4 px-4 py-4 cursor-pointer"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.055)' }}
      onClick={onOpen}
      whileTap={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
    >
      {/* ── Left: text ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-sm font-bold leading-snug text-white line-clamp-2">{product.name}</h3>

        {product.description ? (
          <p className="text-[12px] leading-snug text-white/45 line-clamp-2">{product.description}</p>
        ) : null}

        <div className="mt-2 flex items-center gap-2">
          {mode === 'eur' ? (
            <>
              <span className="text-sm font-black text-white">€{product.price.toFixed(2)}</span>
              {product.xpReward > 0 && (
                <span className="flex items-center gap-0.5 text-[11px] font-bold" style={{ color: XP_GOLD }}>
                  <Star className="h-2.5 w-2.5 fill-[#F5C518] text-[#F5C518]" strokeWidth={0} />
                  +{product.xpReward} XP
                </span>
              )}
            </>
          ) : canRedeem ? (
            <>
              <span className="text-sm font-black text-emerald-400">Εξαργύρωση</span>
              <span className="text-[11px] font-bold text-white/40">{xpCost.toLocaleString('el-GR')} XP</span>
            </>
          ) : (
            <span className="text-xs font-bold text-white/40">
              Λείπουν {shortfall.toLocaleString('el-GR')} XP
            </span>
          )}
        </div>
      </div>

      {/* ── Right: image ── */}
      <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-2xl">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
          draggable={false}
        />
        {/* XP earn badge */}
        {mode === 'eur' && product.xpReward > 0 && (
          <div className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-md bg-black/75 px-1.5 py-0.5 backdrop-blur-sm">
            <Star className="h-2.5 w-2.5 fill-[#F5C518] text-[#F5C518]" strokeWidth={0} />
            <span className="text-[9px] font-black text-white">+{product.xpReward}</span>
          </div>
        )}
        {/* XP cost badge */}
        {mode === 'xp' && (
          <div
            className="absolute bottom-1 left-1 flex items-center gap-0.5 rounded-md px-1.5 py-0.5"
            style={{ background: canRedeem ? XP_GOLD : 'rgba(0,0,0,0.72)' }}
          >
            <span className="text-[9px] font-black" style={{ color: canRedeem ? '#000' : '#fff' }}>
              {xpCost.toLocaleString('el-GR')} XP
            </span>
          </div>
        )}
        {/* Quantity indicator on image */}
        {quantity > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-black"
            style={{ background: XP_GOLD }}
          >
            {quantity}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Product Modal (bottom sheet) ────────────────────────────────────────────
function ProductModal({
  product,
  onClose,
  onAddToCart,
  mode,
  storeXpBalance,
}: {
  product: { id: string; name: string; description: string; price: number; xpReward: number; image: string; category: string };
  onClose: () => void;
  onAddToCart: (qty: number, extraPrice: number) => void;
  mode: 'eur' | 'xp' | 'shop';
  storeXpBalance: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string | string[]>>({});
  const options = useMemo(() => getProductOptions(product), [product]);

  const extraPrice = useMemo(() => {
    let total = 0;
    for (const [optId, sel] of Object.entries(selections)) {
      const opt = options.find((o) => o.id === optId);
      if (!opt) continue;
      const ids = Array.isArray(sel) ? sel : [sel];
      for (const cid of ids) total += opt.choices.find((c) => c.id === cid)?.priceAdd ?? 0;
    }
    return total;
  }, [selections, options]);

  const totalPrice = (product.price + extraPrice) * quantity;
  const totalXp = product.xpReward * quantity;
  const xpCost = Math.round(product.price * XP_PER_EUR);
  const canRedeem = storeXpBalance >= xpCost;
  // In shop mode: max qty the user can afford with available XP
  const maxShopQty = mode === 'shop' && xpCost > 0 ? Math.floor(storeXpBalance / xpCost) : Infinity;

  const toggleSingle = (optId: string, choiceId: string) =>
    setSelections((p) => ({ ...p, [optId]: p[optId] === choiceId ? '' : choiceId }));
  const toggleMulti = (optId: string, choiceId: string) =>
    setSelections((p) => {
      const cur = (p[optId] as string[]) ?? [];
      return { ...p, [optId]: cur.includes(choiceId) ? cur.filter((x) => x !== choiceId) : [...cur, choiceId] };
    });

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-[3px]"
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.85 }}
        className="fixed inset-x-0 bottom-0 z-[160] flex flex-col rounded-t-[1.75rem] bg-[#111] overflow-hidden"
        style={{ maxHeight: '92vh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-0.5 shrink-0">
          <div className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        {/* Image header */}
        <div className="relative w-full shrink-0 overflow-hidden" style={{ aspectRatio: '16/7' }}>
          <motion.img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#11110a] to-transparent" style={{ opacity: 0.85 }} />

          {/* XP badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 340 }}
            className="absolute top-3 right-3 flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{ background: `${XP_GOLD}22`, border: `1.5px solid ${XP_GOLD}70`, boxShadow: `0 0 14px 2px ${XP_GOLD}20` }}
          >
            <Star className="h-3.5 w-3.5 fill-[#F5C518] text-[#F5C518]" strokeWidth={0} />
            <span className="text-sm font-black" style={{ color: XP_GOLD }}>+{product.xpReward} XP</span>
          </motion.div>

          {/* Close */}
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.88 }}
            className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
          {/* Name + price row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black leading-tight text-white">{product.name}</h2>
              {product.description && (
                <p className="mt-1 text-sm leading-snug text-white/50">{product.description}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              {mode === 'shop' ? (
                <>
                  <p className="text-2xl font-black" style={{ color: XP_GOLD }}>{xpCost} XP</p>
                  <p className="text-xs text-white/35">€0.00</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-black text-white">€{product.price.toFixed(2)}</p>
                  {extraPrice > 0 && (
                    <p className="text-xs text-white/35">+€{extraPrice.toFixed(2)} extras</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* XP cost info in shop mode */}
          {mode === 'shop' && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 rounded-xl border px-3 py-2.5"
              style={canRedeem
                ? { borderColor: `${XP_GOLD}40`, background: `${XP_GOLD}0a` }
                : { borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
            >
              <Star className="h-4 w-4 shrink-0 fill-[#F5C518] text-[#F5C518]" strokeWidth={0} />
              <span className="text-sm font-bold" style={{ color: canRedeem ? XP_GOLD : 'rgba(255,255,255,0.35)' }}>
                {canRedeem
                  ? `${(xpCost * quantity).toLocaleString('el-GR')} XP · Διαθέσιμα: ${storeXpBalance.toLocaleString('el-GR')} XP`
                  : `Χρειάζεσαι ${(xpCost - storeXpBalance).toLocaleString('el-GR')} XP ακόμα`}
              </span>
            </motion.div>
          )}

          {/* Customization options */}
          {options.map((opt, oi) => (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + oi * 0.06 }}
              className="mt-5"
            >
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-sm font-black text-white">{opt.label}</h3>
                {opt.required && (
                  <span className="rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/50"
                    style={{ background: 'rgba(255,255,255,0.07)' }}>
                    Απαραίτητο
                  </span>
                )}
                {opt.type === 'multi' && (
                  <span className="text-[10px] text-white/30">Πολλαπλή επιλογή</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {opt.choices.map((choice) => {
                  const isSelected = opt.type === 'single'
                    ? selections[opt.id] === choice.id
                    : ((selections[opt.id] as string[]) ?? []).includes(choice.id);
                  return (
                    <motion.button
                      key={choice.id}
                      type="button"
                      whileTap={{ scale: 0.93 }}
                      onClick={() => opt.type === 'single' ? toggleSingle(opt.id, choice.id) : toggleMulti(opt.id, choice.id)}
                      className="rounded-xl border px-3 py-2 text-sm font-semibold"
                      style={isSelected ? {
                        background: ACCENT, borderColor: ACCENT, color: '#fff',
                      } : {
                        background: 'transparent', borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)',
                      }}
                    >
                      {choice.label}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}

          <div className="h-4" />
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.07] bg-[#111] px-5 pt-4"
          style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
          {/* XP limit hint */}
          {mode === 'shop' && maxShopQty < Infinity && (
            <p className="mb-2 text-center text-[10px] font-bold text-white/30">
              Μέγιστο {maxShopQty} τεμ. με τα διαθέσιμα XP σου
            </p>
          )}
          <div className="flex items-center gap-3">
            {/* Quantity stepper */}
            <div className="flex items-center gap-3 rounded-xl bg-[#1a1a1a] px-3 py-2.5">
              <motion.button type="button" whileTap={{ scale: 0.82 }}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="text-white/50">
                <Minus className="h-4 w-4" strokeWidth={2.5} />
              </motion.button>
              <AnimatePresence mode="popLayout">
                <motion.span key={quantity}
                  initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 24 }}
                  className="min-w-[1.5rem] text-center text-base font-black tabular-nums text-white">
                  {quantity}
                </motion.span>
              </AnimatePresence>
              <motion.button
                type="button"
                whileTap={{ scale: quantity >= maxShopQty ? 1 : 0.82 }}
                disabled={quantity >= maxShopQty}
                onClick={() => setQuantity((q) => Math.min(q + 1, maxShopQty))}
                style={{ color: quantity >= maxShopQty ? 'rgba(255,255,255,0.15)' : mode === 'shop' ? XP_GOLD : ACCENT }}
              >
                <Plus className="h-4 w-4" strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Add button */}
            {mode === 'shop' ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => { onAddToCart(quantity, 0); onClose(); }}
                className="flex flex-1 items-center justify-between rounded-xl px-4 py-3 text-black"
                style={{ background: XP_GOLD, boxShadow: `0 8px 24px -4px ${XP_GOLD}55` }}
              >
                <span className="flex items-center gap-1.5 text-sm font-black">
                  <Star className="h-4 w-4 fill-black text-black" strokeWidth={0} />
                  Αγορά με XP
                </span>
                <div className="text-right">
                  <p className="text-sm font-black">{Math.round(product.price * XP_PER_EUR) * quantity} XP</p>
                  <p className="text-[10px] font-bold text-black/50">€0.00</p>
                </div>
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => { onAddToCart(quantity, extraPrice); onClose(); }}
                className="flex flex-1 items-center justify-between rounded-xl px-4 py-3 text-white"
                style={{ background: ACCENT, boxShadow: `0 8px 24px -4px ${ACCENT}55` }}
              >
                <span className="text-sm font-black">Προσθήκη στο καλάθι</span>
                <div className="text-right">
                  <p className="text-sm font-black">€{totalPrice.toFixed(2)}</p>
                  <p className="text-[10px] font-bold" style={{ color: `${XP_GOLD}dd` }}>+{totalXp} XP</p>
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Cart Bar ─────────────────────────────────────────────────────────────────
function CartBar({
  itemCount,
  totalEur,
  totalXpEarn,
  reservedXP,
  onCheckout,
}: {
  itemCount: number;
  totalEur: number;
  totalXpEarn: number;
  reservedXP: number;
  onCheckout: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 110, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 110, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26, mass: 0.9 }}
      className="fixed inset-x-0 bottom-0 z-50 px-4 pt-2"
      style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
    >
      <motion.button
        type="button"
        onClick={onCheckout}
        whileHover={{ scale: 1.015, boxShadow: `0 16px 48px -8px ${ACCENT}60` }}
        whileTap={{ scale: 0.97 }}
        transition={springConfig}
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 shadow-[0_12px_40px_-6px_rgba(37,99,235,0.4)]"
        style={{ background: ACCENT }}
      >
        {/* Cart icon + badge */}
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <ShoppingCart className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
          <AnimatePresence mode="popLayout">
            <motion.span
              key={itemCount}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 520, damping: 20 }}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] font-black"
              style={{ color: ACCENT }}
            >
              {itemCount}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Label */}
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[10px] font-medium text-white/65">
            {itemCount} {itemCount === 1 ? 'προϊόν' : 'προϊόντα'}
          </p>
          <AnimatePresence mode="popLayout">
            <motion.p
              key={totalEur.toFixed(2)}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-base font-black text-white"
            >
              €{totalEur.toFixed(2)}
            </motion.p>
          </AnimatePresence>
          {reservedXP > 0 && (
            <p className="text-[9px] font-bold" style={{ color: `${XP_GOLD}bb` }}>
              +{reservedXP.toLocaleString('el-GR')} XP δεσμευμένα
            </p>
          )}
        </div>

        {/* XP earn */}
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/55">Κερδίζεις</p>
          <motion.p
            className="flex items-center justify-end gap-1 text-sm font-black"
            style={{ color: XP_GOLD }}
            animate={{ opacity: [1, 0.65, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            +{totalXpEarn.toLocaleString('el-GR')} XP
          </motion.p>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-white/65" strokeWidth={2.5} />
      </motion.button>
    </motion.div>
  );
}

// ─── Order Confirm Screen ─────────────────────────────────────────────────────
type PaymentMethod = 'cash' | 'card' | 'xp';

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'Μετρητά', icon: '💵' },
  { id: 'card', label: 'Κάρτα',   icon: '💳' },
  { id: 'xp',   label: 'XP',      icon: '⭐' },
];

function OrderConfirmScreen({
  cart,
  xpCartItems,
  xpCartReservedXP,
  totalEur,
  totalXpEarn,
  tableNumber,
  storeXpBalance,
  onConfirm,
  onCancel,
  onAddItem,
  onRemoveItem,
  onAddXpItem,
  onRemoveXpItem,
  isSubmitting,
  error,
}: {
  cart: CartItemData[];
  xpCartItems: CartItemData[];
  xpCartReservedXP: number;
  totalEur: number;
  totalXpEarn: number;
  tableNumber: number;
  storeXpBalance: number;
  onConfirm: (paymentMethod: PaymentMethod, xpDiscountXP: number) => void;
  onCancel: () => void;
  onAddItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onAddXpItem: (id: string) => void;
  onRemoveXpItem: (id: string) => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [xpDiscountXP, setXpDiscountXP] = useState(0);
  const [xpInput, setXpInput] = useState('');

  const fullXpCost   = Math.round(totalEur * XP_PER_EUR);
  const canPayWithXP = storeXpBalance >= fullXpCost;
  const maxDiscount  = Math.min(storeXpBalance, fullXpCost); // can't discount more than order value
  const discountEur  = paymentMethod !== 'xp' ? xpDiscountXP / XP_PER_EUR : 0;
  const finalTotal   = paymentMethod === 'xp' ? 0 : Math.max(0, totalEur - discountEur);
  const sliderPct    = maxDiscount > 0 ? (xpDiscountXP / maxDiscount) * 100 : 0;

  const applyXpValue = (raw: number) => {
    const clamped = Math.max(0, Math.min(raw, maxDiscount));
    setXpDiscountXP(clamped);
    setXpInput(clamped === 0 ? '' : String(clamped));
  };

  const handleInputChange = (v: string) => {
    setXpInput(v);
    const n = parseInt(v, 10);
    if (!isNaN(n)) applyXpValue(n);
    else if (v === '') setXpDiscountXP(0);
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) =>
    applyXpValue(parseInt(e.target.value, 10));

  const handleSelectPayment = (m: PaymentMethod) => {
    setPaymentMethod(m);
    if (m === 'xp') { setXpDiscountXP(0); setXpInput(''); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="fixed inset-0 z-[200] flex flex-col bg-[#0a0a0a]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <header className="flex items-center gap-4 border-b border-white/[0.07] bg-[#111] px-5 py-4">
        <motion.button type="button" onClick={onCancel} disabled={isSubmitting} whileTap={{ scale: 0.88 }} className="text-white">
          <ArrowLeft className="h-6 w-6" strokeWidth={2.2} />
        </motion.button>
        <h1 className="text-lg font-extrabold text-white">Η Παραγγελία σου</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {/* Table info */}
        <motion.div
          initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.08 }}
          className="flex items-center gap-2.5 rounded-2xl border border-white/[0.07] bg-[#141414] p-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: ACCENT }}>
            <MapPin className="h-5 w-5" strokeWidth={2.3} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Τραπέζι</p>
            <p className="text-lg font-black text-white">#{tableNumber}</p>
          </div>
        </motion.div>

        {/* ── Scrollable items box ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/[0.07] bg-[#111] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">Προϊόντα</p>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{ background: ACCENT }}>
              {cart.reduce((s, i) => s + i.quantity, 0) + xpCartItems.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>

          {/* Inner scroll area */}
          <div className="no-scrollbar overflow-y-auto space-y-2 p-3" style={{ maxHeight: '36vh' }}>

        {/* Items */}
        <AnimatePresence>
          {cart.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 24, opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ delay: 0.1 + i * 0.06, layout: { type: 'spring', stiffness: 320, damping: 28 } }}
              className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#141414]"
            >
              {/* Top row: image + name + price */}
              <div className="flex items-center gap-3 p-3">
                <img src={item.image} alt={item.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{item.name}</p>
                  <p className="text-[11px] text-white/40">€{item.price.toFixed(2)} / τεμ.</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">€{(item.price * item.quantity).toFixed(2)}</p>
                  {item.xpReward > 0 && (
                    <p className="text-[10px] font-bold" style={{ color: XP_GOLD }}>+{item.xpReward * item.quantity} XP</p>
                  )}
                </div>
              </div>

              {/* Bottom row: qty controls + delete */}
              <div className="flex items-center gap-3 border-t border-white/[0.06] px-3 py-2.5">
                {/* − / qty / + */}
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.82 }}
                    disabled={isSubmitting}
                    onClick={() => onRemoveItem(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white"
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={2.8} />
                  </motion.button>

                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={item.quantity}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.4, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                      className="w-6 text-center text-sm font-black tabular-nums text-white"
                    >
                      {item.quantity}
                    </motion.span>
                  </AnimatePresence>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.82 }}
                    disabled={isSubmitting}
                    onClick={() => onAddItem(item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                    style={{ background: ACCENT }}
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.8} />
                  </motion.button>
                </div>

                <div className="flex-1" />

                {/* Delete */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.82 }}
                  disabled={isSubmitting}
                  onClick={() => { for (let q = item.quantity; q > 0; q--) onRemoveItem(item.id); }}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-bold text-red-400"
                >
                  <X className="h-3 w-3" strokeWidth={2.5} />
                  Διαγραφή
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── XP Shop extras ── */}
        {xpCartItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
            className="rounded-2xl border p-4 space-y-3"
            style={{ borderColor: `${XP_GOLD}33`, background: `${XP_GOLD}08` }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: `${XP_GOLD}aa` }}>
                Extras με XP
              </p>
              <span className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-black"
                style={{ background: `${XP_GOLD}22`, color: XP_GOLD }}>
                ⭐ {xpCartReservedXP.toLocaleString('el-GR')} XP δεσμευμένα
              </span>
            </div>
            <AnimatePresence>
              {xpCartItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ layout: { type: 'spring', stiffness: 320, damping: 28 } }}
                  className="overflow-hidden rounded-xl border"
                  style={{ borderColor: `${XP_GOLD}22`, background: `${XP_GOLD}06` }}
                >
                  {/* Top: image + name + xp cost */}
                  <div className="flex items-center gap-3 p-2.5">
                    <img src={item.image} alt={item.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-white">{item.name}</p>
                      <p className="text-[10px] text-white/40">{Math.round(item.price * XP_PER_EUR).toLocaleString('el-GR')} XP / τεμ.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black" style={{ color: XP_GOLD }}>
                        {(Math.round(item.price * XP_PER_EUR) * item.quantity).toLocaleString('el-GR')} XP
                      </p>
                      <p className="text-[10px] text-white/30">€0.00</p>
                    </div>
                  </div>
                  {/* Controls */}
                  <div className="flex items-center gap-2 border-t px-2.5 py-2" style={{ borderColor: `${XP_GOLD}18` }}>
                    <motion.button type="button" whileTap={{ scale: 0.82 }} disabled={isSubmitting}
                      onClick={() => onRemoveXpItem(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white">
                      <Minus className="h-3.5 w-3.5" strokeWidth={2.8} />
                    </motion.button>
                    <AnimatePresence mode="popLayout">
                      <motion.span key={item.quantity}
                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.4, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                        className="w-6 text-center text-sm font-black tabular-nums text-white">
                        {item.quantity}
                      </motion.span>
                    </AnimatePresence>
                    <motion.button type="button" whileTap={{ scale: 0.82 }} disabled={isSubmitting}
                      onClick={() => onAddXpItem(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-black font-black"
                      style={{ background: XP_GOLD }}>
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.8} />
                    </motion.button>
                    <div className="flex-1" />
                    <motion.button type="button" whileTap={{ scale: 0.82 }} disabled={isSubmitting}
                      onClick={() => { for (let q = item.quantity; q > 0; q--) onRemoveXpItem(item.id); }}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-bold text-red-400">
                      <X className="h-3 w-3" strokeWidth={2.5} />
                      Διαγραφή
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

          </div>{/* end inner scroll */}
        </motion.div>{/* end scrollable items box */}

        {/* ── Payment method ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="rounded-2xl border border-white/[0.07] bg-[#141414] p-4 space-y-3"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Τρόπος πληρωμής</p>
          <div className="flex gap-2">
            {PAYMENT_OPTIONS.map(({ id, label, icon }) => {
              const isXp = id === 'xp';
              const disabled = isXp && !canPayWithXP;
              const active = paymentMethod === id;
              return (
                <motion.button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectPayment(id)}
                  whileTap={{ scale: disabled ? 1 : 0.94 }}
                  className="relative flex flex-1 flex-col items-center gap-1.5 rounded-xl py-3 transition-colors"
                  style={{
                    background: active ? (isXp ? `${XP_GOLD}22` : `${ACCENT}22`) : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${active ? (isXp ? XP_GOLD : ACCENT) : 'rgba(255,255,255,0.08)'}`,
                    opacity: disabled ? 0.35 : 1,
                  }}
                >
                  <span className="text-xl leading-none">{icon}</span>
                  <span className="text-[11px] font-bold" style={{ color: active ? (isXp ? XP_GOLD : ACCENT) : 'rgba(255,255,255,0.55)' }}>
                    {label}
                  </span>
                  {isXp && !canPayWithXP && (
                    <span className="absolute -top-1.5 right-1.5 rounded-full bg-[#1a1a1a] px-1.5 py-0.5 text-[8px] font-bold text-white/30 border border-white/[0.06]">
                      {storeXpBalance}/{fullXpCost} XP
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
          {paymentMethod === 'xp' && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[11px] font-medium text-center"
              style={{ color: XP_GOLD }}
            >
              Θα χρησιμοποιηθούν {fullXpCost.toLocaleString('el-GR')} XP
            </motion.p>
          )}
        </motion.div>

        {/* ── XP Discount (only for cash/card) ── */}
        <AnimatePresence>
          {paymentMethod !== 'xp' && storeXpBalance > 0 && (
            <motion.div
              key="xp-discount"
              initial={{ opacity: 0, height: 0, y: 8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 8 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-white/[0.07] bg-[#141414] p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Discount με XP</p>
                  <span className="text-[11px] font-bold" style={{ color: XP_GOLD }}>
                    {storeXpBalance.toLocaleString('el-GR')} XP διαθέσιμα
                  </span>
                </div>

                {/* Input */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex flex-1 items-center gap-2 rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.09)' }}
                  >
                    <Star className="h-4 w-4 shrink-0 fill-[#F5C518] text-[#F5C518]" strokeWidth={0} />
                    <input
                      type="number"
                      min={0}
                      max={maxDiscount}
                      value={xpInput}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent text-sm font-bold text-white placeholder-white/25 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <span className="text-xs font-bold text-white/40 shrink-0">XP</span>
                  </div>
                  {xpDiscountXP > 0 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-xl px-3 py-3 text-center"
                      style={{ background: 'rgba(34,197,94,0.12)', border: '1.5px solid rgba(34,197,94,0.25)' }}
                    >
                      <p className="text-xs font-black text-green-400">−€{discountEur.toFixed(2)}</p>
                    </motion.div>
                  )}
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <div className="relative h-6 flex items-center">
                    {/* Track background */}
                    <div className="absolute inset-x-0 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
                    {/* Filled track */}
                    <motion.div
                      className="absolute left-0 h-1.5 rounded-full"
                      style={{ background: `linear-gradient(90deg, ${XP_GOLD}88, ${XP_GOLD})`, width: `${sliderPct}%` }}
                      transition={{ duration: 0.08 }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxDiscount}
                      step={1}
                      value={xpDiscountXP}
                      onChange={handleSlider}
                      className="absolute inset-x-0 h-full w-full cursor-pointer opacity-0"
                      style={{ zIndex: 2 }}
                    />
                    {/* Thumb */}
                    <motion.div
                      className="absolute h-5 w-5 rounded-full shadow-lg pointer-events-none"
                      style={{
                        left: `calc(${sliderPct}% - ${sliderPct * 0.2}px)`,
                        background: XP_GOLD,
                        boxShadow: `0 0 10px ${XP_GOLD}80`,
                        zIndex: 1,
                      }}
                      transition={{ duration: 0.08 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-medium text-white/30">
                    <span>0 XP</span>
                    <span>{maxDiscount.toLocaleString('el-GR')} XP max</span>
                  </div>
                </div>

                {xpDiscountXP > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center text-[11px] font-bold text-green-400"
                  >
                    Εκπτωση €{discountEur.toFixed(2)} · Χρησιμοποιείς {xpDiscountXP.toLocaleString('el-GR')} XP
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-red-900/30 border border-red-500/30 px-4 py-3 text-sm font-medium text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>

      {/* Total + CTA */}
      <motion.div
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
        className="border-t border-white/[0.07] bg-[#111] px-5 pt-5"
        style={{ paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))' }}
      >
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-medium text-white/40">Σύνολο</p>
            <div className="flex items-baseline gap-2">
              {discountEur > 0 && paymentMethod !== 'xp' && (
                <span className="text-lg font-bold text-white/25 line-through">€{totalEur.toFixed(2)}</span>
              )}
              <motion.p
                key={finalTotal}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-black text-white"
              >
                {paymentMethod === 'xp' ? 'XP' : `€${finalTotal.toFixed(2)}`}
              </motion.p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-white/40">Θα κερδίσεις</p>
            <p className="text-2xl font-black" style={{ color: XP_GOLD }}>+{totalXpEarn.toLocaleString('el-GR')} XP</p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={() => onConfirm(paymentMethod, xpDiscountXP)}
          disabled={isSubmitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          transition={springConfig}
          className="flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-black text-white disabled:opacity-60"
          style={{ background: ACCENT }}
        >
          {isSubmitting
            ? <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
            : <Zap className="h-5 w-5" strokeWidth={2.5} />}
          {isSubmitting ? 'Αποστολή...' : 'Επιβεβαίωση Παραγγελίας'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ─── Order Pending Screen ─────────────────────────────────────────────────────
// ─── Order Status Flow ────────────────────────────────────────────────────────
type OrderStatus = 'waiting' | 'preparing' | 'ready';

function SpinnerRing({ color }: { color: string }) {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="34" fill="none" stroke={`${color}18`} strokeWidth="4" />
      <motion.circle
        cx="40" cy="40" r="34"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="60 154"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        style={{ originX: '50%', originY: '50%', transformOrigin: '40px 40px' }}
      />
    </svg>
  );
}

function OrderPendingScreen({
  totalXpEarn,
  merchantId,
  userId,
  tableNumber,
  onOrderAccepted,
}: {
  totalXpEarn: number;
  merchantId: string;
  userId: string;
  tableNumber: number;
  onOrderAccepted: () => void;
}) {
  const [status, setStatus] = useState<OrderStatus>('waiting');
  const cbRef = useRef(onOrderAccepted);
  cbRef.current = onOrderAccepted;

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        if (!userId) return;
        const latest = await api.getLatestOrder({ userId, merchantId, tableNumber });
        if (!latest) return;
        const s = String(latest.status ?? '').toLowerCase();
        if (s === '3' || s.includes('ready') || s.includes('done')) {
          clearInterval(poll);
          setStatus('ready');
        } else if (s === '2' || s.includes('prepar') || s.includes('accept')) {
          setStatus('preparing');
        }
      } catch {}
    }, 3500);
    return () => clearInterval(poll);
  }, [merchantId, tableNumber, userId]);

  // When ready, auto-advance to celebration after 3.5 s
  useEffect(() => {
    if (status !== 'ready') return;
    const t = setTimeout(() => cbRef.current(), 3500);
    return () => clearTimeout(t);
  }, [status]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col bg-[#0a0a0a] text-white"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <AnimatePresence mode="wait">

        {/* ── WAITING ── */}
        {status === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-1 flex-col items-center justify-center px-8 text-center"
          >
            {/* Pulsing rings + spinner */}
            <div className="relative mb-10 flex h-32 w-32 items-center justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{ border: `1.5px solid ${ACCENT}44` }}
                  animate={{ scale: [1, 1.9 + i * 0.35], opacity: [0.5, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
                />
              ))}
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: `${ACCENT}15`, border: `1.5px solid ${ACCENT}40` }}>
                <SpinnerRing color={ACCENT} />
                <Clock className="h-8 w-8" style={{ color: ACCENT }} strokeWidth={1.8} />
              </div>
            </div>

            <motion.p
              className="text-2xl font-black leading-snug"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              Αναμονή επιβεβαίωσης
            </motion.p>
            <p className="mt-3 text-sm leading-relaxed text-white/40">
              Η παραγγελία σου στάλθηκε.<br />Περιμένουμε το κατάστημα να την αποδεχθεί…
            </p>

            {/* Step dots */}
            <div className="mt-10 flex items-center gap-2">
              <div className="h-2 w-7 rounded-full" style={{ background: ACCENT }} />
              <div className="h-2 w-2 rounded-full bg-white/15" />
              <div className="h-2 w-2 rounded-full bg-white/15" />
            </div>

            {totalXpEarn > 0 && (
              <div className="mt-10 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-8 py-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Θα κερδίσεις</p>
                <p className="mt-1 text-3xl font-black tabular-nums" style={{ color: XP_GOLD }}>
                  +{totalXpEarn.toLocaleString('el-GR')} XP
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── PREPARING ── */}
        {status === 'preparing' && (
          <motion.div
            key="preparing"
            initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="flex flex-1 flex-col items-center justify-center px-8 text-center"
          >
            {/* Warm glow orb */}
            <div className="relative mb-10 flex h-32 w-32 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: `radial-gradient(circle, ${XP_GOLD}22 0%, transparent 70%)` }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="relative flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: `${XP_GOLD}18`, border: `1.5px solid ${XP_GOLD}55` }}
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChefHat className="h-9 w-9" style={{ color: XP_GOLD }} strokeWidth={1.8} />
              </motion.div>
            </div>

            <motion.p
              className="text-2xl font-black leading-snug"
              initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            >
              Η παραγγελία έγινε δεκτή!
            </motion.p>
            <motion.p
              className="mt-3 text-sm leading-relaxed text-white/45"
              initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            >
              Το κατάστημα ετοιμάζει την παραγγελία σου.<br />Θα σε ενημερώσουμε όταν είναι έτοιμη.
            </motion.p>

            {/* Animated progress bar */}
            <div className="mt-8 w-full max-w-[220px] overflow-hidden rounded-full bg-white/[0.07]" style={{ height: 4 }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: XP_GOLD }}
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
              />
            </div>

            {/* Step dots */}
            <div className="mt-8 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ background: XP_GOLD }} />
              <div className="h-2 w-7 rounded-full" style={{ background: XP_GOLD }} />
              <div className="h-2 w-2 rounded-full bg-white/15" />
            </div>

            {totalXpEarn > 0 && (
              <div className="mt-10 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-8 py-5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Θα κερδίσεις</p>
                <p className="mt-1 text-3xl font-black tabular-nums" style={{ color: XP_GOLD }}>
                  +{totalXpEarn.toLocaleString('el-GR')} XP
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── READY ── */}
        {status === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            className="flex flex-1 flex-col items-center justify-center px-8 text-center"
          >
            {/* Green burst */}
            <div className="relative mb-10 flex h-36 w-36 items-center justify-center">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid #22C55E44` }}
                  animate={{ scale: [1, 2.2 + i * 0.4], opacity: [0.8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
                />
              ))}
              <motion.div
                className="relative flex h-24 w-24 items-center justify-center rounded-full"
                style={{ background: '#22C55E18', border: '2px solid #22C55E66' }}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
              >
                <CheckCircle2 className="h-12 w-12 text-[#22C55E]" strokeWidth={1.8} />
              </motion.div>
            </div>

            <motion.p
              className="text-3xl font-black leading-snug"
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}
              style={{ color: '#22C55E' }}
            >
              Η παραγγελία σας<br />είναι έτοιμη! 🎉
            </motion.p>
            <motion.p
              className="mt-3 text-sm leading-relaxed text-white/45"
              initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}
            >
              Απολαύστε το γεύμα σας!
            </motion.p>

            {/* Step dots */}
            <div className="mt-8 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#22C55E]" />
              <div className="h-2 w-2 rounded-full bg-[#22C55E]" />
              <div className="h-2 w-7 rounded-full bg-[#22C55E]" />
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}

// ─── Auth Gate Screen ─────────────────────────────────────────────────────────
function AuthGateScreen({
  xpEarn,
  onLogin,
  onGuest,
}: {
  xpEarn: number;
  onLogin: () => void;
  onGuest: () => void;
}) {
  const handleGuestContinue = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onGuest();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="fixed inset-0 z-[210] flex flex-col items-center justify-center bg-[#0a0a0a] px-6 text-white"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Animated gold glow */}
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, ${XP_GOLD}30 0%, transparent 70%)` }}
            animate={{ scale: [1, 1.5 + i * 0.3], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
          />
        ))}
        <motion.div
          className="relative flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: `${XP_GOLD}18`, border: `2px solid ${XP_GOLD}55` }}
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Star className="h-9 w-9 fill-[#F5C518] text-[#F5C518]" strokeWidth={0} />
        </motion.div>
      </div>

      {/* Title */}
      <h2 className="text-center text-2xl font-black leading-snug text-white">
        Κέρδισε τα XP σου!
      </h2>
      <p className="mt-2 text-center text-sm text-white/45 leading-relaxed">
        Συνδέσου για να αποθηκευτούν οι πόντοι σου<br />και να ολοκληρώσεις την παραγγελία σου.
      </p>

      {/* XP preview */}
      {xpEarn > 0 && (
        <motion.div
          className="mt-6 flex items-center gap-2 rounded-2xl px-6 py-4"
          style={{ background: `${XP_GOLD}12`, border: `1.5px solid ${XP_GOLD}33` }}
          animate={{ boxShadow: [`0 0 0px ${XP_GOLD}00`, `0 0 24px 4px ${XP_GOLD}18`, `0 0 0px ${XP_GOLD}00`] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Star className="h-5 w-5 fill-[#F5C518] text-[#F5C518] shrink-0" strokeWidth={0} />
          <span className="text-2xl font-black tabular-nums" style={{ color: XP_GOLD }}>
            +{xpEarn.toLocaleString('el-GR')} XP
          </span>
          <span className="text-sm text-white/40">θα κερδίσεις</span>
        </motion.div>
      )}

      {/* Buttons */}
      <div className="mt-8 w-full space-y-3">
        <motion.button
          type="button"
          onClick={onLogin}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-lg"
          style={{ background: ACCENT, boxShadow: `0 8px 32px -4px ${ACCENT}55` }}
        >
          <Zap className="h-5 w-5" strokeWidth={2.5} />
          Σύνδεση / Εγγραφή
        </motion.button>

        <motion.button
          type="button"
          onClick={handleGuestContinue}
          onPointerUp={handleGuestContinue}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.04] py-4 text-sm font-bold text-white/55"
        >
          Συνέχεια χωρίς πόντους
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── XP Celebration + Loot Box ────────────────────────────────────────────────
function XPCelebrationScreen({ xpEarned, onContinue }: { xpEarned: number; onContinue: () => void }) {
  const [phase, setPhase] = useState<'xp' | 'lootbox' | 'reveal'>('xp');
  const lootReward = useMemo(() => LOOT_REWARDS[Math.floor(Math.random() * LOOT_REWARDS.length)], []);
  const displayXp = useXPSpringCounter(phase === 'xp' ? xpEarned : 0);

  useEffect(() => {
    if (phase !== 'xp') return;
    const t = setTimeout(() => setPhase('lootbox'), 2800);
    return () => clearTimeout(t);
  }, [phase]);

  const particles = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({
      color: i % 3 === 0 ? XP_GOLD : i % 3 === 1 ? ACCENT : '#22C55E',
      top: `${6 + Math.random() * 88}%`,
      left: `${4 + Math.random() * 92}%`,
      delay: Math.random() * 2,
      dur: 1.6 + Math.random() * 1.4,
      size: 4 + Math.round(Math.random() * 6),
    })),
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-8 text-white"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{ background: p.color, top: p.top, left: p.left, width: p.size, height: p.size }}
          animate={{ y: [-10, -90, -170], opacity: [0, 1, 0], scale: [0.3, 1.8, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'easeOut' }}
        />
      ))}

      <AnimatePresence mode="wait">
        {phase === 'xp' && (
          <motion.div
            key="xp"
            initial={{ scale: 0.55, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.18, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="text-center"
          >
            <motion.div
              className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${XP_GOLD}28, ${XP_GOLD}06)`,
                border: `2px solid ${XP_GOLD}38`,
                boxShadow: `0 0 48px 12px ${XP_GOLD}18`,
              }}
              animate={{ scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Trophy className="h-11 w-11" style={{ color: XP_GOLD }} strokeWidth={1.8} />
            </motion.div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/35">Κέρδισες</p>
            <motion.p className="mt-2 text-[4.5rem] font-black leading-none tabular-nums" style={{ color: XP_GOLD }}>
              +{displayXp.toLocaleString('el-GR')}
            </motion.p>
            <motion.p
              className="mt-1.5 text-2xl font-black text-white"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              XP
            </motion.p>
            <p className="mt-3 text-sm text-white/35">Προστέθηκαν στο πορτοφόλι σου</p>
          </motion.div>
        )}

        {phase === 'lootbox' && (
          <motion.div
            key="lootbox"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex flex-col items-center text-center"
          >
            <motion.p
              className="mb-8 text-sm font-bold uppercase tracking-widest text-white/40"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Το Loot Box σου είναι εδώ!
            </motion.p>

            <motion.button
              type="button"
              onClick={() => setPhase('reveal')}
              whileTap={{ scale: 0.88 }}
              className="relative flex h-40 w-40 items-center justify-center rounded-3xl"
              style={{
                background: `radial-gradient(circle at 40% 35%, ${XP_GOLD}25, #0e0b00)`,
                border: `2px solid ${XP_GOLD}55`,
              }}
              animate={{ rotate: [-3, 3, -3], scale: [1, 1.05, 1] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-3xl"
                animate={{ boxShadow: [`0 0 0px ${XP_GOLD}00`, `0 0 40px 10px ${XP_GOLD}22`, `0 0 0px ${XP_GOLD}00`] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <Gift className="h-16 w-16" style={{ color: XP_GOLD }} strokeWidth={1.4} />
            </motion.button>

            <motion.p
              className="mt-7 text-base font-bold text-white/55"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              Πάτα για να ανοίξεις! 🎁
            </motion.p>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ scale: 0.3, rotateY: 90, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              className="mb-5 flex h-32 w-32 items-center justify-center rounded-3xl text-7xl"
              style={{
                background: `radial-gradient(circle, ${XP_GOLD}18, ${XP_GOLD}04)`,
                border: `1.5px solid ${XP_GOLD}50`,
                boxShadow: `0 0 32px 6px ${XP_GOLD}14`,
              }}
              animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {lootReward.emoji}
            </motion.div>

            <motion.p
              className="text-[11px] font-bold uppercase tracking-widest text-white/30"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Κέρδισες
            </motion.p>
            <motion.p
              className="mt-2 text-2xl font-black text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              {lootReward.title}
            </motion.p>
            <motion.p
              className="mt-1 text-sm text-white/45"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {lootReward.subtitle}
            </motion.p>

            <Sparkles className="mt-6 h-6 w-6 text-white/18" strokeWidth={1.5} />

            <motion.button
              type="button"
              onClick={onContinue}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={springConfig}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 w-full rounded-2xl bg-white py-4 text-base font-black"
              style={{ color: ACCENT }}
            >
              Τέλεια! Συνέχεια →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface AnbitScanMenuPageProps {
  partner: Partner;
  tableNumber: number;
  entryMethod?: 'nfc' | 'qr';
  onBack: () => void;
  onOrderComplete?: (xpEarned: number) => void;
  onOpenLogin?: (onSuccess?: () => void) => void;
  isAuthenticated: boolean;
  partnerQuests?: Quest[];
}

const AnbitScanMenuPage: React.FC<AnbitScanMenuPageProps> = ({
  partner,
  tableNumber,
  entryMethod = 'qr',
  onBack,
  onOrderComplete,
  onOpenLogin,
  isAuthenticated,
  partnerQuests = [],
}) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollRef });

  // Parallax: hero image moves up slower than scroll
  const heroY = useTransform(scrollY, [0, 280], [0, 72]);
  const heroScale = useTransform(scrollY, [0, 280], [1, 1.14]);
  const heroGradientOpacity = useTransform(scrollY, [0, 180], [0.7, 0.92]);

  // Mini sticky header fades in when hero exits
  const miniHeaderOpacity = useTransform(scrollY, [160, 230], [0, 1]);
  const miniHeaderY = useTransform(scrollY, [160, 230], [-12, 0]);

  const [mode, setMode] = useState<AppMode>('eur');
  const [activeCategory, setActiveCategory] = useState('Όλα');
  const [shopCategory, setShopCategory] = useState('Όλα');
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [xpCart, setXpCart] = useState<Map<string, number>>(new Map()); // XP-shop items (paid with XP, no € charge, no XP reward)
  const [screen, setScreen] = useState<'menu' | 'confirm' | 'pending' | 'accepted'>('menu');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [storeXpBalance, setStoreXpBalance] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<typeof menu[number] | null>(null);
  const [showDotMenu, setShowDotMenu] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Refs for each category section (for scroll-to + IntersectionObserver)
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  // Blocks IntersectionObserver updates during a programmatic scroll
  const isScrollingProgrammatically = useRef(false);
  const scrollBlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load store XP balance
  useEffect(() => {
    if (!user) return;
    const quick = user.storeXP?.[partner.id] ?? user.storeXP?.[partner.id.toLowerCase()] ?? 0;
    if (quick > 0) { setStoreXpBalance(quick); return; }
    let cancelled = false;
    (async () => {
      try {
        const all: Awaited<ReturnType<typeof api.getUserXP>> = [];
        let offset = 0;
        while (true) {
          const page = await api.getUserXP({ limit: 100, offset });
          all.push(...page);
          if (page.length < 100) break;
          offset += 100;
        }
        if (cancelled) return;
        const balance = Math.max(0, all
          .filter((it) => String(it.merchantId).toLowerCase() === partner.id.toLowerCase())
          .reduce((s, it) => s + Number(it.xp ?? 0), 0));
        setStoreXpBalance(balance);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [user, partner.id]);

  const menu = partner.menu ?? [];
  const categories = useMemo(() => [...new Set(menu.map((p) => p.category).filter(Boolean))], [menu]);

  // Products grouped by category for section-based layout
  const productsByCategory = useMemo(
    () => categories.map((cat) => ({ cat, products: menu.filter((p) => p.category === cat) })),
    [menu, categories],
  );

  // IntersectionObserver: update active pill as sections scroll into view
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || categories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip during programmatic scroll OR when we're at the very top ("Όλα")
        if (isScrollingProgrammatically.current) return;
        if (root.scrollTop < 60) return;
        // Pick the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const cat = visible[0].target.getAttribute('data-category');
          if (cat) setActiveCategory(cat);
        }
      },
      {
        root,
        threshold: 0.15,
        rootMargin: '-56px 0px -55% 0px',
      },
    );

    const els = Array.from(sectionRefs.current.values());
    els.forEach((el) => observer.observe(el));

    // Always check for top position — not blocked by programmatic flag
    const handleScroll = () => {
      if (root.scrollTop < 60) setActiveCategory('Όλα');
    };
    root.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      root.removeEventListener('scroll', handleScroll);
    };
  }, [categories]);

  // Category selection → smooth scroll to section
  const handleCategorySelect = useCallback((cat: string) => {
    // Set the pill immediately
    setActiveCategory(cat);

    // Block IntersectionObserver for the duration of the smooth scroll (~700ms)
    isScrollingProgrammatically.current = true;
    if (scrollBlockTimer.current) clearTimeout(scrollBlockTimer.current);
    scrollBlockTimer.current = setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 1000);

    requestAnimationFrame(() => {
      const root = scrollRef.current;
      if (!root) return;

      if (cat === 'Όλα') {
        root.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const el = sectionRefs.current.get(cat);
      if (!el) return;

      const rootRect = root.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      // 56px sticky bar + 8px breathing room
      const stickyOffset = 64;
      const target = root.scrollTop + (elRect.top - rootRect.top) - stickyOffset;
      root.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    });
  }, []);

  // Cart operations
  const addToCart = useCallback((productId: string) => {
    setCart((prev) => { const n = new Map(prev); n.set(productId, (n.get(productId) ?? 0) + 1); return n; });
  }, []);
  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const n = new Map(prev);
      const q = n.get(productId) ?? 0;
      if (q <= 1) n.delete(productId); else n.set(productId, q - 1);
      return n;
    });
  }, []);

  const addToXpCart = useCallback((productId: string) => {
    setXpCart((prev) => { const n = new Map(prev); n.set(productId, (n.get(productId) ?? 0) + 1); return n; });
  }, []);
  const removeFromXpCart = useCallback((productId: string) => {
    setXpCart((prev) => {
      const n = new Map(prev);
      const q = n.get(productId) ?? 0;
      if (q <= 1) n.delete(productId); else n.set(productId, q - 1);
      return n;
    });
  }, []);

  const cartItems: CartItemData[] = useMemo(
    () => Array.from(cart.entries())
      .map(([id, qty]) => { const p = menu.find((x) => x.id === id); return p && qty > 0 ? { ...p, quantity: qty } as CartItemData : null; })
      .filter((x): x is CartItemData => x !== null),
    [cart, menu],
  );
  const cartTotal = useMemo(() => {
    let eur = 0, xp = 0, count = 0;
    for (const item of cartItems) { eur += item.price * item.quantity; xp += item.xpReward * item.quantity; count += item.quantity; }
    return { eur, xp, count };
  }, [cartItems]);

  // XP-shop cart: items paid with XP — no € charge, no XP reward
  const xpCartItems = useMemo(
    () => Array.from(xpCart.entries())
      .map(([id, qty]) => { const p = menu.find((x) => x.id === id); return p && qty > 0 ? { ...p, quantity: qty } as CartItemData : null; })
      .filter((x): x is CartItemData => x !== null),
    [xpCart, menu],
  );
  const xpCartTotal = useMemo(() => {
    let xpCost = 0, count = 0;
    for (const item of xpCartItems) { xpCost += Math.round(item.price * XP_PER_EUR) * item.quantity; count += item.quantity; }
    return { xpCost, count };
  }, [xpCartItems]);

  // XP available for discounts and new XP-shop purchases (minus already-reserved XP)
  const availableXP = Math.max(0, storeXpBalance - xpCartTotal.xpCost);

  // Stored payment params while auth gate is open
  const pendingOrderRef = useRef<{ paymentMethod: PaymentMethod; xpDiscountXP: number } | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);

  const doSubmitOrder = async (paymentMethod: PaymentMethod, xpDiscountXP: number, earnXp: boolean) => {
    if (!user?.id) {
      setSubmitError('Απαιτείται σύνδεση χρήστη για αποστολή παραγγελίας.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const orderItems = [
        ...cartItems.map((item) => ({
          productId: String(item.id),
          quantity: item.quantity,
        })),
        ...xpCartItems.map((item) => ({
          productId: String(item.id),
          quantity: item.quantity,
        })),
      ].filter((item) => item.productId && item.quantity > 0);

      if (orderItems.length === 0) {
        setSubmitError('Δεν υπάρχουν προϊόντα για αποστολή.');
        return;
      }

      // Backend /Orders expects CreateOrderRequest: userId, merchantId, tableNumber, orderItems.
      await api.submitOrder({
        userId: user.id,
        merchantId: partner.id,
        tableNumber,
        orderItems,
      });
      setScreen('pending');
    } catch {
      setSubmitError('Αποτυχία αποστολής. Δοκιμάστε ξανά.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOrder = (paymentMethod: PaymentMethod, xpDiscountXP: number) => {
    if (!isAuthenticated) {
      // Show auth gate — remember what the user chose
      pendingOrderRef.current = { paymentMethod, xpDiscountXP };
      setShowAuthGate(true);
      return;
    }
    void doSubmitOrder(paymentMethod, xpDiscountXP, true);
  };

  const handleAuthGateLogin = () => {
    setShowAuthGate(false);
    onOpenLogin?.(() => {
      const p = pendingOrderRef.current;
      if (p) void doSubmitOrder(p.paymentMethod, p.xpDiscountXP, true);
    });
  };

  const handleAuthGateGuest = () => {
    const pending = pendingOrderRef.current;
    pendingOrderRef.current = null;
    setShowAuthGate(false);
    setSubmitError(null);
    setSelectedProduct(null);
    setShowDotMenu(false);
    setShowTranslate(false);
    setShowInfo(false);

    if (pending) {
      // Continue checkout as guest: no XP redemption and no XP earnings.
      const fallbackPayment: PaymentMethod = pending.paymentMethod === 'xp' ? 'cash' : pending.paymentMethod;
      void doSubmitOrder(fallbackPayment, 0, false);
      return;
    }

    setScreen('menu');
  };

  const handleOrderAccepted = useCallback(() => setScreen('accepted'), []);
  const handleCelebrationDone = useCallback(() => {
    onOrderComplete?.(cartTotal.xp);
    setCart(new Map());
    setXpCart(new Map());
    setScreen('menu');
  }, [cartTotal.xp, onOrderComplete]);

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-[#0a0a0a]"
      ref={scrollRef}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* ── FLOATING MINI HEADER (scroll-triggered, solid black) ── */}
      <motion.div
        className="fixed inset-x-0 top-0 z-40"
        style={{
          opacity: miniHeaderOpacity,
          y: miniHeaderY,
          background: '#0a0a0a',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 4px 24px -4px rgba(0,0,0,0.8)',
        } as any}
      >
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          {/* Store name */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-white">{partner.name}</p>
            <p className="text-[10px] text-white/35">Τραπέζι #{tableNumber}</p>
          </div>

          {/* XP or Login */}
          {isAuthenticated ? (
            <motion.div
              className="flex items-center gap-1.5 rounded-xl px-3 py-2"
              style={{
                background: `${XP_GOLD}1a`,
                border: `1.5px solid ${XP_GOLD}60`,
                boxShadow: `0 0 16px 3px ${XP_GOLD}22`,
              }}
              animate={{ boxShadow: [`0 0 10px 2px ${XP_GOLD}14`, `0 0 22px 6px ${XP_GOLD}30`, `0 0 10px 2px ${XP_GOLD}14`] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Star className="h-4 w-4 fill-[#F5C518] text-[#F5C518]" strokeWidth={0} />
              <span className="text-sm font-black tabular-nums" style={{ color: XP_GOLD }}>
                {storeXpBalance.toLocaleString('el-GR')} XP
              </span>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              onClick={() => onOpenLogin?.()}
              whileTap={{ scale: 0.93 }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-black text-white"
              style={{ background: ACCENT }}
            >
              <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
              Login
            </motion.button>
          )}

          {/* Cart button — appears when cart has items */}
          <AnimatePresence>
            {(cartTotal.count + xpCartTotal.count) > 0 && (
              <motion.button
                type="button"
                onClick={() => setScreen('confirm')}
                whileTap={{ scale: 0.88 }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 480, damping: 26 }}
                className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: ACCENT }}
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={2.2} />
                <motion.span
                  key={cartTotal.count + xpCartTotal.count}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
                  style={{ background: XP_GOLD, color: '#000' }}
                >
                  {cartTotal.count + xpCartTotal.count}
                </motion.span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* 3-dots menu */}
          <motion.button
            type="button"
            onClick={() => setShowDotMenu((v) => !v)}
            whileTap={{ scale: 0.88 }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <MoreVertical className="h-4 w-4" strokeWidth={2.2} />
          </motion.button>
        </div>

      </motion.div>

      {/* ── PARALLAX HERO ── */}
      <div className="relative h-60 w-full overflow-hidden sm:h-72">
        <motion.img
          src={partner.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={partner.name}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ y: heroY, scale: heroScale }}
          draggable={false}
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/90"
          style={{ opacity: heroGradientOpacity }}
        />

        {/* Hero 3-dot button — top-right, always visible before scroll */}
        <div className="absolute right-4 z-[60]" style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
          <motion.button
            type="button"
            onClick={() => setShowDotMenu((v) => !v)}
            whileTap={{ scale: 0.88 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <MoreVertical className="h-4 w-4" strokeWidth={2.2} />
          </motion.button>
        </div>

        {/* Dot-menu popover (global fixed layer, always above banner/header) */}
        <AnimatePresence>
          {showDotMenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110]"
                onClick={() => setShowDotMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: -8 }}
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className="fixed right-4 top-[calc(env(safe-area-inset-top)+3.5rem)] z-[120] w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1c] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.9)]"
              >
                <button
                  type="button"
                  onClick={() => { setShowDotMenu(false); setShowInfo(true); }}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.05] active:bg-white/[0.08]"
                >
                  <Info className="h-4 w-4 shrink-0 text-white/50" strokeWidth={2} />
                  <span className="text-sm font-semibold text-white">More Info</span>
                </button>
                <div className="mx-4 h-px bg-white/[0.07]" />
                <button
                  type="button"
                  onClick={() => { setShowDotMenu(false); setShowTranslate(true); }}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.05] active:bg-white/[0.08]"
                >
                  <Languages className="h-4 w-4 shrink-0 text-white/50" strokeWidth={2} />
                  <span className="text-sm font-semibold text-white">Translate</span>
                </button>
                {isAuthenticated && (
                  <>
                    <div className="mx-4 h-px bg-white/[0.07]" />
                    <button
                      type="button"
                      onClick={() => { setShowDotMenu(false); logout(); }}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-red-500/10 active:bg-red-500/15"
                    >
                      <LogOut className="h-4 w-4 shrink-0 text-red-400" strokeWidth={2} />
                      <span className="text-sm font-semibold text-red-400">Αποσύνδεση</span>
                    </button>
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="absolute bottom-16 left-4 right-4">
          <NFCBadge entryMethod={entryMethod} />
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="mt-2 text-[1.75rem] font-black leading-tight text-white drop-shadow-lg sm:text-3xl"
          >
            {partner.name}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-white/75"
          >
            <span className="flex items-center gap-1 text-sm font-semibold">
              <Star className="h-3.5 w-3.5 fill-[#F5C518] text-[#F5C518]" strokeWidth={0} />
              {partner.rating.toFixed(1)}
            </span>
            <span className="text-white/30">·</span>
            <span className="rounded-full border border-white/30 bg-black/20 px-2.5 py-0.5 text-xs font-bold backdrop-blur-sm">
              Τραπέζι #{tableNumber}
            </span>
            {partner.deliveryTime && (
              <><span className="text-white/30">·</span><span className="text-xs">{partner.deliveryTime} λεπτ.</span></>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── XP DASHBOARD ── */}
      <XPDashboard partner={partner} user={user} storeXpBalance={storeXpBalance} />

      {/* ── MODE TOGGLE ── */}
      <ModeToggle mode={mode} onChange={(m) => { setMode(m); }} />

      {/* ── STICKY CATEGORY PILLS ── */}
      {(mode === 'eur' || mode === 'shop') && (
        <div
          className="sticky top-[56px] z-30"
          style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {mode === 'eur' ? (
            <CategoryPills categories={categories} active={activeCategory} onSelect={handleCategorySelect} />
          ) : (
            <LayoutGroup id="shop-category-pills">
              <div className="flex gap-1 overflow-x-auto px-4 pb-0 pt-3 no-scrollbar">
                {['Όλα', ...categories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setShopCategory(cat)}
                    className="relative shrink-0 px-3 pb-3 pt-1 text-sm font-bold z-0"
                  >
                    <span className={cn(
                      'relative flex items-center gap-1.5',
                      shopCategory === cat ? 'text-white' : 'text-white/45',
                    )}>
                      <span className="text-sm leading-none">
                        {cat === 'Όλα' ? '✦' : getCategoryEmoji(cat)}
                      </span>
                      <span>{cat}</span>
                    </span>
                    {shopCategory === cat && (
                      <motion.div
                        layoutId="shopCategoryActivePill"
                        className="absolute bottom-0 left-3 right-3 h-[2.5px] rounded-full"
                        style={{ background: XP_GOLD }}
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </LayoutGroup>
          )}
        </div>
      )}

      {/* ── CONTENT: MENU / ΠΡΟΣΦΟΡΕΣ / XP SHOP ── */}
      <AnimatePresence mode="wait">
        {mode === 'shop' ? (
          /* ── XP SHOP view ── */
          <motion.div
            key="shop"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
            className="px-4 pt-4"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">Αγορά με XP</p>
                <p className="text-base font-black text-white">Επίλεξε προϊόν</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
                style={{ background: `${XP_GOLD}18`, border: `1.5px solid ${XP_GOLD}55` }}>
                <Star className="h-3.5 w-3.5 fill-[#F5C518] text-[#F5C518]" strokeWidth={0} />
                <span className="text-sm font-black tabular-nums" style={{ color: XP_GOLD }}>
                  {availableXP.toLocaleString('el-GR')} XP
                </span>
              </div>
            </div>

            {/* Products grid — affordable first, then locked */}
            {(() => {
              const withXp = menu
                .filter((p) => shopCategory === 'Όλα' || p.category === shopCategory)
                .map((p) => ({
                  ...p,
                  xpCost: Math.round(p.price * XP_PER_EUR),
                  canBuy: availableXP >= Math.round(p.price * XP_PER_EUR),
                  inXpCart: xpCart.get(p.id) ?? 0,
                }));
              const affordable = withXp.filter((p) => p.canBuy);
              const locked = withXp.filter((p) => !p.canBuy);
              const ordered = [...affordable, ...locked];

              return (
                <div className="grid grid-cols-2 gap-3">
                  {ordered.map((product, i) => {
                    const shortfall = product.xpCost - availableXP;
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.3 }}
                        onClick={() => setSelectedProduct(menu.find((p) => p.id === product.id) ?? null)}
                        className="relative overflow-hidden rounded-2xl cursor-pointer"
                        style={{
                          background: product.canBuy
                            ? 'linear-gradient(145deg, #1c1400, #141414)'
                            : '#111',
                          border: product.canBuy
                            ? `1.5px solid ${XP_GOLD}44`
                            : '1.5px solid rgba(255,255,255,0.06)',
                          boxShadow: product.canBuy
                            ? `0 0 20px -4px ${XP_GOLD}22`
                            : 'none',
                        }}
                      >
                        {/* Image */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500"
                            style={{
                              filter: product.canBuy ? 'none' : 'grayscale(85%) brightness(0.45)',
                              transform: product.canBuy ? 'scale(1)' : 'scale(1)',
                            }}
                          />
                          {/* XP cost badge */}
                          <div
                            className="absolute left-2 top-2 flex items-center gap-1 rounded-lg px-2 py-1"
                            style={{
                              background: product.canBuy ? XP_GOLD : 'rgba(0,0,0,0.65)',
                              border: product.canBuy ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            <Star
                              className="h-3 w-3 shrink-0"
                              style={{ color: product.canBuy ? '#000' : 'rgba(255,255,255,0.35)' }}
                              fill={product.canBuy ? '#000' : 'rgba(255,255,255,0.35)'}
                              strokeWidth={0}
                            />
                            <span
                              className="text-[10px] font-black tabular-nums"
                              style={{ color: product.canBuy ? '#000' : 'rgba(255,255,255,0.35)' }}
                            >
                              {product.xpCost.toLocaleString('el-GR')} XP
                            </span>
                          </div>
                          {/* Lock overlay */}
                          {!product.canBuy && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm">
                                <Lock className="h-5 w-5 text-white/40" strokeWidth={2.2} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-3 space-y-2.5">
                          <p
                            className="text-xs font-bold leading-tight line-clamp-2"
                            style={{ color: product.canBuy ? 'white' : 'rgba(255,255,255,0.3)' }}
                          >
                            {product.name}
                          </p>

                          {product.canBuy ? (
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.93 }}
                              onClick={(e) => { e.stopPropagation(); addToXpCart(product.id); }}
                              className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-black text-black"
                              style={{ background: XP_GOLD }}
                            >
                              <Star className="h-3 w-3 fill-black text-black" strokeWidth={0} />
                              {product.inXpCart > 0 ? `Έχεις ${product.inXpCart} · Πρόσθεσε` : 'Αγορά με XP'}
                            </motion.button>
                          ) : (
                            <div className="rounded-xl py-2 text-center text-[10px] font-bold"
                              style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)' }}>
                              Χρειάζεσαι {shortfall.toLocaleString('el-GR')} XP ακόμα
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })()}
          </motion.div>
        ) : mode === 'xp' ? (
          /* ── ΠΡΟΣΦΟΡΕΣ view ── */
          <motion.div
            key="offers"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}
          >
            {partnerQuests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center justify-center px-8 py-20 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: `${XP_GOLD}15`, border: `1.5px solid ${XP_GOLD}30` }}>
                  <Tag className="h-7 w-7" style={{ color: XP_GOLD }} strokeWidth={1.8} />
                </div>
                <p className="text-base font-black text-white">Δεν υπάρχουν προσφορές</p>
                <p className="mt-2 text-sm text-white/40">Δες ξανά σύντομα για νέες προσφορές από το {partner.name}</p>
              </motion.div>
            ) : (
              <div className="px-4 pt-4">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30"
                >
                  {partnerQuests.length} προσφορές διαθέσιμες
                </motion.p>
                <motion.div
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
                  className="flex flex-col gap-3"
                >
                  {partnerQuests.map((quest) => (
                    <motion.div
                      key={quest.id}
                      variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
                      className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141414]"
                    >
                      {/* Banner image */}
                      {(quest.bannerImage || quest.storeImage) && (
                        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/6' }}>
                          <img
                            src={quest.bannerImage || quest.storeImage}
                            alt={quest.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                          {quest.multiplier && quest.multiplier > 1 && (
                            <div className="absolute left-3 top-3 rounded-lg px-2.5 py-1"
                              style={{ background: ACCENT }}>
                              <span className="text-xs font-black text-white">{quest.multiplier}× XP</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-4">
                        {/* Icon + title */}
                        <div className="flex items-start gap-3">
                          <span className="text-2xl leading-none">{quest.icon}</span>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-black leading-tight text-white">{quest.title}</h3>
                            {quest.description && (
                              <p className="mt-0.5 text-xs text-white/45 line-clamp-2">{quest.description}</p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs font-black" style={{ color: XP_GOLD }}>+{quest.reward}</p>
                            <p className="text-[10px] text-white/30">XP</p>
                          </div>
                        </div>

                        {/* Progress */}
                        {quest.total > 0 && (
                          <div className="mt-3 space-y-1.5">
                            <div className="flex justify-between text-[10px] text-white/30">
                              <span>Πρόοδος</span>
                              <span>{quest.progress}/{quest.total}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${ACCENT}90, ${ACCENT})` }}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (quest.progress / quest.total) * 100)}%` }}
                                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Expiry */}
                        {quest.expiresIn && (
                          <div className="mt-2.5 flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-white/25" strokeWidth={2} />
                            <span className="text-[10px] text-white/30">Λήγει σε {quest.expiresIn}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        ) : (
          /* ── MENU view ── */
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
          >
            {menu.length === 0 && (
              <p className="py-16 text-center text-sm text-white/30">Δεν βρέθηκαν προϊόντα.</p>
            )}

            {productsByCategory.map(({ cat, products }, sectionIndex) => (
              <section
                key={cat}
                data-category={cat}
                ref={(el) => {
                  if (el) sectionRefs.current.set(cat, el);
                  else sectionRefs.current.delete(cat);
                }}
              >
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIndex * 0.07, duration: 0.35 }}
                  className="flex items-center gap-3 px-4 pb-3 pt-5"
                >
                  <h2 className="text-base font-black text-white">{cat}</h2>
                  <div className="flex-1 h-px bg-white/[0.07]" />
                  <span className="text-[11px] font-medium text-white/30">{products.length} προϊόντα</span>
                </motion.div>

                <motion.div
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.055, delayChildren: 0.03 } } }}
                  className="flex flex-col"
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      quantity={cart.get(product.id) ?? 0}
                      onAdd={() => addToCart(product.id)}
                      onRemove={() => removeFromCart(product.id)}
                      onOpen={() => setSelectedProduct(product)}
                      mode={mode}
                      storeXpBalance={storeXpBalance}
                    />
                  ))}
                </motion.div>
              </section>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING CART BAR ── */}
      <AnimatePresence>
        {(cartTotal.count + xpCartTotal.count) > 0 && screen === 'menu' && (
          <CartBar
            itemCount={cartTotal.count + xpCartTotal.count}
            totalEur={cartTotal.eur}
            totalXpEarn={cartTotal.xp}
            reservedXP={xpCartTotal.xpCost}
            onCheckout={() => setScreen('confirm')}
          />
        )}
      </AnimatePresence>

      {/* ── TRANSLATE SHEET ── */}
      <AnimatePresence>
        {showTranslate && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
              onClick={() => setShowTranslate(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="fixed inset-x-0 bottom-0 z-[201] rounded-t-[1.75rem] bg-[#111] px-5 pt-3"
              style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15" />
              <div className="mb-1 flex items-center gap-2">
                <Globe className="h-5 w-5 text-white/50" strokeWidth={2} />
                <h3 className="text-lg font-black text-white">Γλώσσα Καταλόγου</h3>
              </div>
              <p className="mb-5 text-sm text-white/40">Επίλεξε γλώσσα για να μεταφραστεί ο κατάλογος</p>
              {[
                { code: 'el' as const, label: 'Ελληνικά', flag: '🇬🇷' },
                { code: 'en' as const, label: 'English', flag: '🇬🇧' },
              ].map((lang) => (
                <motion.button
                  key={lang.code}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setLanguage(lang.code); setShowTranslate(false); }}
                  className="mb-2 flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left"
                  style={language === lang.code
                    ? { borderColor: ACCENT, background: `${ACCENT}18` }
                    : { borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="flex-1 text-base font-bold text-white">{lang.label}</span>
                  {language === lang.code && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: ACCENT }}>
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MORE INFO SHEET ── */}
      <AnimatePresence>
        {showInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm"
              onClick={() => setShowInfo(false)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="fixed inset-x-0 bottom-0 z-[201] rounded-t-[1.75rem] bg-[#111] px-5 pt-3"
              style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/15" />
              <div className="mb-5 flex items-center gap-2">
                <Info className="h-5 w-5 text-white/50" strokeWidth={2} />
                <h3 className="text-lg font-black text-white">Πληροφορίες</h3>
              </div>
              {/* Store image small */}
              <div className="mb-4 overflow-hidden rounded-2xl" style={{ aspectRatio: '16/6' }}>
                <img src={partner.image || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={partner.name} className="h-full w-full object-cover" />
              </div>
              <h4 className="text-xl font-black text-white">{partner.name}</h4>
              {partner.location && (
                <div className="mt-3 flex items-center gap-2 text-sm text-white/50">
                  <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>{partner.location}</span>
                </div>
              )}
              <div className="mt-3 flex items-center gap-2 text-sm text-white/50">
                <Star className="h-4 w-4 shrink-0 fill-[#F5C518] text-[#F5C518]" strokeWidth={0} />
                <span>{partner.rating.toFixed(1)} βαθμολογία</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-white/50">
                <Zap className="h-4 w-4 shrink-0" style={{ color: XP_GOLD }} strokeWidth={2} />
                <span>Κέρδισε XP με κάθε παραγγελία στο <span className="font-semibold text-white">{partner.name}</span></span>
              </div>
              <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Τρέχον Τραπέζι</p>
                <p className="mt-1 text-2xl font-black text-white">#{tableNumber}</p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowInfo(false)}
                className="mt-4 w-full rounded-2xl py-3.5 text-sm font-black text-white"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                Κλείσιμο
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── PRODUCT MODAL ── */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            key={selectedProduct.id}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(qty) => {
              if (mode === 'shop') {
                for (let i = 0; i < qty; i++) addToXpCart(selectedProduct.id);
              } else {
                for (let i = 0; i < qty; i++) addToCart(selectedProduct.id);
              }
            }}
            mode={mode}
            storeXpBalance={mode === 'shop' ? availableXP : storeXpBalance}
          />
        )}
      </AnimatePresence>

      {/* ── SCREEN OVERLAYS ── */}
      <AnimatePresence>
        {screen === 'confirm' && (
          <OrderConfirmScreen
            key="confirm"
            cart={cartItems}
            xpCartItems={xpCartItems}
            xpCartReservedXP={xpCartTotal.xpCost}
            totalEur={cartTotal.eur}
            totalXpEarn={cartTotal.xp}
            tableNumber={tableNumber}
            storeXpBalance={availableXP}
            onConfirm={handleConfirmOrder}
            onCancel={() => setScreen('menu')}
            onAddItem={addToCart}
            onRemoveItem={removeFromCart}
            onAddXpItem={addToXpCart}
            onRemoveXpItem={removeFromXpCart}
            isSubmitting={isSubmitting}
            error={submitError}
          />
        )}
        {screen === 'pending' && (
          <OrderPendingScreen
            key="pending"
            totalXpEarn={cartTotal.xp}
            merchantId={partner.id}
            userId={user?.id ?? ''}
            tableNumber={tableNumber}
            onOrderAccepted={handleOrderAccepted}
          />
        )}
        {screen === 'accepted' && (
          <XPCelebrationScreen
            key="accepted"
            xpEarned={cartTotal.xp}
            onContinue={handleCelebrationDone}
          />
        )}
        {showAuthGate && (
          <AuthGateScreen
            key="auth-gate"
            xpEarn={cartTotal.xp}
            onLogin={handleAuthGateLogin}
            onGuest={handleAuthGateGuest}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnbitScanMenuPage;
