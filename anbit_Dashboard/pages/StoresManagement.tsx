import React, { useEffect, useMemo, useState } from 'react';
import type { ApiMerchantUser, ApiProduct } from '@/services/api';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';

const StoresManagement: React.FC = () => {
  const [merchants, setMerchants] = useState<ApiMerchantUser[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');

  const [isLoadingMerchants, setIsLoadingMerchants] = useState(false);
  const [merchantsError, setMerchantsError] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSavingCategories, setIsSavingCategories] = useState(false);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductXp, setNewProductXp] = useState('');
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productMessage, setProductMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadMerchants = async () => {
      setIsLoadingMerchants(true);
      setMerchantsError(null);
      try {
        const data = await api.getMerchants();
        setMerchants(data);
        if (data.length > 0) {
          setSelectedMerchantId(data[0].id);
        }
      } catch (e) {
        console.error(e);
        setMerchantsError('Αποτυχία φόρτωσης merchants.');
      } finally {
        setIsLoadingMerchants(false);
      }
    };

    void loadMerchants();
  }, []);

  useEffect(() => {
    if (!selectedMerchantId) return;

    const loadForMerchant = async () => {
      setIsLoadingCategories(true);
      setCategoriesError(null);
      setIsLoadingProducts(true);
      setProductsError(null);

      try {
        const [cats, allProducts] = await Promise.all([
          api.getMerchantCategories(selectedMerchantId),
          api.getProducts(),
        ]);

        setCategories(cats);
        setProducts(allProducts.filter((p) => p.merchantId === selectedMerchantId));
      } catch (e) {
        console.error(e);
        setCategoriesError('Αποτυχία φόρτωσης κατηγοριών για τον merchant.');
        setProductsError('Αποτυχία φόρτωσης προϊόντων για τον merchant.');
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingProducts(false);
      }
    };

    void loadForMerchant();
  }, [selectedMerchantId]);

  const effectiveCategories = useMemo(
    () => Array.from(new Set(categories)).sort(),
    [categories],
  );

  const handleAddCategoryLocal = () => {
    const value = newCategoryName.trim();
    if (!value) return;
    if (effectiveCategories.includes(value)) {
      alert('Η κατηγορία υπάρχει ήδη.');
      return;
    }
    setCategories((prev) => [...prev, value]);
    setNewCategoryName('');
  };

  const handleDeleteCategoryLocal = (name: string) => {
    const inUse = products.some((p) => p.category === name);
    if (inUse) {
      alert('Η κατηγορία χρησιμοποιείται από προϊόντα αυτού του merchant.');
      return;
    }
    setCategories((prev) => prev.filter((c) => c !== name));
  };

  const handleSaveCategories = async () => {
    if (!selectedMerchantId) return;
    setIsSavingCategories(true);
    setCategoriesError(null);
    try {
      await api.upsertMerchantCategories(
        { categories: effectiveCategories },
        selectedMerchantId,
      );
    } catch (e) {
      console.error(e);
      setCategoriesError('Αποτυχία αποθήκευσης κατηγοριών για τον merchant.');
    } finally {
      setIsSavingCategories(false);
    }
  };

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedMerchantId) return;

    setProductMessage(null);

    if (!newProductName.trim()) {
      setProductMessage('Συμπλήρωσε όνομα προϊόντος.');
      return;
    }
    if (!newProductCategory.trim()) {
      setProductMessage('Επίλεξε κατηγορία.');
      return;
    }
    const price = Number(String(newProductPrice).replace(',', '.'));
    if (!Number.isFinite(price) || price <= 0) {
      setProductMessage('Η τιμή πρέπει να είναι μεγαλύτερη από 0.');
      return;
    }
    const xpValue = Number(String(newProductXp || '0').replace(',', '.'));
    const xp = Number.isFinite(xpValue) && xpValue >= 0 ? xpValue : 0;

    try {
      setIsCreatingProduct(true);
      await api.createProduct(
        {
          name: newProductName.trim(),
          description: newProductDescription.trim(),
          category: newProductCategory,
          price,
          xp,
          allergens: [],
        },
        selectedMerchantId,
      );

      setNewProductName('');
      setNewProductDescription('');
      setNewProductCategory('');
      setNewProductPrice('');
      setNewProductXp('');
      setProductMessage('Το προϊόν δημιουργήθηκε για τον merchant.');

      const allProducts = await api.getProducts();
      setProducts(allProducts.filter((p) => p.merchantId === selectedMerchantId));
    } catch (e) {
      console.error(e);
      setProductMessage('Αποτυχία δημιουργίας προϊόντος για τον merchant.');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900">
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-6 md:px-8 md:py-8"
        style={{
          background:
            'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 50%, #93c5fd 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-sky-700 mb-2">
              Platform Administrator
            </p>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Stores Management
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
              Επίλεξε merchant και διαμόρφωσε για λογαριασμό του κατηγορίες και
              προϊόντα, ώστε οι νέοι συνεργάτες να έχουν έτοιμο κατάλογο.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Επιλογή Merchant
            </h2>
            {merchantsError && (
              <p className="mb-2 text-xs text-red-600">{merchantsError}</p>
            )}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">
                Merchant
              </label>
              <select
                value={selectedMerchantId}
                onChange={(e) => setSelectedMerchantId(e.target.value)}
                disabled={isLoadingMerchants || merchants.length === 0}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
              >
                {isLoadingMerchants && <option>Φόρτωση merchants...</option>}
                {!isLoadingMerchants && merchants.length === 0 && (
                  <option>Δεν υπάρχουν merchants</option>
                )}
                {!isLoadingMerchants &&
                  merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.username} ({m.email})
                    </option>
                  ))}
              </select>
              <p className="text-[11px] text-slate-500">
                Ο κατάλογος που θα φτιάξεις θα ανήκει στον επιλεγμένο merchant
                και θα εμφανίζεται στο δικό του dashboard και στο Anbit Wallet.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Κατηγορίες καταλόγου Merchant
              </h2>
              <Button
                size="sm"
                onClick={handleSaveCategories}
                disabled={isSavingCategories || !selectedMerchantId}
                className="text-xs"
              >
                {isSavingCategories ? 'Αποθήκευση...' : 'Αποθήκευση κατηγοριών'}
              </Button>
            </div>
            {isLoadingCategories && (
              <p className="text-xs text-slate-500 mb-2">
                Φόρτωση κατηγοριών για τον merchant...
              </p>
            )}
            {categoriesError && (
              <p className="text-xs text-red-600 mb-2">{categoriesError}</p>
            )}
            <div className="max-h-52 space-y-2 overflow-y-auto pb-2">
              {effectiveCategories.length === 0 && !isLoadingCategories && (
                <p className="text-xs text-slate-500">
                  Δεν υπάρχουν ακόμα κατηγορίες για αυτόν τον merchant.
                </p>
              )}
              {effectiveCategories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{cat}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleDeleteCategoryLocal(cat)}
                  >
                    Διαγραφή
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Νέα κατηγορία
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategoryLocal()}
                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Όνομα κατηγορίας (π.χ. Καφέδες)"
                />
                <Button size="sm" onClick={handleAddCategoryLocal}>
                  Προσθήκη
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Προσθήκη προϊόντος για τον επιλεγμένο merchant
            </h2>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              {productMessage && (
                <p className="rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-700">
                  {productMessage}
                </p>
              )}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Όνομα προϊόντος
                </label>
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Περιγραφή
                </label>
                <textarea
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-200 min-h-[80px] resize-y"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Κατηγορία
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                  >
                    <option value="">Επίλεξε κατηγορία</option>
                    {effectiveCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Τιμή (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Πόντοι (XP)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newProductXp}
                  onChange={(e) => setNewProductXp(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-200"
                />
              </div>
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isCreatingProduct || !selectedMerchantId}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-[#0C0C0C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#0C0C0C]/30 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreatingProduct ? 'Δημιουργία...' : 'Δημιουργία προϊόντος'}
                </Button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Προϊόντα Merchant
              </h2>
            </div>
            {isLoadingProducts && (
              <p className="text-xs text-slate-500 mb-2">
                Φόρτωση προϊόντων για τον merchant...
              </p>
            )}
            {productsError && (
              <p className="text-xs text-red-600 mb-2">{productsError}</p>
            )}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {products.length === 0 && !isLoadingProducts && (
                <p className="text-xs text-slate-500">
                  Δεν υπάρχουν προϊόντα για αυτόν τον merchant ακόμα.
                </p>
              )}
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {p.category} • €{p.price.toFixed(2)} • XP {p.xp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoresManagement;

