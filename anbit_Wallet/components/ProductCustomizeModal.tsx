import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, ShoppingBag, Star, Check } from 'lucide-react';
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
        { id: 'extraCheese', label: 'Extra Cheese', price: 1.5 },
        { id: 'bacon', label: 'Extra Bacon', price: 2.0 },
        { id: 'friedEgg', label: 'Fried Egg', price: 1.2 },
      ];

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
      <div className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70"
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-lg bg-black rounded-t-3xl sm:rounded-3xl h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col shadow-2xl text-white"
        >
          <header className="fixed top-0 left-0 right-0 z-20 h-16 px-6 flex items-center justify-between bg-neutral-950/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button type="button" onClick={onClose} className="text-[#E63533] active:scale-95 transition-transform">
                <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <span className="text-[#E63533] font-black italic tracking-tighter text-3xl">Anbit</span>
            </div>
            <button type="button" className="text-[#E63533]">
              <ShoppingBag className="w-5 h-5" strokeWidth={2.4} />
            </button>
          </header>

          <div className="overflow-y-auto flex-1 pb-36">
            <section className="relative w-full h-[360px] overflow-hidden">
              <img src={safeProduct.image} alt={safeProduct.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            </section>

            <main className="px-6 -mt-12 relative z-10">
              <div className="flex justify-between items-end mb-6 gap-3">
                <div className="flex-1">
                  <h1 className="font-extrabold text-4xl tracking-tight text-white mb-1 leading-tight">{safeProduct.name}</h1>
                  <p className="text-neutral-400 text-sm">{safeProduct.description}</p>
                </div>
                <span className="text-[#E63533] font-bold text-4xl">€{safeProduct.price.toFixed(2)}</span>
              </div>

              {safeProduct.xpReward > 0 && (
                <div className="bg-[#CA8A04]/10 border border-[#CA8A04]/20 rounded-2xl p-4 mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#CA8A04] p-2 rounded-full flex items-center justify-center">
                      <Star className="w-4 h-4 text-black fill-current" />
                    </div>
                    <div>
                      <p className="text-[#CA8A04] font-bold text-sm">Earn {safeProduct.xpReward} XP with this item</p>
                      <p className="text-neutral-500 text-xs">Progress towards Gold Tier</p>
                    </div>
                  </div>
                </div>
              )}

              <section className="mb-10">
                <h3 className="font-bold text-xs uppercase tracking-widest text-white/60 mb-4">Choose your size</h3>
                <div className="grid grid-cols-2 gap-4">
                  {sizeOptions.map((opt) => {
                    const isSelected = selectedSize === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedSize(opt.id)}
                        className={`p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-[#E63533] bg-neutral-900' : 'border-transparent bg-neutral-900/70'
                          }`}
                      >
                        <div className="text-white font-bold mb-1">{opt.label}</div>
                        <div className={`text-xs ${opt.price > 0 ? 'text-[#E63533] font-bold' : 'text-neutral-500 italic'}`}>
                          {opt.price > 0 ? `+€${opt.price.toFixed(2)}` : opt.includedLabel ?? 'Included'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {showCoffeeOptions && (
                <>
                  <section className="mb-8">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-white/60 mb-4">{t('pickSugarAmount')}</h3>
                    <div className="space-y-3">
                      {SUGAR_AMOUNT_KEYS.map((key, i) => {
                        const value = SUGAR_AMOUNT_VALUES[i];
                        const isSelected = sugarAmount === value;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSugarAmount(value)}
                            className="w-full flex items-center justify-between p-4 bg-neutral-900/60 rounded-2xl"
                          >
                            <span className="text-sm text-white">{t(key)}</span>
                            <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#E63533] bg-[#E63533]' : 'border-neutral-600'}`}>
                              {isSelected ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="mb-8">
                    <h3 className="font-bold text-xs uppercase tracking-widest text-white/60 mb-4">{t('pickSugarType')}</h3>
                    <div className="space-y-3">
                      {SUGAR_TYPE_KEYS.map((key, i) => {
                        const value = SUGAR_TYPE_VALUES[i];
                        const isSelected = sugarType === value;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSugarType(value)}
                            className="w-full flex items-center justify-between p-4 bg-neutral-900/60 rounded-2xl"
                          >
                            <span className="text-sm text-white">{t(key)}</span>
                            <span className={`w-6 h-6 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#E63533] bg-[#E63533]' : 'border-neutral-600'}`}>
                              {isSelected ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              <section className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-white/60">Extra Toppings</h3>
                  <span className="text-neutral-500 text-xs bg-neutral-900 px-3 py-1 rounded-full">Optional</span>
                </div>
                <div className="space-y-3">
                  {extraOptions.map((opt) => {
                    const isSelected = selectedExtras.includes(opt.id);
                    return (
                      <div key={opt.id} className="flex items-center justify-between p-4 bg-neutral-900/60 rounded-2xl">
                        <span className="text-white font-medium">{opt.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-neutral-500 text-sm">+€{opt.price.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => toggleExtra(opt.id)}
                            className={`w-6 h-6 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#E63533] bg-[#E63533] text-white' : 'border-neutral-700 text-[#E63533]'
                              }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="mb-10">
                <h3 className="font-bold text-xs uppercase tracking-widest text-white/60 mb-4">Special Instructions</h3>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={t('commentsPlaceholder')}
                  rows={3}
                  className="w-full bg-neutral-900 border-none rounded-2xl p-4 text-white placeholder-neutral-600 focus:ring-1 focus:ring-[#E63533] resize-none"
                />
              </section>
            </main>
          </div>

          <footer className="absolute bottom-0 left-0 right-0 bg-neutral-950/90 backdrop-blur-xl px-6 pt-4 pb-8 flex items-center gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center bg-neutral-900 rounded-full p-1 border border-neutral-800">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
              >
                <Minus className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <span className="px-4 font-bold text-lg text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#E63533] active:scale-90 transition-all"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 bg-[#E63533] text-white h-14 rounded-full font-extrabold flex items-center justify-between px-6 active:scale-95 transition-all"
            >
              <span>Add to Order</span>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">€{totalPrice.toFixed(2)}</span>
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductCustomizeModal;
