import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Check,
  ChevronRight,
  EggFried,
  ChefHat,
  Layers,
  Coffee,
  Milk,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';
import type { ProductCartOptions } from '../types';
import { useLanguage } from '../context/LanguageContext';
import AnbitWordmark from './AnbitWordmark';

const SUGAR_AMOUNT_KEYS = ['sugarNone', 'sugarLight', 'sugarMedium', 'sugarSweet', 'sugarExtra'] as const;
const SUGAR_TYPE_KEYS = ['sugarWhite', 'sugarBrown', 'sugarStevia', 'sugarRaw'] as const;

function isCoffeeProduct(product: Product): boolean {
  const cat = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  return (
    cat.includes('coffee') ||
    cat.includes('καφ') ||
    cat.includes('καφέ') ||
    name.includes('coffee') ||
    name.includes('espresso') ||
    name.includes('καφές') ||
    name.includes('καφε')
  );
}

interface ProductCustomizeModalProps {
  product: Product | null;
  onClose: () => void;
  onAdd: (
    product: Product,
    quantity: number,
    options: ProductCartOptions | undefined,
    comments: string | undefined
  ) => void;
}

const SUGAR_AMOUNT_VALUES = ['none', 'light', 'medium', 'sweet', 'extra'] as const;
const SUGAR_TYPE_VALUES = ['white', 'brown', 'stevia', 'raw'] as const;

type PriceOption = {
  id: string;
  label: string;
  price: number;
  includedLabel?: string;
};

