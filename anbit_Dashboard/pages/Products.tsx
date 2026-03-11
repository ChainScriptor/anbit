import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  MoreHorizontal,
  UtensilsCrossed,
  Coffee,
  Cake,
  Baby,
  Soup,
  Wheat,
  Pizza,
  Fish,
  Sandwich,
  Leaf,
  Beef,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

const ACCENT = '#e63533';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  All: Globe,
  Beverages: Coffee,
  Desserts: Cake,
  'Kids Menu': Baby,
  'Main Courses': Soup,
  'Pasta & Noodles': Wheat,
  Pizza: Pizza,
  Sushi: Fish,
  Seafood: Fish,
  Sandwiches: Sandwich,
  Vegetarian: Leaf,
  Burger: Beef,
  Καφέδες: Coffee,
  Φαγητό: UtensilsCrossed,
  Ποτά: Coffee,
};

function getCategoryIcon(cat: string) {
  return CATEGORY_ICONS[cat] ?? UtensilsCrossed;
}

const Products: React.FC = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: '',
    price: 0,
    pointsReward: 0,
    image: '',
    allergens: [],
    isActive: true,
  });
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiProducts = await api.getProducts();
      const mapped: Product[] = apiProducts.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: 'Menu',
        price: p.price,
        pointsReward: p.xp,
        image:
          'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400',
        isActive: true,
        allergens: [],
      }));
      setItems(mapped);
    } catch (e) {
      setError('Αποτυχία φόρτωσης προϊόντων.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const base = Array.from(new Set(items.map((p) => p.category)));
    const merged = Array.from(new Set([...base, ...extraCategories])).sort();
    return ['All', ...merged];
  }, [items, extraCategories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: items.length };
    categories.forEach((c) => {
      if (c !== 'All') counts[c] = items.filter((p) => p.category === c).length;
    });
    return counts;
  }, [items, categories]);

  const products: Product[] = useMemo(() => {
    const filtered =
      activeCategory === 'All'
        ? items
        : items.filter((p) => p.category === activeCategory);
    if (!searchQuery.trim()) return filtered;
    const q = searchQuery.toLowerCase();
    return filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [items, activeCategory, searchQuery]);

  const resetForm = () => {
    setNewProduct({
      name: '',
      category: activeCategory === 'All' ? categories[1] || '' : activeCategory,
      price: 0,
      pointsReward: 0,
      image: '',
      allergens: [],
      isActive: true,
    });
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.category) {
      alert('Συμπλήρωσε τουλάχιστον όνομα και κατηγορία.');
      return;
    }
    try {
      await api.createProduct({
        name: newProduct.name,
        description: newProduct.description ?? '',
        price: Number(newProduct.price || 0),
        xp: Number(newProduct.pointsReward || 0),
      });
      setIsAddOpen(false);
      resetForm();
      await loadProducts();
    } catch (e) {
      alert('Αποτυχία δημιουργίας προϊόντος.');
      console.error(e);
    }
  };

  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name || name === 'All') return;
    if (categories.includes(name)) {
      alert('Η κατηγορία υπάρχει ήδη.');
      return;
    }
    setExtraCategories((prev) => [...prev, name]);
    setNewCategoryName('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct((prev) => ({
        ...prev,
        image: typeof reader.result === 'string' ? reader.result : prev.image,
      }));
    };
    reader.readAsDataURL(file);
  };

  const deleteCategory = (name: string) => {
    if (name === 'All') return;
    const used = items.some((p) => p.category === name);
    if (used) {
      alert('Η κατηγορία χρησιμοποιείται από προϊόντα.');
      return;
    }
    setExtraCategories((prev) => prev.filter((c) => c !== name));
    if (activeCategory === name) setActiveCategory('All');
  };

  const displayCategoryName = (cat: string) =>
    cat === 'All' ? 'All Dishes' : cat;

  return (
    <div className="flex flex-col gap-6 text-slate-900">
      {/* Two columns from top: Dish Category (left) δίπλα στο banner | Banner + Content (right) */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Left: Dish Category panel - sticky to viewport, button fixed at bottom of panel */}
        <aside
          className="flex w-full shrink-0 flex-col rounded-2xl border border-slate-200 bg-white lg:sticky lg:top-0 lg:h-[calc(100vh-6rem)] lg:w-64 lg:max-h-[calc(100vh-6rem)]"
        >
          <div className="shrink-0 border-b border-slate-200 px-4 py-3">
            <h2 className="font-semibold text-slate-900">Dish Category</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const Icon = getCategoryIcon(displayCategoryName(cat));
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    isActive
                      ? 'text-white'
                      : 'text-slate-700 hover:bg-slate-100',
                  )}
                  style={
                    isActive
                      ? { backgroundColor: ACCENT }
                      : undefined
                  }
                >
                  <Icon
                    className={cn('h-5 w-5 shrink-0', isActive ? 'text-white' : 'text-slate-500')}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {displayCategoryName(cat)}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="shrink-0 border-t border-slate-200 p-3">
            <Button
              className="w-full gap-2 text-white"
              style={{ backgroundColor: ACCENT }}
              onClick={() => setIsManageOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Dish Category
            </Button>
          </div>
        </aside>

        {/* Right: Banner δίπλα στο Dish Category, μετά search + grid */}
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Banner - ίδιο ύψος με το πάνελ αριστερά */}
          <div
            className="relative overflow-hidden rounded-2xl px-6 py-6 md:px-8 md:py-8"
            style={{
              background: 'linear-gradient(135deg, #fef3e2 0%, #fde8d4 50%, #fad9b8 100%)',
            }}
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  Effortlessly Manage Your Menu!
                </h1>
                <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
                  Quick access to every dish—add, update, and organize your menu with ease.
                </p>
              </div>
              <div className="mt-4 flex justify-center md:mt-0 md:block">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/60 text-5xl shadow-sm md:h-28 md:w-28">
                  👨‍🍳
                </div>
              </div>
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-12 opacity-30"
              style={{
                background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 80' fill='none'%3E%3Cpath d='M0 40 Q360 0 720 40 T1440 40 V80 H0 Z' fill='%23e63533'/%3E%3C/svg%3E") no-repeat bottom center`,
                backgroundSize: 'cover',
              }}
            />
          </div>

          <div className="flex flex-col gap-4">
          {isLoading && (
            <p className="text-sm text-slate-500">Φόρτωση προϊόντων...</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Look up any dish you desire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
                  viewMode === 'list'
                    ? 'border-[#e63533] text-[#e63533]'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50',
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
                  viewMode === 'grid'
                    ? 'border-[#e63533] text-[#e63533]'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50',
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <Button
                className="gap-2 text-white"
                style={{ backgroundColor: ACCENT }}
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <div
            className={cn(
              'grid gap-4',
              viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                : 'grid-cols-1',
            )}
          >
            {/* Add New Dish card - first */}
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsAddOpen(true);
              }}
              className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 py-6 text-slate-600 transition-colors hover:border-[#e63533] hover:bg-slate-50 hover:text-[#e63533]"
            >
              <Plus className="h-10 w-10" style={{ color: ACCENT }} />
              <span className="text-center text-sm font-medium">
                Add New Dish to {activeCategory === 'All' ? 'Menu' : activeCategory}
              </span>
            </button>

            {/* Dish cards */}
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative flex items-start justify-between p-2">
                  <label className="flex cursor-pointer items-center">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </label>
                  <button
                    type="button"
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Menu"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-col items-center px-4 pb-4">
                  <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-slate-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-3 truncate text-center text-sm font-semibold text-slate-900">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-slate-600">
                    €{product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>

      {/* Add product modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add product</h2>
              <button className="text-sm" onClick={() => setIsAddOpen(false)}>
                Close
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium">Name</label>
                <input
                  type="text"
                  value={newProduct.name || ''}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Category</label>
                  <select
                    value={newProduct.category || ''}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories
                      .filter((c) => c !== 'All')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProduct.image || ''}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, image: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="URL or upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  {newProduct.image && (
                    <p className="mt-1 text-xs text-slate-500">Image selected</p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Price (€)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newProduct.price ?? 0}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Points</label>
                  <input
                    type="number"
                    value={newProduct.pointsReward ?? 0}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        pointsReward: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">
                  Allergens (comma separated)
                </label>
                <input
                  type="text"
                  value={(newProduct.allergens || []).join(', ')}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      allergens: e.target.value
                        .split(',')
                        .map((v) => v.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Γάλα, Γλουτένη"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddProduct} style={{ backgroundColor: ACCENT }} className="text-white">
                  Save product
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage categories modal */}
      {isManageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Manage categories</h2>
              <button className="text-sm" onClick={() => setIsManageOpen(false)}>
                Close
              </button>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto pb-2">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{cat === 'All' ? 'All Dishes' : cat}</span>
                  {cat === 'All' ? (
                    <span className="text-xs text-slate-400">default</span>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => deleteCategory(cat)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-xs font-medium">New category</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Enter category name"
                />
                <Button
                  size="sm"
                  onClick={handleAddCategory}
                  style={{ backgroundColor: ACCENT }}
                  className="text-white"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
