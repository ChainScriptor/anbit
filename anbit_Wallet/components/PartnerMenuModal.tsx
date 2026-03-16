import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, CheckCircle, ShoppingCart,
  ChevronRight, Zap, User, ShoppingBag,
  Utensils, Search, Plus, Minus, ChevronLeft,
  Flame, Heart, Clock, Trash2, RotateCcw,
  RefreshCw, MapPin
} from 'lucide-react';
import { Partner, Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useOrder } from '../context/OrderContext';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ProductDetailModal from './ProductDetailModal';

interface CartItem extends Product {
  quantity: number;
}

interface OrderHistory {
  id: string;
  items: { id: string; name: string; quantity: number }[];
  date: string;
  totalPrice: number;
}

interface PartnerMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
  onOrderComplete?: (xpEarned: number) => void;
}

const PartnerMenuModal: React.FC<PartnerMenuModalProps> = ({ isOpen, onClose, partner, onOrderComplete }) => {
  const { user } = useAuth();
  const { session } = useOrder();
  const { t } = useLanguage();
  const [view, setView] = useState<'menu' | 'cart'>('menu');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'processing' | 'waiting' | 'accepted' | 'rejected'>('idle');
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onOrderCompleteRef = useRef(onOrderComplete);
  onOrderCompleteRef.current = onOrderComplete;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const menu = useMemo(() => partner?.menu || [], [partner]);

  const categories = useMemo(() => {
    const ids = new Set(menu.map(p => p.category));
    return ['All', ...Array.from(ids)];
  }, [menu]);

  const filteredMenu = useMemo(() =>
    activeCategory === 'All' ? menu : menu.filter(p => p.category === activeCategory),
    [menu, activeCategory]
  );

  useEffect(() => {
    if (partner) setActiveCategory('All');
  }, [partner?.id]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const xpTotal = cart.reduce((acc, item) => acc + (item.xpReward * item.quantity), 0);
  const deliveryFee = 2.00;
  const [orderError, setOrderError] = useState<string | null>(null);

  if (!partner) return null;

  const resetOrder = () => {
    setCart([]);
    setOrderStatus('idle');
    setPendingOrderId(null);
    setXpEarned(0);
    setView('menu');
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !user) return;
    setOrderError(null);
    setOrderStatus('processing');
    try {
      const { orderId } = await api.submitOrder({
        userId: user.id,
        merchantId: partner.id,
        tableNumber: session?.tableNumber ?? 1,
        orderItems: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });
      setPendingOrderId(orderId);
      setOrderStatus('waiting');
    } catch (e) {
      console.error('Order submission failed', e);
      setOrderStatus('idle');
      setOrderError('Αποτυχία αποστολής παραγγελίας. Δοκιμάστε ξανά.');
    }
  };

  useEffect(() => {
    if (!pendingOrderId || orderStatus !== 'waiting') return;
    const poll = async () => {
      try {
        const order = await api.getOrder(pendingOrderId);
        const status = order.status;
        const statusNum = typeof status === 'string' ? (status === 'Accepted' ? 2 : status === 'Rejected' ? 3 : 1) : status;
        if (statusNum === 2) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setXpEarned(order.totalXp ?? 0);
          setOrderStatus('accepted');
          onOrderCompleteRef.current?.(order.totalXp ?? 0);
        } else if (statusNum === 3) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setOrderStatus('rejected');
        }
      } catch {
        // ignore network errors, will retry
      }
    };
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pendingOrderId, orderStatus]);

  const categoryLabel = (id: string) => id === 'All' ? 'Όλα' : id;

  const renderCartPanel = (isDesktop: boolean) => (
    <div className={`flex flex-col h-full bg-[#121212] border-l border-white/10 overflow-hidden ${isDesktop ? 'sticky top-0' : ''}`}>
      <div className="p-4 lg:p-5 border-b border-white/10 shrink-0">
        <h2 className="text-base font-bold text-white">{t('cart')}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{t('delivery')}: {partner.deliveryTime ?? '30-35\''}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-5 flex flex-col">
        {cart.length === 0 ? (
          <>
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6 space-y-3">
              <ShoppingBag className="w-16 h-16 text-gray-500" strokeWidth={1} />
              <p className="text-sm font-medium text-white">{t('emptyCart')}</p>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[220px]">{t('fillCartHint')}</p>
            </div>
              <div className="pt-4 space-y-3 shrink-0">
              {orderError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-1">
                  {orderError}
                </p>
              )}
              <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0" /> {t('addAddressHint')}
              </p>
              <button
                disabled
                className="w-full py-3.5 rounded-xl font-medium text-sm bg-anbit-yellow text-anbit-yellow-content opacity-80 cursor-not-allowed"
              >
                {t('placeOrder')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#1a1a1a] border border-white/5">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-white truncate">{item.name}</h4>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs font-bold text-white">€{(item.price * item.quantity).toFixed(2)}</span>
                      <div className="flex items-center gap-0.5 bg-[#252525] rounded px-1.5 py-0.5">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 text-gray-400 hover:text-white"><Minus className="w-3 h-3" /></button>
                        <span className="text-xs font-medium text-white w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 text-gray-400 hover:text-teal-400"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-1 text-gray-400 hover:text-red-400"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2 shrink-0">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Υποσύνολο</span>
                <span className="font-medium text-white">€{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Αποστολή</span>
                <span className="font-medium text-white">€{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Σύνολο</span>
                <span className="text-base font-bold text-white">€{(cartTotal + deliveryFee).toFixed(2)}</span>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={orderStatus === 'processing'}
                className="w-full py-3.5 rounded-xl font-medium text-sm bg-anbit-yellow text-anbit-yellow-content hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-3"
              >
                {orderStatus === 'processing' ? 'Αποστολή...' : t('placeOrder')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-full max-w-full h-full bg-[#121212] overflow-hidden flex flex-col font-sans shadow-[0_0_100px_rgba(0,0,0,0.8)] border-0"
          >
            {orderStatus === 'accepted' ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-10 py-20 px-10">
                <div className="relative">
                  <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(34,197,94,0.3)]">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                  {xpEarned > 0 && (
                    <div className="absolute -bottom-4 -right-4 bg-anbit-card border border-anbit-border text-anbit-text p-3 rounded-2xl font-black text-xs uppercase shadow-2xl">
                      +{xpEarned} XP
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">Η παραγγελία σας έχει σταλεί</h3>
                  <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">Το κατάστημα έγκρινε την παραγγελία σας. {xpEarned > 0 ? 'Κερδίσατε τους πόντους που σας αναλογούν.' : ''}</p>
                </div>
                <div className="w-full flex flex-col gap-4 max-w-xs">
                  <button onClick={resetOrder} className="w-full py-5 bg-anbit-card border border-anbit-border text-anbit-text font-black text-xs rounded-[24px] hover:bg-anbit-yellow hover:text-anbit-yellow-content transition-all uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3">
                    <RefreshCw className="w-5 h-5" /> ΝΕΑ ΠΑΡΑΓΓΕΛΙΑ
                  </button>
                  <button onClick={onClose} className="w-full py-5 bg-white/5 text-anbit-muted font-black text-xs rounded-[24px] hover:bg-white/10 transition-all uppercase tracking-[0.2em]">ΕΠΙΣΤΡΟΦΗ ΣΤΟ HQ</button>
                </div>
              </div>
            ) : orderStatus === 'rejected' ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center space-y-10 py-20 px-10">
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center border-2 border-red-500">
                  <X className="w-12 h-12 text-red-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Η παραγγελία σας απορρίφθηκε</h3>
                  <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">Το κατάστημα δεν μπόρεσε να εξυπηρετήσει την παραγγελία σας αυτή τη στιγμή.</p>
                </div>
                <div className="w-full flex flex-col gap-4 max-w-xs">
                  <button onClick={resetOrder} className="w-full py-5 bg-anbit-card border border-anbit-border text-anbit-text font-black text-xs rounded-[24px] hover:bg-anbit-yellow hover:text-anbit-yellow-content transition-all uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3">
                    <RefreshCw className="w-5 h-5" /> ΝΕΑ ΠΑΡΑΓΓΕΛΙΑ
                  </button>
                  <button onClick={onClose} className="w-full py-5 bg-white/5 text-anbit-muted font-black text-xs rounded-[24px] hover:bg-white/10 transition-all uppercase tracking-[0.2em]">ΕΠΙΣΤΡΟΦΗ ΣΤΟ HQ</button>
                </div>
              </div>
            ) : orderStatus === 'waiting' || orderStatus === 'processing' ? (
              <div className="h-full w-full flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 border-[6px] border-anbit-yellow/20 rounded-full" />
                  <div className="absolute inset-0 border-[6px] border-anbit-yellow border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-center space-y-2">
                  <span className="text-anbit-yellow font-black text-xs uppercase tracking-[0.3em] animate-pulse block">
                    {orderStatus === 'processing' ? 'Αποστολή παραγγελίας...' : 'Αναμονή επιβεβαίωσης από το κατάστημα...'}
                  </span>
                  <p className="text-anbit-muted text-[10px] font-bold uppercase tracking-widest italic">
                    {orderStatus === 'processing' ? 'Συνεχίστε να περιμένετε' : 'Θα ενημερωθείτε μόλις γίνει αποδοχή ή απόρριψη'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Top Header: logo (red) | search | button */}
                <header className="shrink-0 flex items-center justify-between gap-4 px-4 lg:px-6 py-3 bg-[#121212] border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                      <span className="text-white font-black text-sm">A</span>
                    </div>
                    <span className="text-white font-bold text-sm hidden sm:inline">Anbit</span>
                  </div>
                  <div className="flex-1 max-w-md mx-4">
                    <div className="flex items-center gap-2 bg-[#1e1e1e] rounded-full px-4 py-2.5 border border-white/5">
                      <Search className="w-4 h-4 text-gray-400 shrink-0" />
                      <input type="text" placeholder="Αναζήτηση" className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-500" />
                    </div>
                  </div>
                  <button onClick={onClose} className="px-4 py-2 rounded-lg bg-[#1e1e1e] border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                    Κλείσιμο
                  </button>
                </header>

                {/* Hero: banner + restaurant info */}
                <div className="shrink-0 px-4 lg:px-6 pt-4">
                  <div className="relative h-40 sm:h-48 lg:h-56 rounded-t-2xl overflow-hidden">
                    <img src={partner.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
                  </div>
                  <div className="bg-[#1a1a1a] rounded-b-2xl px-4 lg:px-6 py-4 -mt-1">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                        <img src={partner.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-white">{partner.name}</h1>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                            <span className="text-white font-medium">{partner.rating}</span>
                            <span>({partner.reviewCount ?? '—'})</span>
                          </span>
                          <span>{partner.category}</span>
                          <span>{partner.deliveryTime ?? "30-35'"}</span>
                          <span>{t('minOrder')} {partner.minOrder ?? '6€'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2.5 py-1 rounded-md bg-[#252525] text-white text-xs font-medium">{t('winCoupon')}</span>
                          <button type="button" className="p-1.5 text-gray-400 hover:text-white transition-colors"><Heart className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop: 3-column grid (20% | 55% | 25%) */}
                <div className="hidden lg:grid lg:grid-cols-[20%_1fr_25%] flex-1 min-h-0">
                  {/* Left: Category sidebar */}
                  <aside className="border-r border-white/10 overflow-y-auto py-4 bg-[#121212]">
                    <h3 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('categories')}</h3>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          activeCategory === cat ? 'text-white font-medium bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {categoryLabel(cat)}
                      </button>
                    ))}
                  </aside>
                  {/* Center: Main menu */}
                  <div className="min-w-0 overflow-y-auto bg-[#121212]">
                    <div className="p-4 lg:p-6">
                      <h2 className="text-lg font-bold text-white mb-4">{categoryLabel(activeCategory)}</h2>
                      <div className="space-y-0">
                        {filteredMenu.map((product, idx) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-4 py-4 border-b border-white/5 last:border-0"
                          >
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedProductForDetail(product)}>
                              <h4 className="text-sm font-medium text-white leading-snug">{product.name}</h4>
                              {product.description && (
                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{product.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm font-bold text-white">€{product.price.toFixed(2)}</span>
                                {idx < 2 && (
                                  <span className="text-xs font-medium text-emerald-500">έως -12%</span>
                                )}
                              </div>
                            </div>
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                              <img src={product.image} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-emerald-500/90 text-white rounded-xl transition-colors"
                              >
                                <Plus className="w-6 h-6" strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Right: Sticky cart */}
                  {renderCartPanel(true)}
                </div>

                {/* Mobile */}
                <div className="lg:hidden flex-1 min-h-0 flex flex-col bg-[#121212]">
                  {view === 'menu' ? (
                    <>
                      <div className="px-4 py-2 border-b border-white/10 overflow-x-auto no-scrollbar">
                        <div className="flex gap-2">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setActiveCategory(cat)}
                              className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium ${activeCategory === cat ? 'bg-white/10 text-white' : 'bg-[#1a1a1a] text-gray-400 border border-white/5'}`}
                            >
                              {categoryLabel(cat)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-0 pb-28">
                        <h2 className="text-base font-bold text-white mb-3">{categoryLabel(activeCategory)}</h2>
                        {filteredMenu.map((product, idx) => (
                          <div key={product.id} className="flex items-center gap-3 py-4 border-b border-white/5">
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedProductForDetail(product)}>
                              <h4 className="text-sm font-medium text-white line-clamp-2">{product.name}</h4>
                              {product.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-bold text-white">€{product.price.toFixed(2)}</span>
                                {idx < 2 && <span className="text-xs text-emerald-500">έως -12%</span>}
                              </div>
                            </div>
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                              <img src={product.image} alt="" className="w-full h-full object-cover" />
                              <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-teal-500/90 text-white rounded-xl">
                                <Plus className="w-5 h-5" strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {cart.length > 0 && (
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#1a1a1a] border-t border-white/10 z-20">
                          <button onClick={() => setView('cart')} className="w-full py-3.5 rounded-xl font-medium text-sm bg-anbit-yellow text-anbit-yellow-content hover:opacity-90 transition-all">
                            {t('cart')} · €{(cartTotal + deliveryFee).toFixed(2)}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 p-4 border-b border-white/10">
                        <button onClick={() => setView('menu')} className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-white">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-bold text-white">{t('cart')}</h2>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {renderCartPanel(false)}
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      <ProductDetailModal product={selectedProductForDetail} onClose={() => setSelectedProductForDetail(null)} onAddToCart={addToCart} partnerName={partner.name} />
    </AnimatePresence>
  );
};

export default PartnerMenuModal;
