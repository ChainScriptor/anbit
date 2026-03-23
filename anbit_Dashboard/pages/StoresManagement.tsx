import React, { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { api } from '@/services/api';
import {
  isLocalRegistryMerchantId,
  mergeMerchantsWithLocalRegistry,
} from '@/utils/merchantRegistry';
import type { ApiMerchantUser, ApiProduct } from '@/services/api';
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
        const { merchants: data } = await api.getMerchantsDirectory();
        const merged = mergeMerchantsWithLocalRegistry(data);
        setMerchants(merged);
        const firstWithGuid = merged.find((m) => !isLocalRegistryMerchantId(m.id));
        if (firstWithGuid) {
          setSelectedMerchantId(firstWithGuid.id);
        } else if (merged.length > 0) {
          setSelectedMerchantId(merged[0].id);
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
        const merchantProducts = await api.getProductsByMerchantId(
          selectedMerchantId,
        );
        setProducts(merchantProducts);

        // Χωρίς κλήση GET /merchants/categories: το backend επιτρέπει μόνο ρόλο Merchant → 403 για admin.
        const fromProducts = Array.from(
          new Set(
            merchantProducts
              .map((p) => p.category?.trim())
              .filter((c): c is string => Boolean(c)),
          ),
        );

        const merged = Array.from(new Set(fromProducts)).sort((a, b) =>
          a.localeCompare(b, 'el'),
        );
        setCategories(merged);
      } catch (e) {
        console.error(e);
        setProducts([]);
        setCategories([]);
        setCategoriesError(null);
        setProductsError(
          'Αποτυχία φόρτωσης προϊόντων για τον επιλεγμένο merchant.',
        );
      } finally {
        setIsLoadingCategories(false);
        setIsLoadingProducts(false);
      }
    };

    void loadForMerchant();
  }, [selectedMerchantId]);

  useEffect(() => {
    setProductMessage(null);
    setNewProductName('');
    setNewProductDescription('');
    setNewProductCategory('');
    setNewProductPrice('');
    setNewProductXp('');
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
      if (isAxiosError(e) && e.response?.status === 403) {
        setCategoriesError(
          'Το API αποθηκεύει κατηγορίες μόνο για ρόλο Merchant. Ως admin χρησιμοποίησε το merchant panel ή δημιούργησε προϊόν με νέα κατηγορία.',
        );
      } else {
        setCategoriesError('Αποτυχία αποθήκευσης κατηγοριών για τον merchant.');
      }
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
      // Keep points optional in UI; use a safe backend-compatible fallback.
      const xp = Number.isFinite(xpValue) && xpValue > 0 ? Math.trunc(xpValue) : 1;

    try {
      setIsCreatingProduct(true);
      const formData = new FormData();
      // Backend CreateProductRequest is [FromForm] with PascalCase property names.
      formData.append('Name', newProductName.trim());
      formData.append('Description', newProductDescription.trim() || 'N/A');
      formData.append('Category', newProductCategory);
      formData.append('Price', String(price));
      formData.append('Xp', String(xp));

      await api.createProduct(formData, selectedMerchantId);

      setNewProductName('');
      setNewProductDescription('');
      setNewProductCategory('');
      setNewProductPrice('');
      setNewProductXp('');
      setProductMessage('Το προϊόν δημιουργήθηκε για τον merchant.');

      const refreshed = await api.getProductsByMerchantId(selectedMerchantId);
      setProducts(refreshed);
      const fromProducts = Array.from(
        new Set(
          refreshed
            .map((p) => p.category?.trim())
            .filter((c): c is string => Boolean(c)),
        ),
      );
      setCategories((prev) =>
        Array.from(new Set([...prev, ...fromProducts])).sort((a, b) =>
          a.localeCompare(b, 'el'),
        ),
      );
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
              προϊόντα.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-4xl flex-col gap-6">
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
              Οι κατηγορίες και τα προϊόντα παρακάτω ενημερώνονται για τον
              επιλεγμένο merchant.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Κατηγορίες του επιλεγμένου merchant
              </h2>
              <p className="mt-1 text-[11px] text-slate-500">
                Προβολή από τα <strong>προϊόντα</strong> του merchant (δεν καλείται το API
                κατηγοριών — για admin επιστρέφει 403).
              </p>
            </div>
            <Button
              size="sm"
              type="button"
              onClick={() => void handleSaveCategories()}
              disabled={isSavingCategories || !selectedMerchantId}
              className="text-xs"
              title="Μπορεί να αποτύχει με 403 αν το API δέχεται μόνο merchant"
            >
              {isSavingCategories ? 'Αποθήκευση...' : 'Αποθήκευση στο API'}
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
                Δεν υπάρχουν ακόμα κατηγορίες (ή δεν έχει προϊόντα με κατηγορία).
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

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Προϊόντα του επιλεγμένου merchant
            </h2>
          </div>
          {isLoadingProducts && (
            <p className="text-xs text-slate-500 mb-2">
              Φόρτωση προϊόντων...
            </p>
          )}
          {productsError && (
            <p className="text-xs text-red-600 mb-2">{productsError}</p>
          )}
          <div className="space-y-2 max-h-80 overflow-y-auto">
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
                    {p.category} • €{Number(p.price).toFixed(2)} • XP {p.xp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Προσθήκη προϊόντος για τον επιλεγμένο merchant
          </h2>
          <p className="mb-4 text-[11px] text-slate-500">
            Η δημιουργία προϊόντος στο API απαιτεί συνήθως σύνδεση ως ο ίδιος ο
            merchant· αν αποτύχει, χρησιμοποίησε το merchant panel ή έλεγξε
            δικαιώματα.
          </p>
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
      </div>
    </div>
  );
};

export default StoresManagement;

