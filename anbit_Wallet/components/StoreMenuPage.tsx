import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronDown,
  ShoppingBag,
  Search,
  Globe,
  Bell,
  Plus,
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

  const categoryLabel = (id: string) => (id === 'All' ? t('all') : id);
  const sectionTitle = activeCategory === 'All' ? partner.name : activeCategory;

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
    <div className="min-h-screen bg-[#f0f0f0] text-black font-sans antialiased" data-theme="light">
      {/* Hero με background + overlay κουμπιά */}
      <header
        className="relative h-44 sm:h-52 overflow-hidden"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <img
          src={partner.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex items-center justify-between px-4 pt-3">
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-black shadow-md hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Πίσω"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <div className="flex flex-col items-center gap-2">
            <div
              className="min-w-[4.5rem] h-14 px-3 rounded-full bg-[#0C0C0C] border-2 border-white/20 flex items-center justify-center shadow-lg shrink-0"
              aria-hidden
            >
              <span
                className="font-logoBold text-2xl font-extrabold text-white tracking-tight"
                style={{ letterSpacing: '-0.03em' }}
              >
                Anbit
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-md shrink-0"
              aria-label={t('languageSelection')}
            >
              <Globe className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black shadow-md shrink-0"
              aria-label="Υπηρεσία"
            >
              <Bell className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* Category bar: dropdown + tabs (όλα κείμενα μαύρα) */}
      <div
        className="flex flex-nowrap items-center gap-2 overflow-x-auto px-4 py-3 bg-white -mt-1 rounded-t-2xl no-scrollbar"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <button
          type="button"
          className="w-9 h-9 rounded-full bg-white border border-[rgba(0,0,0,0.12)] flex items-center justify-center text-[#2563eb] shrink-0"
          aria-label="Κατηγορίες"
        >
          <ChevronDown className="w-5 h-5" strokeWidth={2} />
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-white text-black border border-[rgba(0,0,0,0.12)] shadow-sm'
                : 'bg-white text-black border border-[rgba(0,0,0,0.12)] hover:bg-gray-50'
            }`}
          >
            {categoryLabel(cat)}
          </button>
        ))}
      </div>

      {/* Λευκή κάρτα περιεχομένου */}
      <main className="bg-white rounded-t-2xl min-h-[60vh] -mt-1 px-4 pt-6 pb-32">
        <h2 className="text-2xl font-bold text-black tracking-tight mb-0.5">
          {sectionTitle}
        </h2>
        <p className="text-sm text-black/70 mb-3">
          {activeCategory === 'All'
            ? partner.name
            : `${categoryLabel(activeCategory)} – ${partner.name}`}
        </p>

        <div className="mb-6">
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
          />
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" strokeWidth={2} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchProduct')}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-black/12 bg-black/[0.03] text-black placeholder:text-black/50 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/20"
            aria-label={t('searchProduct')}
          />
        </div>

        <div className="space-y-4">
          {filteredMenu.map((product, index) => (
            <ProductCard
              key={product.id}
              index={index + 1}
              product={product}
              onAddToCart={() => openCustomize(product)}
              onViewDetail={() => setSelectedProduct(product)}
              addToCartLabel={t('addLoadout')}
            />
          ))}
        </div>

        {filteredMenu.length === 0 && (
          <p className="text-sm text-black/60 py-8 text-center">
            Δεν βρέθηκαν προϊόντα.
          </p>
        )}
      </main>

      {/* Sticky bottom cart bar */}
      {cart.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 p-4 flex items-center justify-between gap-4 bg-white border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-center gap-3 text-black">
            <ShoppingBag className="w-6 h-6 shrink-0" strokeWidth={2} />
            <div>
              <p className="font-bold text-sm text-black">
                {cart.reduce((s, i) => s + i.quantity, 0)} προϊόντα
              </p>
              <p className="text-sm text-black/70">
                €{(cartTotal + deliveryFee).toFixed(2)} {t('total')}
                {xpTotal > 0 && (
                  <span className="ml-1.5 text-amber-600 font-semibold">
                    · +{xpTotal} XP
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={openCheckout}
            className="px-6 py-3 rounded-xl font-semibold text-sm bg-black text-white hover:bg-black/90 transition-colors"
          >
            {t('placeOrder')}
          </button>
        </div>
      )}

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
  index,
  product,
  onAddToCart,
  onViewDetail,
  addToCartLabel,
}: {
  index: number;
  product: Product;
  onAddToCart: () => void;
  onViewDetail: () => void;
  addToCartLabel: string;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm"
    >
      <div className="flex gap-4">
        <div className="flex-1 min-w-0 text-left">
          <button onClick={onViewDetail} className="block w-full group text-left">
            <h3 className="text-base font-bold text-black group-hover:underline tracking-tight">
              {index}. {product.name}
            </h3>
            {product.description && (
              <p className="text-sm mt-1 text-black/80 line-clamp-2">
                {product.description}
              </p>
            )}
          </button>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-50 text-green-800 border border-green-200">
              Regional
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 gap-2">
            <span className="text-base font-bold text-black">
              €{product.price.toFixed(2)}
            </span>
            {product.xpReward > 0 && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                +{product.xpReward} XP
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-black/15 bg-white text-black font-semibold text-sm hover:bg-black/5 transition-colors"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            <span>{addToCartLabel}</span>
          </button>
        </div>
        <button
          onClick={onViewDetail}
          className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/20"
        >
          <img src={product.image} alt="" className="w-full h-full object-cover" />
        </button>
      </div>
    </motion.article>
  );
}

export default StoreMenuPage;
