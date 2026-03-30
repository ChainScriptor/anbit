import React, { useEffect, useMemo, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Search,
  Plus,
  Filter,
  Image as ImageIcon,
  MoreHorizontal,
  Pencil,
  Trash2,
  Power,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';
import { useAuth } from '@/AuthContext';

const ACCENT = '#0a0a0a';
const PLACEHOLDER_PRODUCT_IMAGE =
  'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400';
const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;

function formatProductImageApiError(e: unknown): string {
  if (isAxiosError(e)) {
    const status = e.response?.status;
    if (status === 401 || status === 403) {
      return 'Δεν έχεις δικαίωμα για αυτή την ενέργεια. Χρειάζεται merchant λογαριασμός.';
    }
    if (status === 413) {
      return 'Το αρχείο είναι πολύ μεγάλο για τον server.';
    }
    const data = e.response?.data as
      | { error?: string; Error?: string; message?: string }
      | undefined;
    const msg = data?.error ?? data?.Error ?? data?.message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return 'Αποτυχία εικόνας. Δοκίμασε ξανά.';
}

function getCategoryPreviewImage(category: string): string {
  const key = category.toLowerCase();
  if (key.includes('coffee') || key.includes('καφέ')) {
    return 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  if (key.includes('dessert') || key.includes('γλυκ')) {
    return 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  if (key.includes('salad') || key.includes('lunch') || key.includes('vegan')) {
    return 'https://images.pexels.com/photos/1213710/pexels-photo-1213710.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  if (key.includes('burger')) {
    return 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800';
  }
  return 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=800';
}

const Products: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'listing' | 'options' | 'categories'>('listing');
  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState<Partial<Product> & { price?: string; pointsReward?: string }>({
    name: '',
    category: '',
    price: '',
    pointsReward: '',
    image: '',
    allergens: [],
    isActive: true,
  });
  const [newProductImageFile, setNewProductImageFile] = useState<File | null>(null);
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [isSyncingCategories, setIsSyncingCategories] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [openMenuProductId, setOpenMenuProductId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [imageFieldBusy, setImageFieldBusy] = useState(false);
  const [showDeleteImageConfirm, setShowDeleteImageConfirm] = useState(false);
  const [modalImageError, setModalImageError] = useState<string | null>(null);

  const loadProducts = async (): Promise<Product[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const allProducts = await api.getProducts();
      const currentUser = user ?? null;
      const filtered =
        currentUser != null
          ? allProducts.filter((p) => p.merchantId === currentUser.id)
          : allProducts;

      const mapped: Product[] = filtered.map((p) => {
        const url = p.imageUrl && String(p.imageUrl).trim() ? String(p.imageUrl) : null;
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category ?? 'Menu',
          price: p.price,
          pointsReward: p.xp,
          serverImageUrl: url,
          image: url || PLACEHOLDER_PRODUCT_IMAGE,
          isActive: true,
          allergens: [],
        };
      });
      setItems(mapped);
      return mapped;
    } catch (e) {
      setError('Αποτυχία φόρτωσης προϊόντων.');
      console.error(e);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await loadProducts();
      // Αρχικό sync κατηγοριών από backend
      try {
        setIsLoadingCategories(true);
        setCategoriesError(null);
        const categoriesFromApi = await api.getMerchantCategories();
        setExtraCategories(categoriesFromApi);
      } catch (e: unknown) {
        console.error(e);
        const status = (e as { response?: { status?: number } })?.response?.status;
        setCategoriesError(
          status === 403
            ? 'Δεν έχετε δικαιώματα για κατηγορίες. Χρειάζεται ρόλος Merchant ή Admin.'
            : 'Αποτυχία φόρτωσης κατηγοριών merchant.'
        );
      } finally {
        setIsLoadingCategories(false);
      }
    })();
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

  const allVisibleSelected = products.length > 0 && products.every((p) => selectedProductIds.has(p.id));
  const selectedVisibleCount = products.filter((p) => selectedProductIds.has(p.id)).length;
  const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>();
    products.forEach((p) => {
      const key = p.category || 'Χωρίς κατηγορία';
      const arr = groups.get(key) ?? [];
      arr.push(p);
      groups.set(key, arr);
    });
    return Array.from(groups.entries()).map(([category, groupItems]) => ({
      category,
      items: groupItems,
      unavailableCount: groupItems.filter((p) => !p.isActive).length,
    }));
  }, [products]);

  const optionsCount = useMemo(
    () => items.reduce((sum, p) => sum + (p.allergens?.length ?? 0), 0),
    [items],
  );

  const resetForm = () => {
    const defaultCategory =
      activeCategory === 'All'
        ? categories.find((c) => c !== 'All') ?? 'Menu'
        : activeCategory;

    setNewProduct({
      name: '',
      category: defaultCategory,
      price: '',
      pointsReward: '',
      image: '',
      allergens: [],
      isActive: true,
    });
    setNewProductImageFile(null);
    // Ensure selecting the same file again triggers `onChange`.
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setEditingProductId(null);
    setModalImageError(null);
    setShowDeleteImageConfirm(false);
    setImageFieldBusy(false);
  };

  const startEditProduct = (product: Product) => {
    setSaveError(null);
    setSaveSuccess(null);
    setModalImageError(null);
    setShowDeleteImageConfirm(false);
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description ?? '',
      category: product.category,
      price: String(product.price),
      pointsReward: String(product.pointsReward ?? 0),
      image: product.image,
      serverImageUrl: product.serverImageUrl ?? null,
      allergens: product.allergens ?? [],
      isActive: product.isActive,
    });
    setNewProductImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsAddOpen(true);
  };

  const handleAddProduct = async () => {
    setSaveError(null);
    setSaveSuccess(null);

    if (!newProduct.name?.trim()) {
      setSaveError('Συμπλήρωσε τουλάχιστον όνομα προϊόντος.');
      return;
    }
    if (!newProduct.category?.trim()) {
      setSaveError('Επίλεξε κατηγορία.');
      return;
    }
    const price = Number(String(newProduct.price ?? '').replace(',', '.'));
    if (Number.isNaN(price) || price <= 0) {
      setSaveError('Η τιμή πρέπει να είναι μεγαλύτερη από 0.');
      return;
    }
    const xpValue = Number(String(newProduct.pointsReward ?? '').replace(',', '.'));
    // Backend expects int Xp. Ensure we send a clean integer.
    const xp = Number.isNaN(xpValue) || xpValue < 0 ? 0 : Math.trunc(xpValue);
    if (!editingProductId && !newProductImageFile) {
      setSaveError('Επίλεξε αρχείο εικόνας (upload).');
      return;
    }

    if (editingProductId) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === editingProductId
            ? {
                ...p,
                name: newProduct.name?.trim() || p.name,
                description: newProduct.description?.trim() || p.description,
                category: newProduct.category || p.category,
                price,
                pointsReward: xp > 0 ? xp : 1,
                image: newProduct.image || p.image,
                allergens: newProduct.allergens ?? [],
              }
            : p,
        ),
      );
      setIsAddOpen(false);
      resetForm();
      setSaveSuccess('Το προϊόν ενημερώθηκε επιτυχώς!');
      return;
    }
    try {
      setIsSaving(true);
      const formData = new FormData();
      // Backend CreateProductRequest is [FromForm] with PascalCase property names.
      formData.append('Name', newProduct.name.trim());
      formData.append('Description', newProduct.description?.trim() || 'N/A');
      formData.append('Category', newProduct.category || 'Menu');
      formData.append('Price', String(price));
      formData.append('Xp', String(xp > 0 ? xp : 1));
      for (const allergen of newProduct.allergens ?? []) {
        formData.append('Allergens', allergen);
      }
      formData.append('Image', newProductImageFile);

      await api.createProduct(formData);
      setIsAddOpen(false);
      resetForm();
      await loadProducts();
      setSaveSuccess('Το προϊόν δημιουργήθηκε με επιτυχία!');
    } catch (e: unknown) {
      console.error(e);
      const err = e as { response?: { data?: { error?: string; Error?: string } } };
      const message =
        err.response?.data?.error ??
        err.response?.data?.Error ??
        'Αποτυχία δημιουργίας προϊόντος. Ελέγξτε ότι η κατηγορία έχει αποθηκευτεί (Διαχείριση κατηγοριών) και τα πεδία.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
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

  const handleModalImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setModalImageError(null);

    if (!file.type.startsWith('image/')) {
      setModalImageError('Επίλεξε έγκυρο αρχείο εικόνας.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_PRODUCT_IMAGE_BYTES) {
      setModalImageError('Το αρχείο είναι πολύ μεγάλο. Μέγιστο ~10MB.');
      e.target.value = '';
      return;
    }

    if (editingProductId) {
      setImageFieldBusy(true);
      try {
        await api.uploadProductImage(editingProductId, file);
        const list = await loadProducts();
        const row = list.find((p) => p.id === editingProductId);
        if (row) {
          setNewProduct((prev) => ({
            ...prev,
            image: row.image,
            serverImageUrl: row.serverImageUrl ?? null,
          }));
        }
        setNewProductImageFile(null);
      } catch (err) {
        console.error(err);
        setModalImageError(formatProductImageApiError(err));
      } finally {
        setImageFieldBusy(false);
        e.target.value = '';
      }
      return;
    }

    setNewProductImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct((prev) => ({
        ...prev,
        image: typeof reader.result === 'string' ? reader.result : prev.image,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmDeleteProductImage = async () => {
    if (!editingProductId) return;
    setModalImageError(null);
    setImageFieldBusy(true);
    try {
      await api.deleteProductImage(editingProductId);
      const list = await loadProducts();
      const row = list.find((p) => p.id === editingProductId);
      if (row) {
        setNewProduct((prev) => ({
          ...prev,
          image: row.image,
          serverImageUrl: row.serverImageUrl ?? null,
        }));
      }
      setShowDeleteImageConfirm(false);
    } catch (err) {
      console.error(err);
      setModalImageError(formatProductImageApiError(err));
    } finally {
      setImageFieldBusy(false);
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        products.forEach((p) => next.delete(p.id));
      } else {
        products.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const deleteProducts = (ids: string[]) => {
    if (ids.length === 0) return;
    setItems((prev) => prev.filter((p) => !ids.includes(p.id)));
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    setOpenMenuProductId(null);
  };

  const deactivateProducts = (ids: string[]) => {
    if (ids.length === 0) return;
    setItems((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, isActive: false } : p)),
    );
    setOpenMenuProductId(null);
  };

  const selectedProductIdsArray = Array.from(selectedProductIds);
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

  const handleSaveCategories = async () => {
    const toSave = categories.filter((c) => c !== 'All');
    setIsSyncingCategories(true);
    setCategoriesError(null);
    try {
      await api.upsertMerchantCategories({ categories: toSave });
    } catch (e: unknown) {
      console.error(e);
      const status = (e as { response?: { status?: number } })?.response?.status;
      setCategoriesError(
        status === 403
          ? 'Δεν έχετε δικαιώματα για να επεξεργαστείτε κατηγορίες. Χρειάζεται ρόλος Merchant ή Admin.'
          : 'Αποτυχία αποθήκευσης κατηγοριών.'
      );
    } finally {
      setIsSyncingCategories(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-[#f8f9fa] text-slate-900">
      <div className="space-y-6 rounded-3xl bg-[#f8f9fa] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Menu Management</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Curate your restaurant offerings and stock levels
            </p>
          </div>
          <Button
            className="h-12 rounded-2xl px-6 text-sm font-bold text-white shadow-lg shadow-red-600/20"
            style={{ backgroundColor: ACCENT }}
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Product
          </Button>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-2xl bg-slate-200/70 p-1.5">
          {[
            { key: 'listing' as const, label: `Products (${items.length})` },
            { key: 'options' as const, label: `Options (${optionsCount})` },
            { key: 'categories' as const, label: `Categories (${categories.length - 1})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'rounded-xl px-6 py-2.5 text-sm font-semibold transition-all',
                activeTab === tab.key
                  ? 'bg-white text-[#0a0a0a] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'listing' && (
          <div className="space-y-8">
            {(isLoading || error) && (
              <div className="space-y-1">
                {isLoading && <p className="text-sm text-slate-500">Φόρτωση προϊόντων...</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            )}

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-xl">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dish, category or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border-0 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/20"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={toggleSelectAllVisible}>
                  {allVisibleSelected ? 'Unselect' : 'Bulk Edit'} ({selectedVisibleCount})
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Images
                </Button>
              </div>
            </div>

            {groupedProducts.map((group) => (
              <section key={group.category} className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-1.5 rounded-full bg-[#0a0a0a]" />
                  <h3 className="text-xl font-bold text-slate-900">
                    {group.category}
                    <span className="ml-2 text-base font-medium text-slate-500">({group.items.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((product) => (
                    <article
                      key={product.id}
                      className="relative rounded-3xl bg-white p-5 shadow-[0_16px_40px_-24px_rgba(25,28,29,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.has(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="rounded border-slate-300"
                        />
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-base font-bold text-slate-900">{product.name}</h4>
                          <p className="mt-0.5 text-sm font-bold text-[#0a0a0a]">€{product.price.toFixed(2)}</p>
                          <p className="text-xs font-semibold text-amber-700">+{product.pointsReward ?? 0} XP</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                product.isActive ? 'bg-emerald-500' : 'bg-slate-400',
                              )}
                            />
                            <span className={cn('text-[10px] font-bold uppercase tracking-wider', product.isActive ? 'text-emerald-600' : 'text-slate-500')}>
                              {product.isActive ? 'In Stock' : 'Sold Out'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            type="button"
                            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            onClick={() =>
                              setOpenMenuProductId((prev) => (prev === product.id ? null : product.id))
                            }
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {openMenuProductId === product.id && (
                        <div className="absolute right-4 top-14 z-20 min-w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            onClick={() => {
                              startEditProduct(product);
                              setOpenMenuProductId(null);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-amber-700 hover:bg-amber-50"
                            onClick={() => deactivateProducts([product.id])}
                          >
                            <Power className="h-4 w-4" />
                            Deactivate
                          </button>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => deleteProducts([product.id])}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {activeTab === 'options' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Εδώ εμφανίζονται οι επιλογές προϊόντων (allergens/options). Προς το παρόν: {optionsCount}{' '}
            συνολικές επιλογές.
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            {isLoadingCategories && <p className="text-sm text-slate-500">Φόρτωση κατηγοριών...</p>}
            {categoriesError && <p className="text-sm text-red-600">{categoriesError}</p>}
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-200/70 p-1.5">
                <span className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-600">
                  Categories ({categories.length - 1})
                </span>
              </div>
              <Button
                onClick={() => setIsManageOpen(true)}
                style={{ backgroundColor: ACCENT }}
                className="rounded-xl text-white shadow-lg shadow-red-600/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsManageOpen(true)} style={{ backgroundColor: ACCENT }} className="text-white rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Προσθήκη κατηγορίας
              </Button>
              <Button variant="outline" onClick={handleSaveCategories} disabled={isSyncingCategories} className="rounded-xl">
                {isSyncingCategories ? 'Αποθήκευση...' : 'Αποθήκευση αλλαγών'}
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {categories
                .filter((c) => c !== 'All')
                .map((cat) => (
                  <article
                    key={cat}
                    className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_12px_30px_-24px_rgba(25,28,29,0.25)] transition-all hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="overflow-hidden rounded-xl">
                          <img
                            src={getCategoryPreviewImage(cat)}
                            alt={cat}
                            className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                        <p className="mt-2 truncate text-lg font-medium text-slate-900">{cat}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 pt-2 text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => setNewCategoryName(cat)}
                          className="rounded px-2 py-1 hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat)}
                          className="rounded px-2 py-1 text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Add product modal */}
      {isAddOpen && (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingProductId ? 'Edit product' : 'Add product'}</h2>
              <button
                className="text-sm"
                onClick={() => {
                  setIsAddOpen(false);
                  resetForm();
                }}
              >
                Close
              </button>
            </div>
              <div className="space-y-4">
              {saveError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  {saveError}
                </p>
              )}
              {saveSuccess && (
                <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  {saveSuccess}
                </p>
              )}
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
              <div className="space-y-1">
                <label className="text-xs font-medium">Description</label>
                <textarea
                  value={newProduct.description || ''}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm min-h-[80px] resize-y"
                  placeholder="Περιγραφή πιάτου, υλικά, σημειώσεις..."
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
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Hero shot
                  </label>
                  <div
                    className={cn(
                      'relative overflow-hidden rounded-xl border-[3px] border-slate-900 bg-gradient-to-br from-amber-200/90 via-white to-red-100/80 p-4 shadow-[6px_6px_0_0_rgba(10,10,10,1)]',
                      imageFieldBusy && 'pointer-events-none opacity-80',
                    )}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.12]"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle, #0a0a0a 1.2px, transparent 1.2px)',
                        backgroundSize: '10px 10px',
                      }}
                      aria-hidden
                    />
                    <div className="relative flex flex-col gap-3 sm:flex-row sm:items-stretch">
                      <button
                        type="button"
                        onClick={() => !imageFieldBusy && fileInputRef.current?.click()}
                        className="group relative flex min-h-[120px] flex-1 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-900/40 bg-white/70 px-4 py-6 text-center transition hover:border-slate-900 hover:bg-white"
                      >
                        {imageFieldBusy ? (
                          <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
                        ) : (
                          <>
                            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-300 text-slate-900 shadow-[3px_3px_0_0_#0a0a0a]">
                              <ImageIcon className="h-6 w-6" strokeWidth={2.2} />
                            </span>
                            <span className="text-xs font-black uppercase tracking-wide text-slate-900">
                              {editingProductId ? 'Drop / tap — uploads now' : 'Choose cover art'}
                            </span>
                            <span className="max-w-[220px] text-[11px] font-medium leading-snug text-slate-600">
                              {editingProductId
                                ? 'Η εικόνα ανεβαίνει αμέσως στο server (PUT).'
                                : 'Θα σταλεί μαζί με το Save προϊόντος.'}
                            </span>
                          </>
                        )}
                      </button>
                      <div className="relative flex w-full shrink-0 overflow-hidden rounded-lg border-2 border-slate-900 bg-slate-900 sm:w-36">
                        <img
                          src={newProduct.image || PLACEHOLDER_PRODUCT_IMAGE}
                          alt=""
                          className="h-full min-h-[120px] w-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-black uppercase text-slate-900">
                          Preview
                        </span>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={imageFieldBusy}
                      onChange={(ev) => void handleModalImageSelected(ev)}
                    />
                    {editingProductId && Boolean(newProduct.serverImageUrl) && (
                      <div className="relative mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={imageFieldBusy}
                          className="h-8 border-2 border-red-600 bg-white text-[10px] font-black uppercase tracking-wide text-red-700 hover:bg-red-50"
                          onClick={() => setShowDeleteImageConfirm(true)}
                        >
                          Delete image
                        </Button>
                      </div>
                    )}
                    {!editingProductId && newProductImageFile && (
                      <p className="relative mt-2 text-[11px] font-semibold text-slate-700">
                        Επιλέχθηκε: {newProductImageFile.name}
                      </p>
                    )}
                  </div>
                  {modalImageError && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {modalImageError}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Price (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="π.χ. 5,50"
                    value={newProduct.price ?? ''}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        price: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Points</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="π.χ. 10"
                    value={newProduct.pointsReward ?? ''}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        pointsReward: e.target.value,
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddProduct}
                  disabled={isSaving}
                  style={{ backgroundColor: ACCENT }}
                  className="text-white"
                >
                  {isSaving ? 'Saving...' : editingProductId ? 'Save changes' : 'Save product'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {showDeleteImageConfirm && editingProductId && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-image-title"
          >
            <div className="w-full max-w-sm rounded-xl border-[3px] border-slate-900 bg-white p-5 shadow-[6px_6px_0_0_#0a0a0a]">
              <p id="delete-image-title" className="text-sm font-black uppercase tracking-wide text-slate-900">
                Remove hero shot?
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Η εικόνα θα αφαιρεθεί από το προϊόν στο server (DELETE).
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={imageFieldBusy}
                  onClick={() => setShowDeleteImageConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={imageFieldBusy}
                  onClick={() => void handleConfirmDeleteProductImage()}
                  className="gap-2"
                >
                  {imageFieldBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
        </>
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
