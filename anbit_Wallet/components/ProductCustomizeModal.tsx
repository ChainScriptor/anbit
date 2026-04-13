import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Minus,
  Plus,
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
  const [selectedSize, setSelectedSize] = useState<string>('');
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
  const totalXp = safeProduct.xpReward * quantity;

  const handleAdd = () => {
    if (!product) return;
    if (!selectedSize) return;
    const options: ProductCartOptions = {
      extras: selectedExtras.join(','),
    };
    if (selectedSize) options.size = selectedSize;
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
        className="fixed inset-0 z-[260] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="relative mx-auto mt-[4dvh] flex h-[96dvh] max-h-[96dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-[24px] bg-[#0e0e0e] text-white antialiased"
        >
          <div className="flex flex-1 flex-col overflow-y-auto overscroll-contain pb-36 hide-scrollbar">
            <main className="mx-auto w-full max-w-2xl pb-6">
              <section className="relative aspect-[4/3] w-full overflow-hidden">
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/60 active:scale-95"
                    aria-label="Close"
                  >
                    <X className="h-6 w-6" strokeWidth={2.2} />
                  </button>
                  <img
                    src={safeProduct.image}
                    alt={safeProduct.name}
                    className="h-full w-full object-cover object-center"
                    loading="eager"
                    decoding="async"
                  />
              </section>

              <article className="relative z-10 px-6 pt-5">
                <div className="flex flex-col gap-2">
                  <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
                    {safeProduct.name}
                  </h1>
                  <div className="flex items-end gap-3">
                    <div className="text-4xl font-bold text-white">€{safeProduct.price.toFixed(2)}</div>
                    <div className="pb-1 text-sm font-bold text-[#60a5fa]">+{safeProduct.xpReward} XP</div>
                  </div>
                  {safeProduct.description ? (
                    <p className="mt-2 text-base leading-relaxed text-white/80">{safeProduct.description}</p>
                  ) : null}
                </div>

                <section className="mt-10">
                  <div className="mb-4 flex items-end justify-between">
                    <h3 className="text-2xl font-bold text-white">{t('pickSize')}</h3>
                    <span className="rounded-full bg-blue-600/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-400">Required</span>
                  </div>
                  <div className="space-y-3">
                    {sizeOptions.map((opt) => {
                      const isSelected = selectedSize === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className="flex cursor-pointer items-center justify-between rounded-xl bg-[#131313] p-4 transition-colors hover:bg-[#191919]"
                        >
                          <span className="font-medium text-white">{opt.label}</span>
                          <input
                            type="radio"
                            name="size-option"
                            checked={isSelected}
                            onChange={() => setSelectedSize(opt.id)}
                            className="sr-only"
                          />
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                              isSelected
                                ? 'border-[#2563eb] bg-[#2563eb] text-white'
                                : 'border-[#484848] bg-transparent text-transparent'
                            }`}
                            aria-hidden
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>

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

              <section className="mt-10">
                <div className="mb-4 flex items-end justify-between">
                  <h3 className="text-2xl font-bold text-white">Πρόσθεσε extra</h3>
                  <span className="text-xs font-medium text-white/65">Optional</span>
                </div>
                <div className="space-y-3">
                  <div className="mb-4 flex items-start justify-between gap-3">
                  </div>
                    {extraOptions.map((opt) => {
                      const isSelected = selectedExtras.includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className="flex cursor-pointer items-center justify-between rounded-xl bg-[#131313] p-4 transition-colors hover:bg-[#191919]"
                        >
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-[15px] font-medium text-white">{opt.label}</span>
                            <span className="text-sm text-white/65">+€{opt.price.toFixed(2)}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleExtra(opt.id)}
                            className="sr-only"
                          />
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                              isSelected
                                ? 'border-[#2563eb] bg-[#2563eb] text-white'
                                : 'border-[#484848] bg-transparent text-transparent'
                            }`}
                            aria-hidden
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                        </label>
                      );
                    })}
                </div>
              </section>
              </article>
            </main>
          </div>

          <footer
            className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/5 bg-[#0e0e0e] px-6 pt-3 shadow-[0_-8px_32px_rgba(0,0,0,0.5)]"
            style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
          >
            <div className="relative mx-auto flex max-w-lg items-center gap-3 sm:gap-4">
              <div className="flex items-center rounded-xl bg-[#262626] p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/[0.07] active:scale-90"
                >
                  <Minus className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <span className="min-w-[2rem] text-center text-lg font-bold tabular-nums text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/[0.07] active:scale-90"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedSize}
                className="flex h-14 flex-1 items-center justify-between rounded-xl bg-[#2563eb] px-4 text-white shadow-[0_10px_28px_-8px_rgba(37,99,235,0.55)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <span className="text-[15px] font-black tracking-wide">ΠΡΟΣΘΗΚΗ</span>
                <span className="flex flex-col items-end leading-tight">
                  <span className="rounded-md bg-black/20 px-2.5 py-0.5 text-sm font-extrabold tabular-nums text-white">
                    €{totalPrice.toFixed(2)}
                  </span>
                  {totalXp > 0 ? (
                    <span className="mt-0.5 text-[11px] font-bold text-white/90">+{totalXp} XP</span>
                  ) : null}
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