/** Λεπτή γραμμή-κύμα σε λευκό φόντο (διαχωριστικό) */
function WaveStrokeDivider({ flip }: { flip?: boolean }) {
  const d = flip
    ? 'M0,6 C220,22 440,2 660,14 C880,26 1040,8 1200,12'
    : 'M0,14 C220,2 440,22 660,8 C880,-6 1040,18 1200,6';
  return (
    <div className="h-4 w-full overflow-hidden text-[#0a0a0a]/[0.14]" aria-hidden>
      <svg
        viewBox="0 0 1200 20"
        preserveAspectRatio="none"
        className={`h-full w-full ${flip ? 'scale-y-[-1]' : ''}`}
      >
        <path d={d} fill="none" stroke="currentColor" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/** Μικρό κύμα ανάμεσα σε σκούρα panels */
function WaveDarkGap() {
  return (
    <div className="flex justify-center py-1" aria-hidden>
      <svg
        viewBox="0 0 200 8"
        className="h-2 w-24 text-white/20 sm:w-32"
        aria-hidden
      >
        <path
          d="M0,4 Q50,0 100,4 T200,4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/** Κύμα πάνω από το footer (λευκό γέμισμα + γραμμή) */
function WaveFooterTop() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full">
        <path
          d="M0,64 C120,28 240,28 360,64 C480,100 600,100 720,64 C840,28 960,28 1080,64 C1140,82 1170,90 1200,96 L1200,120 L0,120 Z"
          fill="#ffffff"
          fillOpacity={0.98}
        />
        <path
          d="M0,62 C120,26 240,26 360,62 C480,98 600,98 720,62 C840,26 960,26 1080,62 C1140,80 1170,88 1200,94"
          fill="none"
          stroke="#0a0a0a"
          strokeOpacity={0.1}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

const ProductCustomizeModal: React.FC<ProductCustomizeModalProps> = ({
  product,
  onClose,
  onAdd,
}) => {
  const safeProduct: Product = product ?? {
    id: '',
    name: '',
    description: '',
    price: 0,
    xpReward: 0,
    image: '',
    category: '',
  };

  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [sugarAmount, setSugarAmount] = useState<string>('none');
  const [sugarType, setSugarType] = useState<string>('white');
  const [selectedSize, setSelectedSize] = useState<string>('standard');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const showCoffeeOptions = isCoffeeProduct(safeProduct);
  const sizeOptions: PriceOption[] = showCoffeeOptions
    ? [
        { id: 'single', label: 'Single', price: 0, includedLabel: 'Included' },
        { id: 'double', label: 'Double Shot', price: 0.8 },
      ]
    : [
        { id: 'standard', label: 'Standard', price: 0, includedLabel: 'Included' },
        { id: 'large', label: 'Large', price: 2.0 },
      ];

  const extraOptions: PriceOption[] = showCoffeeOptions
    ? [
        { id: 'extraShot', label: 'Extra Espresso Shot', price: 0.9 },
        { id: 'oatMilk', label: 'Oat Milk', price: 0.6 },
        { id: 'cinnamon', label: 'Cinnamon', price: 0.2 },
      ]
    : [
        { id: 'friedEgg', label: 'Fried Egg', price: 1.2 },
        { id: 'bacon', label: 'Extra Smoked Bacon', price: 2.0 },
        { id: 'extraCheese', label: 'Extra Truffle Cheese', price: 1.5 },
      ];

  const extraIcon = (id: string): React.ComponentType<{ className?: string }> | null => {
    switch (id) {
      case 'friedEgg':
        return EggFried;
      case 'bacon':
        return ChefHat;
      case 'extraCheese':
        return Layers;
      case 'extraShot':
        return Coffee;
      case 'oatMilk':
        return Milk;
      case 'cinnamon':
        return Sparkles;
      default:
        return null;
    }
  };

  const selectedSizePrice = useMemo(
    () => sizeOptions.find((opt) => opt.id === selectedSize)?.price ?? 0,
    [sizeOptions, selectedSize],
  );

  const selectedExtrasPrice = useMemo(
    () =>
      selectedExtras.reduce((sum, id) => {
        const found = extraOptions.find((opt) => opt.id === id);
        return sum + (found?.price ?? 0);
      }, 0),
    [extraOptions, selectedExtras],
  );

  const extraPrice = selectedSizePrice + selectedExtrasPrice;
  const totalPrice = safeProduct.price * quantity + extraPrice;

  const handleAdd = () => {
    if (!product) return;
    const options: ProductCartOptions = {
      size: selectedSize,
      extras: selectedExtras.join(','),
    };
    if (showCoffeeOptions) {
      options.sugarAmount = sugarAmount;
      options.sugarType = sugarType;
    }
    onAdd(product, quantity, options, comments.trim() || undefined);
    onClose();
  };

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={product.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[260] bg-white"
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          className="relative flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden bg-white text-[#0a0a0a] antialiased"
        >
          <header
            className="fixed left-0 right-0 top-0 z-20 flex min-h-16 items-center justify-between border-b border-white/[0.08] bg-[#0a0a0a] px-5 pt-[env(safe-area-inset-top)] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)] sm:px-6"
          >
            <div className="flex h-16 items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/[0.12] active:scale-95"
                aria-label="Back"
              >
                <ArrowLeft className="h-6 w-6" strokeWidth={2.2} />
              </button>
              <AnbitWordmark className="text-2xl text-white sm:text-[1.65rem]" />
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/[0.12] active:scale-95"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </header>

          <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain pb-36 pt-[calc(4rem+env(safe-area-inset-top))]">
            <main className="mx-auto w-full max-w-lg space-y-4 px-4 pb-4 pt-2 sm:space-y-5 sm:px-6 sm:pt-3">
              <article className="overflow-hidden rounded-[1.75rem] border border-[#0a0a0a]/[0.08] bg-white shadow-[0_24px_56px_-20px_rgba(10,10,10,0.22)] ring-1 ring-black/[0.03]">
                <div className="relative h-[min(48vh,288px)] w-full min-h-[200px] bg-neutral-100 sm:h-[min(42vh,320px)]">
                  <img
                    src={safeProduct.image}
                    alt={safeProduct.name}
                    className="h-full w-full object-cover object-center"
                    loading="eager"
                    decoding="async"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.12] via-transparent to-black/[0.18]"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent"
                    aria-hidden
                  />
                </div>

                <div className="relative border-t border-[#0a0a0a]/[0.06] bg-white px-5 pb-5 pt-5 sm:px-6 sm:pb-6 sm:pt-6">
                  <h1 className="text-[1.6rem] font-extrabold leading-[1.2] tracking-tight text-[#0a0a0a] sm:text-[2rem]">
                    {safeProduct.name}
                  </h1>
                  {safeProduct.description ? (
                    <p className="mt-3 max-w-prose text-[15px] leading-relaxed text-[#0a0a0a]/68 sm:text-base">
                      {safeProduct.description}
                    </p>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-4 border-t border-dashed border-[#0a0a0a]/[0.12] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0a0a0a]/40">Price</p>
                      <p className="mt-1 text-xs text-[#0a0a0a]/50">Base · full total on Add button</p>
                    </div>
                    <div className="flex items-center gap-3 sm:justify-end">
                      <div className="inline-flex items-baseline gap-0.5 rounded-2xl bg-[#0a0a0a] px-5 py-3 shadow-[0_10px_28px_-8px_rgba(10,10,10,0.55)] ring-1 ring-white/10">
                        <span className="text-lg font-bold text-white/90">€</span>
                        <span className="text-[1.85rem] font-extrabold tabular-nums leading-none tracking-tight text-white sm:text-[2rem]">
                          {safeProduct.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <WaveStrokeDivider />

              {safeProduct.xpReward > 0 && (
                <div className="flex items-center justify-between gap-3 rounded-[1.75rem] bg-[#0a0a0a] p-4 pr-3 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.45)] ring-1 ring-white/10 sm:p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/25 to-white/10 shadow-inner">
                      <Star className="h-5 w-5 fill-white text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-snug text-white">
                        Earn {safeProduct.xpReward} XP with this item
                      </p>
                      <p className="mt-0.5 text-xs text-white/50">Progress towards Gold Tier</p>
                    </div>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                    <ChevronRight className="h-5 w-5 text-white/80" strokeWidth={2} />
                  </div>
                </div>
              )}

              {safeProduct.xpReward > 0 ? <WaveDarkGap /> : null}

              <section>
                <div className="relative overflow-hidden rounded-[1.75rem] bg-[#0a0a0a] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.09]">
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-5 opacity-[0.35]"
                    aria-hidden
                  >
                    <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="h-full w-full text-white/25">
                      <path
                        d="M0,18 C200,2 400,28 600,12 C800,-4 1000,22 1200,8 L1200,0 L0,0 Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="relative p-5 sm:p-6">
                  <h3 className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Choose your size</h3>
                  <p className="mb-4 text-xs text-white/35">Select a size for your order</p>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {sizeOptions.map((opt) => {
                      const isSelected = selectedSize === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedSize(opt.id)}
                          className={`flex flex-col items-center justify-center rounded-2xl px-3 py-4 transition-all duration-200 sm:py-5 ${
                            isSelected
                              ? 'bg-white/[0.14] ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                              : 'bg-white/[0.06] ring-1 ring-white/[0.08] hover:bg-white/[0.09] hover:ring-white/15'
                          }`}
                        >
                          <span className="mb-1 text-center text-[15px] font-bold text-white">{opt.label}</span>
                          <span className={`text-xs ${opt.price > 0 ? 'font-semibold text-white/90' : 'italic text-white/45'}`}>
                            {opt.price > 0 ? `+€${opt.price.toFixed(2)}` : opt.includedLabel ?? 'Included'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  </div>
                </div>
              </section>

              <WaveDarkGap />

              {showCoffeeOptions && (
                <>
                  <section>
                    <div className="rounded-[1.75rem] bg-[#0a0a0a] p-5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.09] sm:p-6">
                      <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{t('pickSugarAmount')}</h3>
                      <div className="flex flex-col gap-2">
                        {SUGAR_AMOUNT_KEYS.map((key, i) => {
                          const value = SUGAR_AMOUNT_VALUES[i];
                          const isSelected = sugarAmount === value;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSugarAmount(value)}
                              className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors ${
                                isSelected
                                  ? 'bg-white/[0.12] ring-1 ring-white/20'
                                  : 'bg-white/[0.05] ring-1 ring-white/[0.06] hover:bg-white/[0.08]'
                              }`}
                            >
                              <span className="text-[15px] text-white/95">{t(key)}</span>
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                  isSelected ? 'border-white bg-white text-[#0a0a0a]' : 'border-white/30 bg-transparent'
                                }`}
                              >
                                {isSelected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="rounded-[1.75rem] bg-[#0a0a0a] p-5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.09] sm:p-6">
                      <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">{t('pickSugarType')}</h3>
                      <div className="flex flex-col gap-2">
                        {SUGAR_TYPE_KEYS.map((key, i) => {
                          const value = SUGAR_TYPE_VALUES[i];
                          const isSelected = sugarType === value;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSugarType(value)}
                              className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors ${
                                isSelected
                                  ? 'bg-white/[0.12] ring-1 ring-white/20'
                                  : 'bg-white/[0.05] ring-1 ring-white/[0.06] hover:bg-white/[0.08]'
                              }`}
                            >
                              <span className="text-[15px] text-white/95">{t(key)}</span>
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                                  isSelected ? 'border-white bg-white text-[#0a0a0a]' : 'border-white/30 bg-transparent'
                                }`}
                              >
                                {isSelected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </section>

                  <WaveDarkGap />
                </>
              )}

              <section>
                <div className="rounded-[1.75rem] bg-[#0a0a0a] p-5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.09] sm:p-6">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Extra Toppings</h3>
                      <p className="mt-1 text-xs text-white/30">Customize your item</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70 ring-1 ring-white/15">
                      Optional
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {extraOptions.map((opt) => {
                      const isSelected = selectedExtras.includes(opt.id);
                      const Icon = extraIcon(opt.id);
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 sm:px-4 ${
                            isSelected ? 'bg-white/[0.12] ring-1 ring-white/18' : 'bg-white/[0.05] ring-1 ring-white/[0.06]'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] ring-1 ring-white/10">
                              {Icon ? <Icon className="h-5 w-5 text-white/55" /> : null}
                            </div>
                            <span className="truncate text-[15px] font-medium text-white">{opt.label}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <span className="text-sm tabular-nums text-white/50">+€{opt.price.toFixed(2)}</span>
                            <button
                              type="button"
                              onClick={() => toggleExtra(opt.id)}
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
                                isSelected
                                  ? 'border-white bg-white text-[#0a0a0a] shadow-sm'
                                  : 'border-white/35 text-white hover:border-white/60 hover:bg-white/[0.06]'
                              }`}
                              aria-pressed={isSelected}
                            >
                              {isSelected ? (
                                <Check className="h-4 w-4" strokeWidth={3} />
                              ) : (
                                <Plus className="h-4 w-4" strokeWidth={2.5} />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              <WaveStrokeDivider flip />

              <section>
                <div className="rounded-[1.75rem] bg-[#0a0a0a] p-5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.09] sm:p-6">
                  <h3 className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Special Instructions</h3>
                  <p className="mb-3 text-xs text-white/30">Optional note for the kitchen</p>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder={t('commentsPlaceholder')}
                    rows={3}
                    className="min-h-[5.5rem] w-full resize-none rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-3.5 text-[15px] leading-relaxed text-white placeholder:text-white/35 focus:border-white/25 focus:outline-none focus:ring-2 focus:ring-white/10"
                  />
                </div>
              </section>
            </main>
          </div>

          <footer
            className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#0a0a0a]/[0.08] bg-white/95 px-5 pt-3 shadow-[0_-8px_30px_-4px_rgba(10,10,10,0.08)] backdrop-blur-md sm:px-6 sm:pt-4"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            <WaveFooterTop />
            <div className="relative mx-auto flex max-w-lg items-center gap-3 sm:gap-4">
              <div className="flex items-center rounded-full border border-[#0a0a0a]/[0.1] bg-[#0a0a0a]/[0.04] p-0.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a]/[0.07] active:scale-90"
                >
                  <Minus className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <span className="min-w-[2rem] text-center text-lg font-bold tabular-nums text-[#0a0a0a]">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[#0a0a0a] transition-colors hover:bg-[#0a0a0a]/[0.07] active:scale-90"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="flex h-[3.25rem] flex-1 items-center justify-center gap-2.5 rounded-full bg-[#0a0a0a] px-5 text-[15px] font-extrabold tracking-wide text-white shadow-[0_8px_24px_-6px_rgba(10,10,10,0.45)] transition-all active:scale-[0.98] sm:h-14 sm:gap-3 sm:text-base"
              >
                <span>Add</span>
                <span className="rounded-lg bg-white/18 px-2.5 py-1 text-sm font-bold tabular-nums text-white">
                  €{totalPrice.toFixed(2)}
                </span>
              </button>
            </div>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductCustomizeModal;
