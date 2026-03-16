import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
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

const ProductCustomizeModal: React.FC<ProductCustomizeModalProps> = ({
  product,
  onClose,
  onAdd,
}) => {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [sugarAmount, setSugarAmount] = useState<string>('none');
  const [sugarType, setSugarType] = useState<string>('white');
  const [comments, setComments] = useState('');

  if (!product) return null;

  const showCoffeeOptions = isCoffeeProduct(product);
  const extraPrice = 0;
  const totalPrice = product.price * quantity + extraPrice;

  const handleAdd = () => {
    const options: ProductCartOptions | undefined = showCoffeeOptions
      ? { sugarAmount, sugarType }
      : undefined;
    onAdd(product, quantity, options, comments.trim() || undefined);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          <div className="overflow-y-auto flex-1 p-6 pb-8">
            <h2 className="text-xl font-bold text-black tracking-tight">
              {product.name}
            </h2>
            {product.description && (
              <p className="text-sm text-black/70 mt-1">
                {product.description}
              </p>
            )}

            {showCoffeeOptions && (
              <>
                <div className="mt-6">
                  <p className="text-sm font-semibold text-black mb-2">
                    {t('pickSugarAmount')} *
                  </p>
                  <div className="space-y-2">
                    {SUGAR_AMOUNT_KEYS.map((key, i) => {
                      const value = SUGAR_AMOUNT_VALUES[i];
                      const label = t(key);
                      const isSelected = sugarAmount === value;
                      return (
                        <label
                          key={key}
                          className="flex items-center justify-between py-2 px-3 rounded-xl border border-black/10 hover:bg-black/[0.02] cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-[#ec4899] bg-[#ec4899]'
                                  : 'border-black/30'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-black capitalize">
                              {label}
                            </span>
                          </div>
                          <span className="text-xs text-black/60">+ €0.00</span>
                          <input
                            type="radio"
                            name="sugarAmount"
                            checked={isSelected}
                            onChange={() => setSugarAmount(value)}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-black mb-2">
                    {t('pickSugarType')} *
                  </p>
                  <div className="space-y-2">
                    {SUGAR_TYPE_KEYS.map((key, i) => {
                      const value = SUGAR_TYPE_VALUES[i];
                      const label = t(key);
                      const isSelected = sugarType === value;
                      return (
                        <label
                          key={key}
                          className="flex items-center justify-between py-2 px-3 rounded-xl border border-black/10 hover:bg-black/[0.02] cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-black/50 bg-black/50'
                                  : 'border-black/30'
                              }`}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="text-sm font-medium text-black capitalize">
                              {label}
                            </span>
                          </div>
                          <span className="text-xs text-black/60">+ €0.00</span>
                          <input
                            type="radio"
                            name="sugarType"
                            checked={isSelected}
                            onChange={() => setSugarType(value)}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="mt-6">
              <p className="text-sm font-semibold text-black mb-2">
                {t('commentsOptional')}
              </p>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t('commentsPlaceholder')}
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-black text-sm placeholder:text-black/40 focus:ring-2 focus:ring-black/20 focus:outline-none resize-none"
              />
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl border-2 border-red-500 text-red-500 flex items-center justify-center font-bold hover:bg-red-50 transition-colors"
                >
                  <Minus className="w-4 h-4" strokeWidth={2.5} />
                </button>
                <span className="min-w-[2rem] text-center font-bold text-black text-lg">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 rounded-xl border-2 border-black/20 text-black flex items-center justify-center font-bold hover:bg-black/5 transition-colors"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
              <p className="text-lg font-bold text-black">
                €{totalPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="p-4 flex gap-3 border-t border-black/10 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-semibold text-sm bg-white border-2 border-black/10 text-red-600 hover:bg-red-50 transition-colors"
            >
              {t('cancel').toUpperCase()}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="flex-1 py-3.5 rounded-xl font-semibold text-sm bg-[#2563eb] text-white hover:bg-[#1d4ed8] transition-colors"
            >
              {t('add').toUpperCase()}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductCustomizeModal;
