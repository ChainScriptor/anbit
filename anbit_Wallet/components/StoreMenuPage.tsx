import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShoppingCart, Plus } from 'lucide-react';
import { Partner, Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import ProductDetailModal from './ProductDetailModal';

interface CartItem extends Product {
  quantity: number;
}

interface StoreMenuPageProps {
  partner: Partner;
  onBack: () => void;
  onOrderComplete?: (xpEarned: number) => void;
}

const StoreMenuPage: React.FC<StoreMenuPageProps> = ({ partner, onBack, onOrderComplete }) => {
  const { t } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const menu = useMemo(() => partner.menu || [], [partner]);
  const categories = useMemo(() => {
    const ids = new Set(menu.map((p) => p.category));
    return ['All', ...Array.from(ids)];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    let list = activeCategory === 'All' ? menu : menu.filter((p) => p.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return list;
  }, [menu, activeCategory, searchQuery]);

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const xpTotal = cart.reduce((acc, item) => acc + item.xpReward * item.quantity, 0);
  const deliveryFee = 2.0;

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    onOrderComplete?.(xpTotal);
    setCart([]);
    onBack();
  };

  const categoryLabel = (id: string) => (id === 'All' ? t('categories') : id);

  return (
    <div className="min-h-screen bg-anbit-bg text-anbit-text">
      {/* Simple back button – no navbar */}
      <div className="px-4 lg:px-8 pt-4 lg:pt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 font-bold text-xs border border-anbit-border bg-anbit-card text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content transition-all"
          aria-label="Πίσω"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Πίσω στα καταστήματα</span>
        </button>
        {cart.length > 0 && (
          <span className="ml-4 text-anbit-muted text-xs font-bold inline-flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4" />
            {cart.reduce((s, i) => s + i.quantity, 0)} {t('cart')}
          </span>
        )}
      </div>

      {/* Hero */}
      <div className="relative h-48 sm:h-56 lg:h-72 overflow-hidden rounded-2xl mx-4 mt-4 lg:mx-0 lg:mt-6 border border-anbit-border">
        <img
          src={partner.image}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 lg:bottom-10 lg:left-10 text-white">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Grab It.
          </p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter mt-0.5">
            TASTE IT.
          </p>
          <div className="mt-2 h-1 w-24 rounded-full bg-white/90" />
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <h1 className="section-title-lg text-anbit-text text-center mb-1">
          MENU
        </h1>
        <p className="section-title text-anbit-muted text-center text-sm mb-8">
          {partner.name}
        </p>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-anbit-border pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeCategory === cat
                  ? 'bg-anbit-yellow text-anbit-yellow-content'
                  : 'bg-anbit-card border border-anbit-border text-anbit-text hover:bg-white/[0.03]'
              }`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Menu sections: two columns when we have multiple categories, else single */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {categories.filter((c) => c !== 'All').length <= 1 ? (
            <div className="lg:col-span-2 space-y-6">
              {filteredMenu.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                  onViewDetail={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {filteredMenu
                  .filter((_, i) => i % 2 === 0)
                  .map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onAddToCart={() => addToCart(product)}
                      onViewDetail={() => setSelectedProduct(product)}
                    />
                  ))}
              </div>
              <div className="space-y-6">
                {filteredMenu
                  .filter((_, i) => i % 2 === 1)
                  .map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      onAddToCart={() => addToCart(product)}
                      onViewDetail={() => setSelectedProduct(product)}
                    />
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Deal blocks: πρώτο = χρώμα navbar, δεύτερο = χρώμα σελίδας */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-14 lg:mt-20">
          <div
            className="rounded-2xl p-6 lg:p-8 border border-anbit-border flex flex-col justify-between min-h-[200px]"
            style={{ background: 'var(--anbit-nav-bg)' }}
          >
            <h3 className="section-title text-anbit-text text-xl lg:text-2xl">
              {partner.name} DEAL
            </h3>
            <ul className="text-sm font-bold text-anbit-muted mt-4 space-y-1">
              <li>1x {menu[0]?.name || 'Classic'}</li>
              <li>1x Classic fries</li>
              <li>1x Coca-cola 330ml</li>
            </ul>
            <p className="text-2xl lg:text-3xl font-black text-anbit-yellow mt-4">9.90 €</p>
            <p className="text-xs text-anbit-muted mt-1">*Με ελάχιστη παραγγελία</p>
          </div>
          <div className="rounded-2xl p-6 lg:p-8 border border-anbit-border flex flex-col justify-between min-h-[200px] bg-anbit-bg">
            <h3 className="section-title text-anbit-text text-xl lg:text-2xl">
              COMBO DEAL
            </h3>
            <ul className="text-sm font-bold text-anbit-muted mt-4 space-y-1">
              <li>1x {menu[0]?.name || 'Smashed burger'}</li>
              <li>1x New York Fries</li>
              <li>1x Chicken burger</li>
            </ul>
            <p className="text-2xl lg:text-3xl font-black text-anbit-yellow mt-4">6.90 €</p>
            <p className="text-xs text-anbit-muted mt-1">*Σύνολο προϊόντων</p>
          </div>
        </div>
      </main>

      {/* Sticky cart bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 flex items-center justify-between gap-4 bg-anbit-card border-t border-anbit-border shadow-2xl lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-sm lg:rounded-2xl lg:border">
          <div className="flex items-center gap-3 text-anbit-text">
            <ShoppingCart className="w-6 h-6 shrink-0 text-anbit-yellow" />
            <div>
              <p className="font-bold text-sm">{cart.reduce((s, i) => s + i.quantity, 0)} προϊόντα</p>
              <p className="text-sm text-anbit-muted">€{(cartTotal + deliveryFee).toFixed(2)} συνολικά</p>
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            className="px-6 py-3 rounded-xl font-semibold text-xs tracking-wide bg-anbit-yellow text-anbit-yellow-content hover:opacity-90 transition-all"
          >
            {t('placeOrder')}
          </button>
        </div>
      )}

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        partnerName={partner.name}
      />
    </div>
  );
};

function ProductRow({
  product,
  onAddToCart,
  onViewDetail,
}: {
  product: Product;
  onAddToCart: () => void;
  onViewDetail: () => void;
}) {
  return (
    <motion.div
      layout
      className="flex items-start gap-4 py-4 border-b border-anbit-border last:border-0"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={onViewDetail}
        className="shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 border-anbit-border focus:outline-none focus:ring-2 focus:ring-anbit-yellow/50 focus:ring-offset-2 focus:ring-offset-anbit-bg"
      >
        <img src={product.image} alt="" className="w-full h-full object-cover" />
      </button>
      <div className="flex-1 min-w-0">
        <button
          onClick={onViewDetail}
          className="text-left block w-full group"
        >
          <h4 className="text-base font-bold text-anbit-text group-hover:underline italic tracking-tight">
            {product.name}
          </h4>
          {product.description && (
            <p className="text-sm mt-0.5 line-clamp-2 text-anbit-muted font-bold">
              {product.description}
            </p>
          )}
        </button>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-black text-anbit-text">
            {product.price.toFixed(2)} €
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            className="flex items-center justify-center w-8 h-8 rounded-xl font-bold bg-anbit-yellow text-anbit-yellow-content hover:opacity-90 transition-opacity border border-anbit-border"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default StoreMenuPage;
