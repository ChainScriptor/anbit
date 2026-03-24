import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Menu,
  Search,
  ShoppingBag,
  Sun,
  Moon,
  UtensilsCrossed,
  Sandwich,
  Pizza,
  Martini,
  Croissant,
  Star,
  TrendingUp,
  User,
  ShoppingCart,
  X,
} from 'lucide-react';
import { Partner, Product } from '../types';
import type { CartItemData, ProductCartOptions } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useOrder } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ProductDetailModal from './ProductDetailModal';
import ProductCustomizeModal from './ProductCustomizeModal';
import CartCheckoutModal, { type PaymentMethod } from './CartCheckoutModal';
import OrderSentScreen from './OrderSentScreen';
import OrderAcceptedScreen from './OrderAcceptedScreen';
import AnimatedSocialLinks, { type Social } from './ui/social-links';

interface StoreMenuPageProps {
  partner: Partner;
  onBack: () => void;
  onOrderComplete?: (xpEarned: number) => void;
  isAuthenticated?: boolean;
  onOpenLogin?: (onSuccess?: () => void) => void;
  onOpenRegister?: (onSuccess?: () => void) => void;
}

const StoreMenuPage: React.FC<StoreMenuPageProps> = ({
  partner,
  onBack,
  onOrderComplete,
  isAuthenticated = false,
  onOpenLogin,
  onOpenRegister,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { session } = useOrder();
  const [cart, setCart] = useState<CartItemData[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToCustomize, setProductToCustomize] = useState<Product | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [orderAccepted, setOrderAccepted] = useState(false);
  const [orderRejected, setOrderRejected] = useState(false);
  const [orderPin, setOrderPin] = useState('');
  const [orderXpEarned, setOrderXpEarned] = useState(0);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('anbit_store_theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  });

  const menu = useMemo(() => partner.menu || [], [partner]);
  const categories = useMemo(() => {
    const fromMenu = new Set(menu.map((p) => p.category).filter(Boolean));
    const rest = Array.from(fromMenu).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    return ['All', ...rest];
  }, [menu]);

  const filteredByCategory = useMemo(() => {
    return activeCategory === 'All' ? menu : menu.filter((p) => p.category === activeCategory);
  }, [menu, activeCategory]);

  const filteredMenu = useMemo(() => {
    if (!searchQuery.trim()) return filteredByCategory;
    const q = searchQuery.trim().toLowerCase();
    return filteredByCategory.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [filteredByCategory, searchQuery]);

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const xpTotal = cart.reduce((acc, item) => acc + item.xpReward * item.quantity, 0);
  const deliveryFee = 2.0;

  const openCustomize = (product: Product) => {
    setProductToCustomize(product);
  };

  const addToCartWithOptions = (
    product: Product,
    quantity: number,
    options: ProductCartOptions | undefined,
    comments: string | undefined
  ) => {
    setCart((prev) => [
      ...prev,
      { ...product, quantity, options, comments },
    ]);
    setProductToCustomize(null);
  };

  const openCheckout = () => {
    if (cart.length === 0) return;
    setShowCheckoutModal(true);
  };

  const handleConfirmOrder = useCallback(async (_paymentMethod: PaymentMethod, earnXp: boolean) => {
    if (!user) {
      setCheckoutError('Παρακαλώ συνδεθείτε για να στείλετε παραγγελία.');
      return;
    }
    setCheckoutError(null);
    setOrderSubmitting(true);
    try {
      const { orderId } = await api.submitOrder({
        userId: user.id,
        merchantId: partner.id,
        tableNumber: session?.tableNumber ?? 1,
        orderItems: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });
      setOrderPin(String(100000 + Math.floor(Math.random() * 900000)));
      setPendingOrderId(orderId);
      setCart([]);
      setShowCheckoutModal(false);
      setOrderSent(true);
    } catch (e) {
      console.error('Order submit failed', e);
      setCheckoutError('Αποτυχία αποστολής παραγγελίας. Δοκιμάστε ξανά.');
    } finally {
      setOrderSubmitting(false);
    }
  }, [user, partner.id, session?.tableNumber, cart]);

  useEffect(() => {
    if (!pendingOrderId || !orderSent) return;
    const poll = async () => {
      try {
        const order = await api.getOrder(pendingOrderId);
        const status = order.status;
        const statusNum = typeof status === 'string' ? (status === 'Accepted' ? 2 : status === 'Rejected' ? 3 : 1) : status;
        if (statusNum === 2) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setOrderXpEarned(order.totalXp ?? 0);
          setOrderAccepted(true);
          onOrderComplete?.(order.totalXp ?? 0);
        } else if (statusNum === 3) {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setOrderRejected(true);
        }
      } catch {
        // ignore, retry on next poll
      }
    };
    poll();
    pollRef.current = setInterval(poll, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pendingOrderId, orderSent, onOrderComplete]);

  const handleOrderAccepted = useCallback(() => {
    setOrderSent(false);
    setOrderAccepted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('anbit_store_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const categoryLabel = (id: string) => (id === 'All' ? t('all') : id);
  const sectionTitle = activeCategory === 'All' ? partner.name : activeCategory;
  const featuredProduct = menu[0];

  const categoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (category === 'All') return <UtensilsCrossed className="w-7 h-7" strokeWidth={2.2} />;
    if (c.includes('burger') || c.includes('sandwich')) return <Sandwich className="w-7 h-7" strokeWidth={2.2} />;
    if (c.includes('pizza')) return <Pizza className="w-7 h-7" strokeWidth={2.2} />;
    if (c.includes('drink') || c.includes('coffee') || c.includes('bar')) return <Martini className="w-7 h-7" strokeWidth={2.2} />;
    if (c.includes('bakery') || c.includes('sweet') || c.includes('dessert')) return <Croissant className="w-7 h-7" strokeWidth={2.2} />;
    return <UtensilsCrossed className="w-7 h-7" strokeWidth={2.2} />;
  };

  if (orderAccepted) {
    return (
      <OrderAcceptedScreen
        pin={orderPin}
        tableNumber={session?.tableNumber ?? 1}
        xpEarned={orderXpEarned}
        onBack={() => {
          setOrderAccepted(false);
          setOrderPin('');
          setOrderXpEarned(0);
          setPendingOrderId(null);
          onBack();
        }}
      />
    );
  }

  if (orderRejected) {
    return (
      <div
        className="fixed inset-0 z-[300] bg-white flex flex-col items-center justify-center px-6 text-center"
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <X className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-black mb-2">Η παραγγελία σας απορρίφθηκε</h1>
        <p className="text-black/70 text-sm mb-8 max-w-[280px]">Το κατάστημα δεν μπόρεσε να εξυπηρετήσει την παραγγελία σας.</p>
        <button
          type="button"
          onClick={() => {
            setOrderRejected(false);
            setOrderSent(false);
            setPendingOrderId(null);
            onBack();
          }}
          className="px-6 py-3 rounded-xl font-semibold text-sm bg-black text-white"
        >
          Επιστροφή
        </button>
      </div>
    );
  }

  if (orderSent) {
    return (
      <OrderSentScreen
        onBack={() => {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setOrderSent(false);
          setPendingOrderId(null);
          onBack();
        }}
        onAccepted={handleOrderAccepted}
        disableAutoAccept
      />
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors ${isDarkMode ? 'bg-black text-white' : 'bg-[#f3f3f3] text-[#1b1c1c]'}`}>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-neutral-950/85 border-white/5' : 'bg-white/90 border-black/5'
          }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center gap-4">
          <button type="button" onClick={onBack} className="text-[#E63533] active:scale-95 transition-transform">
            <Menu className="w-6 h-6" strokeWidth={2.4} />
          </button>
          <span className="text-[#E63533] font-black italic text-3xl tracking-tighter">Anbit</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsDarkMode((v) => !v)}
            className={`${isDarkMode ? 'text-[#E63533]' : 'text-[#E63533]'} active:scale-95 transition-transform`}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" strokeWidth={2.4} /> : <Moon className="w-5 h-5" strokeWidth={2.4} />}
          </button>
          <button type="button" className="text-[#E63533] active:scale-95 transition-transform">
            <Search className="w-5 h-5" strokeWidth={2.4} />
          </button>
          <button type="button" onClick={openCheckout} className="text-[#E63533] active:scale-95 transition-transform">
            <ShoppingBag className="w-5 h-5" strokeWidth={2.4} />
          </button>
        </div>
      </header>

      <main className="pt-20 pb-36 px-6">
        <section className="mb-8">
          <div className="relative h-52 rounded-3xl overflow-hidden p-6 flex items-end group">
            <img
              src={featuredProduct?.image || partner.image}
              alt={featuredProduct?.name || partner.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="relative z-10">
              <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-300/85 text-amber-950 mb-2">
                Flash Deal
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight leading-none">
                {featuredProduct?.name || partner.name}
                <br />
                <span className="text-[#E63533]">50% OFF</span>
              </h2>
              <p className="text-neutral-400 text-sm mt-1">Valid until midnight</p>
            </div>
          </div>
        </section>

        <section className="mb-8 -mx-6 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto px-6 pb-2 no-scrollbar">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className="flex flex-col items-center gap-3 min-w-[72px] group"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-active:scale-90 ${isActive
                      ? 'bg-[#E63533] text-white shadow-lg shadow-[#E63533]/25'
                      : isDarkMode
                        ? 'bg-neutral-900 text-neutral-400'
                        : 'bg-white border border-black/10 text-neutral-500'
                      }`}
                  >
                    {categoryIcon(cat)}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-[#E63533]' : isDarkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>
                    {categoryLabel(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-6">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`} strokeWidth={2} />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchProduct')}
              className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-colors ${isDarkMode
                ? 'border border-neutral-800 bg-neutral-950 text-white placeholder:text-neutral-500 focus:ring-neutral-700'
                : 'border border-black/10 bg-white text-[#1b1c1c] placeholder:text-neutral-500 focus:ring-black/20'
                }`}
              aria-label={t('searchProduct')}
            />
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-3xl font-extrabold tracking-tight mb-1">Recommended for You</h3>
          <p className={`text-xs uppercase tracking-widest ${isDarkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>{sectionTitle}</p>
        </section>

        <section className="grid grid-cols-2 gap-x-4 gap-y-8">
          {filteredMenu.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isDarkMode={isDarkMode}
              onAddToCart={() => openCustomize(product)}
              onViewDetail={() => setSelectedProduct(product)}
            />
          ))}
        </section>

        {filteredMenu.length === 0 && (
          <p className={`text-sm py-10 text-center ${isDarkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>
            Δεν βρέθηκαν προϊόντα.
          </p>
        )}

        <div className="mt-10 opacity-95">
          <AnimatedSocialLinks
            socials={[
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
            ] satisfies Social[]}
            className="!justify-start"
          />
        </div>
      </main>

      {cart.length > 0 && (
        <div
          className="fixed left-4 right-4 z-40 rounded-2xl bg-[#E63533] text-white shadow-2xl border border-white/10 px-4 py-3 flex items-center justify-between gap-3"
          style={{ bottom: 'calc(5.9rem + env(safe-area-inset-bottom))' }}
        >
          <div className="min-w-0">
            <p className="text-sm font-bold">
              {cart.reduce((s, i) => s + i.quantity, 0)} προϊόντα · €{(cartTotal + deliveryFee).toFixed(2)}
            </p>
            <p className="text-[11px] text-white/80">
              {xpTotal > 0 ? `+${xpTotal} XP` : t('placeOrder')}
            </p>
          </div>
          <button
            onClick={openCheckout}
            className="shrink-0 px-4 py-2 rounded-xl bg-black/30 hover:bg-black/45 text-sm font-semibold transition-colors"
          >
            Checkout
          </button>
        </div>
      )}

      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-[2rem] px-4 pt-3 pb-8 transition-colors ${isDarkMode
          ? 'bg-neutral-950 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
          : 'bg-white border-t border-black/10 shadow-[0_-10px_25px_rgba(0,0,0,0.12)]'
          }`}
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <div className="grid grid-cols-4 gap-2">
          <button type="button" className="flex flex-col items-center text-[#E63533] scale-105">
            <UtensilsCrossed className="w-5 h-5" strokeWidth={2.2} />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest">Menu</span>
          </button>
          <button type="button" className={`flex flex-col items-center ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
            <Star className="w-5 h-5" strokeWidth={2.2} />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest">XP Rewards</span>
          </button>
          <button type="button" className={`flex flex-col items-center ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
            <TrendingUp className="w-5 h-5" strokeWidth={2.2} />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest">Orders</span>
          </button>
          <button type="button" className={`flex flex-col items-center ${isDarkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
            <User className="w-5 h-5" strokeWidth={2.2} />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest">Profile</span>
          </button>
        </div>
      </nav>

      <CartCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => { setShowCheckoutModal(false); setCheckoutError(null); }}
        cart={cart}
        totalEur={cartTotal + deliveryFee}
        totalXp={xpTotal}
        isAuthenticated={isAuthenticated}
        onOpenLogin={onOpenLogin}
        onOpenRegister={onOpenRegister}
        onConfirm={handleConfirmOrder}
        isSubmitting={orderSubmitting}
        error={checkoutError}
      />
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p) => { setSelectedProduct(null); openCustomize(p); }}
        partnerName={partner.name}
      />
      <ProductCustomizeModal
        product={productToCustomize}
        onClose={() => setProductToCustomize(null)}
        onAdd={addToCartWithOptions}
      />
    </div>
  );
};

function ProductCard({
  product,
  isDarkMode,
  onAddToCart,
  onViewDetail,
}: {
  product: Product;
  isDarkMode: boolean;
  onAddToCart: () => void;
  onViewDetail: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onViewDetail}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onViewDetail();
          }
        }}
        className={`relative w-full aspect-square rounded-3xl overflow-hidden text-left cursor-pointer ${isDarkMode ? 'bg-neutral-900' : 'bg-white border border-black/5'}`}
      >
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        {product.xpReward > 0 && (
          <div className="absolute top-2 left-2 bg-amber-300/90 text-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xl">
            <Star className="w-3 h-3 fill-current" strokeWidth={2.2} />
            <span className="text-[8px] font-black uppercase tracking-widest">{product.xpReward} XP</span>
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart();
          }}
          className="absolute bottom-2 right-2 w-9 h-9 rounded-full bg-[#E63533] text-white flex items-center justify-center shadow-2xl active:scale-90 transition-all"
        >
          <ShoppingCart className="w-4 h-4" strokeWidth={2.4} />
        </button>
      </div>
      <button onClick={onViewDetail} className="text-left">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h4 className="text-sm font-bold tracking-tight leading-tight line-clamp-1">{product.name}</h4>
          <span className="text-[#E63533] font-extrabold text-sm tracking-tight shrink-0">€{product.price.toFixed(2)}</span>
        </div>
        <p className={`text-[11px] leading-tight line-clamp-2 ${isDarkMode ? 'text-neutral-500' : 'text-neutral-600'}`}>
          {product.description}
        </p>
      </button>
    </motion.div>
  );
}

export default StoreMenuPage;
