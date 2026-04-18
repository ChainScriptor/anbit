import React, { useEffect, useMemo, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import {
  CheckSquare,
  Circle,
  Filter,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Save,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  api,
  type ApiProduct,
  type ApiProductOptionGroupRow,
  type ProductOptionGroupApiPayload,
} from '@/services/api';
import type { ProductOptionGroupFromApi } from '@/types';
import { useAuth } from '@/AuthContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const ACCENT = '#0a0a0a';
const PLACEHOLDER_IMAGE =
  'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400';
const MAX_PRODUCT_IMAGE_BYTES = 10 * 1024 * 1024;
const OPTION_GROUPS_KEY = 'anbit_product_option_groups_v1';

// ─── Option group types ───────────────────────────────────────────────────────
type OptionGroupType = 'radio' | 'checkbox';

type OptionChoice = {
  id: string;
  label: string;
  priceModifier: number; // 0 = free, >0 = paid extra
};

type OptionGroup = {
  id: string;
  name: string;
  type: OptionGroupType;
  required: boolean; // meaningful only for radio
  choices: OptionChoice[];
  assignedProductIds: string[];
  assignedCategories: string[];
};

type GroupDraft = {
  name: string;
  type: OptionGroupType;
  required: boolean;
  choices: OptionChoice[];
  assignedProductIds: string[];
  assignedCategories: string[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function convertAvifToWebp(file: File): Promise<File> {
  if (file.type !== 'image/avif') return file;
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Δεν ήταν δυνατή η επεξεργασία AVIF.');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/webp', 0.92));
  if (!blob) throw new Error('Αποτυχία μετατροπής AVIF σε WebP.');
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
}

function formatImageApiError(e: unknown): string {
  if (isAxiosError(e)) {
    const s = e.response?.status;
    if (s === 401 || s === 403) return 'Δεν έχεις δικαίωμα. Χρειάζεται merchant λογαριασμός.';
    if (s === 413) return 'Το αρχείο είναι πολύ μεγάλο για τον server.';
    const d = e.response?.data as { error?: string; Error?: string; message?: string } | undefined;
    const msg = d?.error ?? d?.Error ?? d?.message;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return 'Αποτυχία εικόνας. Δοκίμασε ξανά.';
}

function readOptionGroups(): OptionGroup[] {
  try {
    const raw = localStorage.getItem(OPTION_GROUPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OptionGroup[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function writeOptionGroups(groups: OptionGroup[]): void {
  localStorage.setItem(OPTION_GROUPS_KEY, JSON.stringify(groups));
}

const EMPTY_GROUP_DRAFT: GroupDraft = {
  name: '', type: 'radio', required: true,
  choices: [], assignedProductIds: [], assignedCategories: [],
};

function mapApiProductOptionGroupsToProduct(
  rows?: ApiProduct['optionGroups'],
): ProductOptionGroupFromApi[] | undefined {
  if (!rows?.length) return undefined;
  return rows.map((g) => ({
    id: g.id,
    name: g.name,
    type: g.type,
    options: g.options.map((o) => ({ id: o.id, name: o.name, price: o.price })),
  }));
}

function mapUiGroupToApiPayload(group: OptionGroup): ProductOptionGroupApiPayload {
  return {
    name: group.name.trim(),
    type: group.type === 'radio' ? 'Single' : 'Multiple',
    options: group.choices.map((c) => ({ name: c.label.trim(), price: c.priceModifier })),
  };
}

function mapGroupDraftToApiPayload(draft: GroupDraft): ProductOptionGroupApiPayload | null {
  const name = draft.name.trim();
  if (!name || draft.choices.length < 1) return null;
  return {
    name,
    type: draft.type === 'radio' ? 'Single' : 'Multiple',
    options: draft.choices.map((c) => ({ name: c.label.trim(), price: c.priceModifier })),
  };
}

function mapApiTemplateRowToUi(row: ApiProductOptionGroupRow): OptionGroup {
  return {
    id: row.id,
    name: row.name,
    type: row.type === 'Multiple' ? 'checkbox' : 'radio',
    required: row.type === 'Single',
    choices: row.options.map((o) => ({
      id: o.id,
      label: o.name,
      priceModifier: o.price,
    })),
    assignedProductIds: [],
    assignedCategories: [],
  };
}

function mergeTemplateGroupsWithPreviousAssignments(
  prev: OptionGroup[],
  apiRows: ApiProductOptionGroupRow[],
): OptionGroup[] {
  return apiRows.map((row) => {
    const old =
      prev.find((g) => g.name.trim().toLowerCase() === row.name.trim().toLowerCase()) ?? null;
    const base = mapApiTemplateRowToUi(row);
    return {
      ...base,
      required: row.type === 'Single' ? (old?.required ?? true) : false,
      assignedProductIds: old?.assignedProductIds ?? [],
      assignedCategories: old?.assignedCategories ?? [],
    };
  });
}

function buildProductOptionGroupsForApi(
  libraryNames: string[],
  extraDrafts: GroupDraft[],
  template: OptionGroup[],
): ProductOptionGroupApiPayload[] {
  const lib = libraryNames
    .map((n) => template.find((g) => g.name === n))
    .filter((g): g is OptionGroup => Boolean(g))
    .map(mapUiGroupToApiPayload);
  const extra = extraDrafts
    .map((d) => mapGroupDraftToApiPayload(d))
    .filter((x): x is ProductOptionGroupApiPayload => x !== null);
  const out: ProductOptionGroupApiPayload[] = [];
  const seen = new Set<string>();
  for (const g of [...lib, ...extra]) {
    const k = g.name.trim().toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(g);
  }
  return out;
}

function mapProductOptionGroupsToApiPayload(
  rows: ProductOptionGroupFromApi[] | undefined,
): ProductOptionGroupApiPayload[] {
  if (!rows?.length) return [];
  return rows.map((g) => ({
    name: g.name.trim(),
    type: g.type,
    options: g.options.map((o) => ({ name: o.name.trim(), price: o.price })),
  }));
}

function newChoiceId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `c-${Date.now()}`;
  }
}

function splitProductGroupsForEditModal(
  product: Product,
  template: OptionGroup[],
): { libraryNames: string[]; extraDrafts: GroupDraft[] } {
  const libraryNames: string[] = [];
  const extraDrafts: GroupDraft[] = [];
  for (const og of product.optionGroups ?? []) {
    const t = template.find(
      (x) => x.name.trim().toLowerCase() === og.name.trim().toLowerCase(),
    );
    if (t) {
      if (!libraryNames.includes(t.name)) libraryNames.push(t.name);
    } else {
      extraDrafts.push({
        name: og.name,
        type: og.type === 'Multiple' ? 'checkbox' : 'radio',
        required: og.type === 'Single',
        choices: og.options.map((o) => ({
          id: o.id || newChoiceId(),
          label: o.name,
          priceModifier: o.price,
        })),
        assignedProductIds: [],
        assignedCategories: [],
      });
    }
  }
  return { libraryNames, extraDrafts };
}

// ─── Main component ───────────────────────────────────────────────────────────
const Products: React.FC = () => {
  const { user } = useAuth();

  // ── Products state ─────────────────────────────────────────────────────────
  const [items, setItems] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'listing' | 'options' | 'categories'>('listing');
  const [searchQuery, setSearchQuery] = useState('');
  const [newProduct, setNewProduct] = useState<Partial<Product> & { price?: string; pointsReward?: string }>({
    name: '', category: '', price: '', pointsReward: '', image: '', allergens: [], isActive: true,
  });
  const [newProductImageFile, setNewProductImageFile] = useState<File | null>(null);
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
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
  const [detailProductId, setDetailProductId] = useState<string | null>(null);
  const [detailDraft, setDetailDraft] = useState<{
    name: string; description: string; category: string;
    price: string; pointsReward: string; isActive: boolean;
  } | null>(null);
  const detailFileInputRef = useRef<HTMLInputElement | null>(null);
  const [detailImageBusy, setDetailImageBusy] = useState(false);
  const [detailImageError, setDetailImageError] = useState<string | null>(null);
  const [detailSaveBusy, setDetailSaveBusy] = useState(false);
  const [detailSaveError, setDetailSaveError] = useState<string | null>(null);

  /** Επιλογές προϊόντος: ομάδες από template (όνομα) + πρόχειρα μόνο-για-προϊόν. */
  const [selectedLibraryGroupNames, setSelectedLibraryGroupNames] = useState<string[]>([]);
  const [productExtraOptionDrafts, setProductExtraOptionDrafts] = useState<GroupDraft[]>([]);
  const [extraDraftChoiceLines, setExtraDraftChoiceLines] = useState<{ label: string; price: string }[]>([]);
  const [optionsTemplateError, setOptionsTemplateError] = useState<string | null>(null);
  const [optionsTemplateBusy, setOptionsTemplateBusy] = useState(false);

  // ── Option groups state ────────────────────────────────────────────────────
  const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null); // null = new
  const [groupDraft, setGroupDraft] = useState<GroupDraft | null>(null);
  const [newChoiceLabel, setNewChoiceLabel] = useState('');
  const [newChoicePrice, setNewChoicePrice] = useState('');
  const [showGroupEditor, setShowGroupEditor] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadProducts = async (): Promise<Product[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await api.getProducts();
      const filtered = user != null ? all.filter((p) => p.merchantId === user.id) : all;
      const mapped: Product[] = filtered.map((p) => {
        const url = p.imageUrl?.trim() ? p.imageUrl : null;
        return {
          id: p.id, name: p.name, description: p.description,
          category: p.category ?? 'Menu', price: p.price, pointsReward: p.xp,
          serverImageUrl: url, image: url || PLACEHOLDER_IMAGE,
          isActive: true, allergens: [],
          optionGroups: mapApiProductOptionGroupsToProduct(p.optionGroups),
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
      try {
        setIsLoadingCategories(true);
        setCategoriesError(null);
        const cats = await api.getMerchantCategories();
        setExtraCategories(cats);
      } catch (e: unknown) {
        const status = (e as { response?: { status?: number } })?.response?.status;
        setCategoriesError(
          status === 403
            ? 'Δεν έχετε δικαιώματα κατηγοριών. Χρειάζεται ρόλος Merchant.'
            : 'Αποτυχία φόρτωσης κατηγοριών.',
        );
      } finally {
        setIsLoadingCategories(false);
      }
    })();
    void (async () => {
      try {
        const serverGroups = await api.getMerchantProductOptionGroups();
        const localFallback = readOptionGroups();
        if (serverGroups.length > 0) {
          const merged = mergeTemplateGroupsWithPreviousAssignments(localFallback, serverGroups);
          setOptionGroups(merged);
          writeOptionGroups(merged);
        } else if (localFallback.length > 0) {
          setOptionGroups(localFallback);
        } else {
          setOptionGroups([]);
        }
      } catch {
        setOptionGroups(readOptionGroups());
      }
    })();
  }, []);

  // ── Computed ───────────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const base = Array.from(new Set(items.map((p) => p.category)));
    return ['All', ...Array.from(new Set([...base, ...extraCategories])).sort()];
  }, [items, extraCategories]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: items.length };
    categories.forEach((c) => { if (c !== 'All') counts[c] = items.filter((p) => p.category === c).length; });
    return counts;
  }, [items, categories]);

  const products = useMemo(() => {
    const filtered = activeCategory === 'All' ? items : items.filter((p) => p.category === activeCategory);
    if (!searchQuery.trim()) return filtered;
    const q = searchQuery.toLowerCase();
    return filtered.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [items, activeCategory, searchQuery]);

  const detailProduct = useMemo(
    () => (detailProductId ? items.find((p) => p.id === detailProductId) ?? null : null),
    [detailProductId, items],
  );

  const groupedProducts = useMemo(() => {
    const groups = new Map<string, Product[]>();
    products.forEach((p) => {
      const key = p.category || 'Χωρίς κατηγορία';
      groups.set(key, [...(groups.get(key) ?? []), p]);
    });
    return Array.from(groups.entries()).map(([category, groupItems]) => ({
      category, items: groupItems,
      unavailableCount: groupItems.filter((p) => !p.isActive).length,
    }));
  }, [products]);

  const allVisibleSelected = products.length > 0 && products.every((p) => selectedProductIds.has(p.id));
  const selectedVisibleCount = products.filter((p) => selectedProductIds.has(p.id)).length;

  const optionsCount = useMemo(
    () => optionGroups.reduce((sum, g) => sum + g.choices.length, 0),
    [optionGroups],
  );

  // Max products in any category (for bar widths)
  const maxCatCount = useMemo(
    () => Math.max(...categories.filter((c) => c !== 'All').map((c) => categoryCounts[c] ?? 0), 1),
    [categories, categoryCounts],
  );

  // ── Product form helpers ───────────────────────────────────────────────────
  const resetForm = () => {
    const defaultCat = activeCategory === 'All' ? (categories.find((c) => c !== 'All') ?? 'Menu') : activeCategory;
    setNewProduct({ name: '', category: defaultCat, price: '', pointsReward: '', image: '', allergens: [], isActive: true });
    setNewProductImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setEditingProductId(null);
    setSelectedLibraryGroupNames([]);
    setProductExtraOptionDrafts([]);
    setExtraDraftChoiceLines([]);
    setModalImageError(null);
    setShowDeleteImageConfirm(false);
    setImageFieldBusy(false);
  };

  const startEditProduct = (product: Product) => {
    setSaveError(null); setSaveSuccess(null); setModalImageError(null);
    setShowDeleteImageConfirm(false);
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name, description: product.description ?? '', category: product.category,
      price: String(product.price), pointsReward: String(product.pointsReward ?? 0),
      image: product.image, serverImageUrl: product.serverImageUrl ?? null,
      allergens: product.allergens ?? [], isActive: product.isActive,
    });
    setNewProductImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    const { libraryNames, extraDrafts } = splitProductGroupsForEditModal(product, optionGroups);
    setSelectedLibraryGroupNames(libraryNames);
    setProductExtraOptionDrafts(extraDrafts);
    setExtraDraftChoiceLines(extraDrafts.map(() => ({ label: '', price: '' })));
    setIsAddOpen(true);
  };

  const handleAddProduct = async () => {
    setSaveError(null); setSaveSuccess(null);
    if (!newProduct.name?.trim()) { setSaveError('Συμπλήρωσε όνομα.'); return; }
    if (!newProduct.category?.trim()) { setSaveError('Επίλεξε κατηγορία.'); return; }
    const price = Number(String(newProduct.price ?? '').replace(',', '.'));
    if (Number.isNaN(price) || price <= 0) { setSaveError('Η τιμή πρέπει να είναι > 0.'); return; }
    const xp = Math.max(0, Math.trunc(Number(String(newProduct.pointsReward ?? '').replace(',', '.'))));
    if (!editingProductId && !newProductImageFile) { setSaveError('Επίλεξε αρχείο εικόνας.'); return; }

    const optionPayload = buildProductOptionGroupsForApi(
      selectedLibraryGroupNames,
      productExtraOptionDrafts,
      optionGroups,
    );

    if (editingProductId) {
      try {
        setIsSaving(true);
        await api.updateProduct(editingProductId, {
          name: newProduct.name.trim(),
          description: newProduct.description?.trim() || 'N/A',
          category: newProduct.category || 'Menu',
          price,
          xp,
          allergens: newProduct.allergens ?? [],
          optionGroups: optionPayload,
        });
        setIsAddOpen(false); resetForm(); await loadProducts();
        setSaveSuccess('Προϊόν ενημερώθηκε!');
      } catch (e: unknown) {
        const err = e as { response?: { data?: { error?: string; Error?: string; message?: string } } };
        setSaveError(err.response?.data?.error ?? err.response?.data?.Error ?? err.response?.data?.message ?? 'Αποτυχία ενημέρωσης.');
      } finally { setIsSaving(false); }
      return;
    }

    if (!user?.id) {
      setSaveError('Χρειάζεται σύνδεση merchant.');
      return;
    }

    try {
      setIsSaving(true);
      const idsBefore = new Set((await api.getProductsByMerchantId(user.id)).map((p) => p.id));
      await api.createProduct({
        name: newProduct.name.trim(),
        description: newProduct.description?.trim() || 'N/A',
        category: newProduct.category || 'Menu',
        price,
        xp: Math.max(0, xp),
        allergens: newProduct.allergens?.length ? newProduct.allergens : null,
        optionGroupsJson: optionPayload.length > 0 ? optionPayload : null,
      });
      if (newProductImageFile) {
        const after = await api.getProductsByMerchantId(user.id);
        const created = after.find((p) => !idsBefore.has(p.id));
        if (created) {
          await api.uploadProductImage(created.id, newProductImageFile);
        }
      }
      setIsAddOpen(false); resetForm(); await loadProducts();
      setSaveSuccess('Προϊόν δημιουργήθηκε!');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; Error?: string; message?: string } } };
      setSaveError(
        err.response?.data?.error ??
          err.response?.data?.Error ??
          err.response?.data?.message ??
          'Αποτυχία δημιουργίας. Έλεγξε ότι η κατηγορία είναι αποθηκευμένη.',
      );
    } finally { setIsSaving(false); }
  };

  const handleModalImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setModalImageError(null);
    if (!rawFile.type.startsWith('image/')) { setModalImageError('Επίλεξε έγκυρο αρχείο εικόνας.'); e.target.value = ''; return; }
    if (rawFile.size > MAX_PRODUCT_IMAGE_BYTES) { setModalImageError('Μέγιστο ~10MB.'); e.target.value = ''; return; }
    let file = rawFile;
    try { file = await convertAvifToWebp(rawFile); } catch (err) { setModalImageError(err instanceof Error ? err.message : 'Αποτυχία μετατροπής.'); e.target.value = ''; return; }
    if (editingProductId) {
      setImageFieldBusy(true);
      try {
        await api.uploadProductImage(editingProductId, file);
        const list = await loadProducts();
        const row = list.find((p) => p.id === editingProductId);
        if (row) setNewProduct((prev) => ({ ...prev, image: row.image, serverImageUrl: row.serverImageUrl ?? null }));
        setNewProductImageFile(null);
      } catch (err) { setModalImageError(formatImageApiError(err)); }
      finally { setImageFieldBusy(false); e.target.value = ''; }
      return;
    }
    setNewProductImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setNewProduct((prev) => ({ ...prev, image: typeof reader.result === 'string' ? reader.result : prev.image }));
    reader.readAsDataURL(file);
  };

  const handleConfirmDeleteProductImage = async () => {
    if (!editingProductId) return;
    setModalImageError(null); setImageFieldBusy(true);
    try {
      await api.deleteProductImage(editingProductId);
      const list = await loadProducts();
      const row = list.find((p) => p.id === editingProductId);
      if (row) setNewProduct((prev) => ({ ...prev, image: row.image, serverImageUrl: row.serverImageUrl ?? null }));
      setShowDeleteImageConfirm(false);
    } catch (err) { setModalImageError(formatImageApiError(err)); }
    finally { setImageFieldBusy(false); }
  };

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleProductSelection = (id: string) => setSelectedProductIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleSelectAllVisible = () => setSelectedProductIds((prev) => { const n = new Set(prev); allVisibleSelected ? products.forEach((p) => n.delete(p.id)) : products.forEach((p) => n.add(p.id)); return n; });
  const deleteProducts = (ids: string[]) => { setItems((prev) => prev.filter((p) => !ids.includes(p.id))); setSelectedProductIds((prev) => { const n = new Set(prev); ids.forEach((id) => n.delete(id)); return n; }); setOpenMenuProductId(null); };
  const deactivateProducts = (ids: string[]) => { setItems((prev) => prev.map((p) => ids.includes(p.id) ? { ...p, isActive: false } : p)); setOpenMenuProductId(null); };

  // ── Category helpers ───────────────────────────────────────────────────────
  const handleAddCategory = () => {
    const name = newCategoryName.trim();
    if (!name || name === 'All' || categories.includes(name)) return;
    setExtraCategories((prev) => [...prev, name]);
    setNewCategoryName('');
  };

  const deleteCategory = (name: string) => {
    if (name === 'All') return;
    if (items.some((p) => p.category === name)) { alert('Η κατηγορία χρησιμοποιείται από προϊόντα.'); return; }
    setExtraCategories((prev) => prev.filter((c) => c !== name));
    if (activeCategory === name) setActiveCategory('All');
  };

  const commitRenameCategory = () => {
    if (!renamingCategory || !renameDraft.trim() || renameDraft.trim() === renamingCategory) { setRenamingCategory(null); return; }
    const newName = renameDraft.trim();
    if (categories.includes(newName)) { alert('Αυτή η κατηγορία υπάρχει ήδη.'); return; }
    setExtraCategories((prev) => prev.map((c) => c === renamingCategory ? newName : c));
    setItems((prev) => prev.map((p) => p.category === renamingCategory ? { ...p, category: newName } : p));
    if (activeCategory === renamingCategory) setActiveCategory(newName);
    setRenamingCategory(null);
  };

  const handleSaveCategories = async () => {
    const toSave = categories.filter((c) => c !== 'All');
    setIsSyncingCategories(true); setCategoriesError(null);
    try { await api.upsertMerchantCategories({ categories: toSave }); }
    catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      setCategoriesError(status === 403 ? 'Δεν έχετε δικαιώματα κατηγοριών.' : 'Αποτυχία αποθήκευσης κατηγοριών.');
    } finally { setIsSyncingCategories(false); }
  };

  // ── Option group helpers ───────────────────────────────────────────────────
  const startNewGroup = () => {
    setEditingGroupId(null);
    setGroupDraft({ ...EMPTY_GROUP_DRAFT });
    setNewChoiceLabel(''); setNewChoicePrice('');
    setShowGroupEditor(true);
  };

  const startEditGroup = (group: OptionGroup) => {
    setEditingGroupId(group.id);
    setGroupDraft({
      name: group.name, type: group.type, required: group.required,
      choices: group.choices.map((c) => ({ ...c })),
      assignedProductIds: [...group.assignedProductIds],
      assignedCategories: [...group.assignedCategories],
    });
    setNewChoiceLabel(''); setNewChoicePrice('');
    setShowGroupEditor(true);
  };

  const cancelGroupEdit = () => { setShowGroupEditor(false); setGroupDraft(null); setEditingGroupId(null); };

  const addChoice = () => {
    const label = newChoiceLabel.trim();
    if (!label || !groupDraft) return;
    const price = Number(newChoicePrice.replace(',', '.'));
    const choice: OptionChoice = { id: crypto.randomUUID(), label, priceModifier: Number.isNaN(price) ? 0 : price };
    setGroupDraft((prev) => prev ? { ...prev, choices: [...prev.choices, choice] } : prev);
    setNewChoiceLabel(''); setNewChoicePrice('');
  };

  const removeChoice = (choiceId: string) => {
    setGroupDraft((prev) => prev ? { ...prev, choices: prev.choices.filter((c) => c.id !== choiceId) } : prev);
  };

  const toggleGroupProduct = (productId: string) => {
    setGroupDraft((prev) => {
      if (!prev) return prev;
      const ids = prev.assignedProductIds.includes(productId)
        ? prev.assignedProductIds.filter((x) => x !== productId)
        : [...prev.assignedProductIds, productId];
      return { ...prev, assignedProductIds: ids };
    });
  };

  const toggleGroupCategory = (cat: string) => {
    setGroupDraft((prev) => {
      if (!prev) return prev;
      const cats = prev.assignedCategories.includes(cat)
        ? prev.assignedCategories.filter((x) => x !== cat)
        : [...prev.assignedCategories, cat];
      return { ...prev, assignedCategories: cats };
    });
  };

  const saveGroup = async () => {
    if (!groupDraft || !groupDraft.name.trim()) return;
    if (groupDraft.choices.length < 1) {
      alert('Πρόσθεσε τουλάχιστον 1 επιλογή.');
      return;
    }
    const newGroup: OptionGroup = {
      id: editingGroupId ?? crypto.randomUUID(),
      name: groupDraft.name.trim(),
      type: groupDraft.type,
      required: groupDraft.required,
      choices: groupDraft.choices,
      assignedProductIds: groupDraft.assignedProductIds,
      assignedCategories: groupDraft.assignedCategories,
    };
    const updated = editingGroupId
      ? optionGroups.map((g) => (g.id === editingGroupId ? newGroup : g))
      : [newGroup, ...optionGroups];
    setOptionsTemplateError(null);
    setOptionsTemplateBusy(true);
    try {
      await api.upsertMerchantProductOptionGroups(updated.map(mapUiGroupToApiPayload));
      const fresh = await api.getMerchantProductOptionGroups();
      const merged = mergeTemplateGroupsWithPreviousAssignments(updated, fresh);
      setOptionGroups(merged);
      writeOptionGroups(merged);
      cancelGroupEdit();
    } catch (e: unknown) {
      const msg = isAxiosError(e)
        ? String(e.response?.data ?? e.message)
        : 'Αποτυχία αποθήκευσης template στον server.';
      setOptionsTemplateError(msg);
    } finally {
      setOptionsTemplateBusy(false);
    }
  };

  const deleteGroup = async (groupId: string) => {
    const updated = optionGroups.filter((g) => g.id !== groupId);
    setOptionsTemplateError(null);
    setOptionsTemplateBusy(true);
    try {
      await api.upsertMerchantProductOptionGroups(updated.map(mapUiGroupToApiPayload));
      const fresh = await api.getMerchantProductOptionGroups();
      const merged = mergeTemplateGroupsWithPreviousAssignments(updated, fresh);
      setOptionGroups(merged);
      writeOptionGroups(merged);
    } catch (e: unknown) {
      const msg = isAxiosError(e)
        ? String(e.response?.data ?? e.message)
        : 'Αποτυχία διαγραφής στον server.';
      setOptionsTemplateError(msg);
    } finally {
      setOptionsTemplateBusy(false);
    }
  };

  const toggleLibraryGroupName = (name: string) => {
    setSelectedLibraryGroupNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const addProductExtraDraft = () => {
    setProductExtraOptionDrafts((prev) => [...prev, { ...EMPTY_GROUP_DRAFT }]);
    setExtraDraftChoiceLines((prev) => [...prev, { label: '', price: '' }]);
  };

  const removeProductExtraDraft = (idx: number) => {
    setProductExtraOptionDrafts((prev) => prev.filter((_, i) => i !== idx));
    setExtraDraftChoiceLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const patchProductExtraDraft = (idx: number, patch: Partial<GroupDraft>) => {
    setProductExtraOptionDrafts((prev) => {
      const n = [...prev];
      if (!n[idx]) return prev;
      n[idx] = { ...n[idx], ...patch };
      return n;
    });
  };

  const addChoiceToProductExtraDraft = (idx: number) => {
    const line = extraDraftChoiceLines[idx] ?? { label: '', price: '' };
    const label = line.label.trim();
    if (!label) return;
    const price = Number(line.price.replace(',', '.'));
    const choice: OptionChoice = {
      id: newChoiceId(),
      label,
      priceModifier: Number.isNaN(price) ? 0 : price,
    };
    setProductExtraOptionDrafts((prev) => {
      const n = [...prev];
      if (!n[idx]) return prev;
      n[idx] = { ...n[idx], choices: [...n[idx].choices, choice] };
      return n;
    });
    setExtraDraftChoiceLines((prev) => {
      const n = [...prev];
      n[idx] = { label: '', price: '' };
      return n;
    });
  };

  const removeChoiceFromProductExtraDraft = (draftIdx: number, choiceId: string) => {
    setProductExtraOptionDrafts((prev) => {
      const n = [...prev];
      if (!n[draftIdx]) return prev;
      n[draftIdx] = {
        ...n[draftIdx],
        choices: n[draftIdx].choices.filter((c) => c.id !== choiceId),
      };
      return n;
    });
  };

  // ── Detail modal ───────────────────────────────────────────────────────────
  const openProductDetailModal = (product: Product) => {
    setDetailProductId(product.id);
    setDetailDraft({ name: product.name, description: product.description ?? '', category: product.category, price: String(product.price), pointsReward: String(product.pointsReward ?? 0), isActive: product.isActive });
  };

  const closeProductDetailModal = () => {
    setDetailProductId(null); setDetailDraft(null);
    setDetailImageError(null); setDetailImageBusy(false);
    setDetailSaveError(null); setDetailSaveBusy(false);
  };

  const saveDetailChanges = async () => {
    if (!detailProductId || !detailDraft) return;
    setDetailSaveError(null);
    const name = detailDraft.name.trim();
    if (!name) { setDetailSaveError('Συμπλήρωσε όνομα.'); return; }
    const price = Number(detailDraft.price.replace(',', '.'));
    const xp = Math.max(0, Math.trunc(Number(detailDraft.pointsReward.replace(',', '.'))));
    if (Number.isNaN(price) || price <= 0) { setDetailSaveError('Η τιμή πρέπει να είναι > 0.'); return; }
    try {
      setDetailSaveBusy(true);
      await api.updateProduct(detailProductId, {
        name,
        description: detailDraft.description.trim() || 'N/A',
        category: detailDraft.category.trim() || 'Menu',
        price,
        xp,
        allergens: [],
        optionGroups: mapProductOptionGroupsToApiPayload(detailProduct.optionGroups),
      });
      const list = await loadProducts();
      const row = list.find((p) => p.id === detailProductId);
      if (row) setDetailDraft({ name: row.name, description: row.description ?? '', category: row.category, price: String(row.price), pointsReward: String(row.pointsReward ?? 0), isActive: detailDraft.isActive });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; Error?: string; message?: string } } };
      setDetailSaveError(err.response?.data?.error ?? err.response?.data?.Error ?? err.response?.data?.message ?? 'Αποτυχία αποθήκευσης.');
    } finally { setDetailSaveBusy(false); }
  };

  const handleDetailImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile || !detailProductId) return;
    setDetailImageError(null);
    if (!rawFile.type.startsWith('image/')) { setDetailImageError('Επίλεξε έγκυρο αρχείο εικόνας.'); e.target.value = ''; return; }
    if (rawFile.size > MAX_PRODUCT_IMAGE_BYTES) { setDetailImageError('Μέγιστο ~10MB.'); e.target.value = ''; return; }
    let file = rawFile;
    try { file = await convertAvifToWebp(rawFile); } catch (err) { setDetailImageError(err instanceof Error ? err.message : 'Αποτυχία.'); e.target.value = ''; return; }
    setDetailImageBusy(true);
    try { await api.uploadProductImage(detailProductId, file); await loadProducts(); }
    catch (err) { setDetailImageError(formatImageApiError(err)); }
    finally { setDetailImageBusy(false); e.target.value = ''; }
  };

  const primaryActionLabel = activeTab === 'listing' ? 'Add Product' : activeTab === 'options' ? 'New Option Group' : 'Add Category';
  const handlePrimaryAction = () => {
    if (activeTab === 'listing') { resetForm(); setIsAddOpen(true); }
    else if (activeTab === 'options') startNewGroup();
    else setIsManageOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 bg-[#f8f9fa] text-slate-900">
      <div className="space-y-5 rounded-3xl bg-[#f8f9fa] p-0 md:p-4 lg:p-6">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-anbit-display text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Menu Management</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Διαχειρίσου προϊόντα, επιλογές και κατηγορίες</p>
          </div>
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {primaryActionLabel}
          </button>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
          <div className="inline-flex min-w-max items-center gap-1 rounded-xl bg-slate-100 p-1">
            {([
              { key: 'listing', label: `Προϊόντα (${items.length})` },
              { key: 'options', label: `Options (${optionGroups.length})` },
              { key: 'categories', label: `Κατηγορίες (${categories.length - 1})` },
            ] as const).map((tab) => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                className={cn('rounded-lg px-4 py-2 text-sm font-semibold transition-all whitespace-nowrap', activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── LISTING TAB ────────────────────────────────────────────── */}
        {activeTab === 'listing' && (
          <div className="space-y-6">
            {(isLoading || error) && (
              <div>
                {isLoading && <p className="text-sm text-slate-500">Φόρτωση...</p>}
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            )}

            {/* Search + actions */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Αναζήτηση πιάτου ή κατηγορίας..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border-0 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900/15" />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-xl gap-2 text-xs font-semibold">
                  <Filter className="h-3.5 w-3.5" /> Φίλτρα
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold" onClick={toggleSelectAllVisible}>
                  {allVisibleSelected ? 'Αποεπιλογή' : 'Bulk Edit'} ({selectedVisibleCount})
                </Button>
              </div>
            </div>

            {/* Category pills */}
            {categories.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
                    className={cn('shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
                      activeCategory === cat ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400')}>
                    {cat}
                    {cat !== 'All' && categoryCounts[cat] !== undefined && (
                      <span className={cn('ml-1.5 opacity-60')}>{categoryCounts[cat]}</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Product groups */}
            {groupedProducts.map((group) => (
              <section key={group.category} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{group.category}</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">{group.items.length}</span>
                  {group.unavailableCount > 0 && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">{group.unavailableCount} sold out</span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((product) => (
                    <article key={product.id} onClick={() => openProductDetailModal(product)}
                      className="relative flex cursor-pointer items-center gap-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-slate-200 hover:shadow-md">
                      <input type="checkbox" checked={selectedProductIds.has(product.id)}
                        onClick={(e) => e.stopPropagation()} onChange={() => toggleProductSelection(product.id)}
                        className="rounded border-slate-300 shrink-0" />
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold text-slate-900">{product.name}</h4>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <p className="anbit-tabular-nums text-sm font-bold text-slate-800">€{product.price.toFixed(2)}</p>
                          <span className="text-slate-200">·</span>
                          <p className="anbit-tabular-nums text-xs font-semibold text-amber-600">+{product.pointsReward ?? 0} XP</p>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className={cn('h-1.5 w-1.5 rounded-full', product.isActive ? 'bg-emerald-500' : 'bg-slate-300')} />
                          <span className={cn('text-[10px] font-semibold uppercase tracking-wider', product.isActive ? 'text-emerald-600' : 'text-slate-400')}>
                            {product.isActive ? 'In Stock' : 'Sold Out'}
                          </span>
                        </div>
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setOpenMenuProductId((prev) => prev === product.id ? null : product.id); }}
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {openMenuProductId === product.id && (
                        <div className="absolute right-4 top-14 z-20 min-w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                          <button type="button" className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            onClick={() => { setDetailProductId(null); startEditProduct(product); setOpenMenuProductId(null); }}>
                            <Pencil className="h-4 w-4" /> Edit
                          </button>
                          <button type="button" className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-amber-700 hover:bg-amber-50"
                            onClick={() => deactivateProducts([product.id])}>
                            <Power className="h-4 w-4" /> Deactivate
                          </button>
                          <button type="button" className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-red-600 hover:bg-red-50"
                            onClick={() => deleteProducts([product.id])}>
                            <Trash2 className="h-4 w-4" /> Delete
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

        {/* ── OPTIONS TAB ────────────────────────────────────────────── */}
        {activeTab === 'options' && (
          <div className="space-y-6">
            {optionsTemplateBusy && !showGroupEditor && (
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Συγχρονισμός με τον server…
              </p>
            )}
            {optionsTemplateError && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
                {optionsTemplateError}
              </p>
            )}
            <p className="text-xs text-slate-500 max-w-2xl">
              Οι ομάδες αποθηκεύονται στο backend ως <strong>template</strong> (GET/PUT{' '}
              <code className="rounded bg-slate-100 px-1">/merchants/product-option-groups</code>). Για να τις
              εφαρμόσεις σε συγκεκριμένο προϊόν, χρησιμοποίησε το παράθυρο Νέο / Επεξεργασία προϊόντος.
            </p>

            {/* Group editor panel */}
            {showGroupEditor && groupDraft && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h2 className="font-semibold text-slate-900">{editingGroupId ? 'Επεξεργασία Ομάδας' : 'Νέα Ομάδα Επιλογών'}</h2>
                  <button type="button" onClick={cancelGroupEdit} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
                </div>
                <div className="p-6 space-y-5">
                  {/* Name + type */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">Όνομα Ομάδας *</label>
                      <input type="text" value={groupDraft.name} onChange={(e) => setGroupDraft((p) => p ? { ...p, name: e.target.value } : p)}
                        placeholder="π.χ. Ζάχαρη, Αφαίρεση υλικών, Extras"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                    </div>

                    {/* Type selector */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">Τύπος Επιλογής</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setGroupDraft((p) => p ? { ...p, type: 'radio', required: true } : p)}
                          className={cn('flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all',
                            groupDraft.type === 'radio' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300')}>
                          <div className="flex items-center gap-2">
                            <Circle className={cn('h-4 w-4', groupDraft.type === 'radio' ? 'text-slate-900' : 'text-slate-300')} />
                            <span className="text-xs font-bold text-slate-800">Radio</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">Μια επιλογή μόνο<br />(π.χ. Ζάχαρη: σκέτος / γλυκός)</p>
                        </button>
                        <button type="button" onClick={() => setGroupDraft((p) => p ? { ...p, type: 'checkbox', required: false } : p)}
                          className={cn('flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all',
                            groupDraft.type === 'checkbox' ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300')}>
                          <div className="flex items-center gap-2">
                            <CheckSquare className={cn('h-4 w-4', groupDraft.type === 'checkbox' ? 'text-slate-900' : 'text-slate-300')} />
                            <span className="text-xs font-bold text-slate-800">Extras / Αφαίρεση</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">Πολλαπλές επιλογές<br />(π.χ. Χωρίς ντομάτα)</p>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Required toggle (radio only) */}
                  {groupDraft.type === 'radio' && (
                    <label className="flex cursor-pointer items-center gap-3">
                      <div className={cn('relative h-5 w-9 rounded-full transition-colors', groupDraft.required ? 'bg-slate-900' : 'bg-slate-300')}
                        onClick={() => setGroupDraft((p) => p ? { ...p, required: !p.required } : p)}>
                        <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', groupDraft.required ? 'translate-x-4' : 'translate-x-0.5')} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-800">Υποχρεωτική επιλογή</span>
                        <p className="text-xs text-slate-400">Ο πελάτης πρέπει να επιλέξει μία</p>
                      </div>
                    </label>
                  )}

                  {/* Choices */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Επιλογές ({groupDraft.choices.length})
                    </label>

                    {/* Existing choices */}
                    {groupDraft.choices.length > 0 && (
                      <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                        {groupDraft.choices.map((choice, idx) => (
                          <div key={choice.id} className="flex items-center gap-3 px-4 py-2.5 bg-white">
                            <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                            <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold',
                              groupDraft.type === 'radio' ? 'rounded-full border-slate-300' : 'rounded border-slate-300')}>
                              {groupDraft.type === 'radio' ? '' : ''}
                            </span>
                            <span className="flex-1 text-sm font-medium text-slate-800">{choice.label}</span>
                            {choice.priceModifier > 0 && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">+€{choice.priceModifier.toFixed(2)}</span>
                            )}
                            {choice.priceModifier === 0 && (
                              <span className="text-xs text-slate-300">δωρεάν</span>
                            )}
                            <button type="button" onClick={() => removeChoice(choice.id)}
                              className="shrink-0 rounded-lg p-1 text-slate-300 hover:bg-red-50 hover:text-red-500">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add choice */}
                    <div className="flex gap-2">
                      <input type="text" value={newChoiceLabel} onChange={(e) => setNewChoiceLabel(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addChoice()}
                        placeholder={groupDraft.type === 'radio' ? 'π.χ. Σκέτος, Ελαφρύς, Γλυκός' : 'π.χ. Χωρίς κρεμμύδι'}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                      <div className="relative w-28">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-300">+€</span>
                        <input type="number" step="0.10" min="0" value={newChoicePrice} onChange={(e) => setNewChoicePrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full rounded-xl border border-slate-200 bg-white pl-7 pr-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                      </div>
                      <button type="button" onClick={addChoice}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
                        <Plus className="h-3.5 w-3.5" /> Προσθήκη
                      </button>
                    </div>
                    {groupDraft.choices.length < 1 && (
                      <p className="text-xs text-slate-400">Χρειάζεται τουλάχιστον 1 επιλογή.</p>
                    )}
                  </div>

                  {/* Assign to products */}
                  {items.length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Εφαρμογή σε Προϊόντα ({groupDraft.assignedProductIds.length} επιλεγμένα)
                      </label>
                      <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                        {items.map((p) => {
                          const checked = groupDraft.assignedProductIds.includes(p.id);
                          return (
                            <label key={p.id} className={cn('flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-slate-50', checked && 'bg-slate-50')}>
                              <input type="checkbox" checked={checked} onChange={() => toggleGroupProduct(p.id)}
                                className="h-4 w-4 rounded border-slate-300 text-slate-900" />
                              <img src={p.image} alt="" className="h-8 w-8 rounded-lg object-cover" />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-800">{p.name}</p>
                                <p className="text-xs text-slate-400">{p.category}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Assign to categories */}
                  {categories.filter((c) => c !== 'All').length > 0 && (
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Ή εφαρμογή σε Κατηγορία ({groupDraft.assignedCategories.length} επιλεγμένες)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {categories.filter((c) => c !== 'All').map((cat) => {
                          const checked = groupDraft.assignedCategories.includes(cat);
                          return (
                            <button key={cat} type="button" onClick={() => toggleGroupCategory(cat)}
                              className={cn('rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all',
                                checked ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400')}>
                              {cat} <span className="opacity-60">{categoryCounts[cat] ?? 0}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Save / Cancel */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button type="button" onClick={cancelGroupEdit}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                      Ακύρωση
                    </button>
                    <button type="button" onClick={() => void saveGroup()} disabled={optionsTemplateBusy}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                      {optionsTemplateBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {editingGroupId ? 'Αποθήκευση αλλαγών' : 'Δημιουργία ομάδας'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Groups grid */}
            {optionGroups.length === 0 && !showGroupEditor ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Tag className="h-5 w-5 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-400">Δεν υπάρχουν ομάδες επιλογών</p>
                <p className="mt-1 text-xs text-slate-300">Πάτα "New Option Group" για να δημιουργήσεις</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {optionGroups.map((group) => (
                  <article key={group.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn('inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                            group.type === 'radio' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700')}>
                            {group.type === 'radio' ? <><Circle className="h-2.5 w-2.5" /> Radio</> : <><CheckSquare className="h-2.5 w-2.5" /> Extras</>}
                          </span>
                          {group.type === 'radio' && group.required && (
                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">Required</span>
                          )}
                        </div>
                        <h3 className="mt-1.5 text-sm font-bold text-slate-900">{group.name}</h3>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button type="button" onClick={() => startEditGroup(group)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" onClick={() => void deleteGroup(group.id)} disabled={optionsTemplateBusy}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-40">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Choices */}
                    <div className="border-t border-slate-100 px-4 py-3 space-y-1.5">
                      {group.choices.map((choice) => (
                        <div key={choice.id} className="flex items-center gap-2">
                          <span className={cn('flex h-3.5 w-3.5 shrink-0 items-center justify-center border',
                            group.type === 'radio' ? 'rounded-full border-slate-300' : 'rounded border-slate-300')} />
                          <span className="flex-1 truncate text-xs text-slate-700">{choice.label}</span>
                          {choice.priceModifier > 0 && (
                            <span className="shrink-0 text-[10px] font-semibold text-emerald-600">+€{choice.priceModifier.toFixed(2)}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Assignment */}
                    <div className="border-t border-slate-100 px-4 py-2.5">
                      {group.assignedProductIds.length > 0 && (
                        <p className="text-[10px] text-slate-400">{group.assignedProductIds.length} προϊόντα</p>
                      )}
                      {group.assignedCategories.length > 0 && (
                        <p className="text-[10px] text-slate-400">{group.assignedCategories.join(', ')}</p>
                      )}
                      {group.assignedProductIds.length === 0 && group.assignedCategories.length === 0 && (
                        <p className="text-[10px] text-slate-300">Χωρίς εφαρμογή</p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CATEGORIES TAB ─────────────────────────────────────────── */}
        {activeTab === 'categories' && (
          <div className="space-y-5">
            {isLoadingCategories && <p className="text-sm text-slate-500">Φόρτωση κατηγοριών...</p>}
            {categoriesError && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{categoriesError}</p>}

            {/* Add + Save row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  placeholder="Νέα κατηγορία..."
                  className="w-56 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                <button type="button" onClick={handleAddCategory}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800">
                  <Plus className="h-3.5 w-3.5" /> Προσθήκη
                </button>
              </div>
              <button type="button" onClick={() => void handleSaveCategories()} disabled={isSyncingCategories}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
                {isSyncingCategories ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Αποθήκευση στον server
              </button>
            </div>

            {/* Categories list */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {categories.filter((c) => c !== 'All').length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm font-semibold text-slate-400">Δεν υπάρχουν κατηγορίες</p>
                  <p className="mt-1 text-xs text-slate-300">Πρόσθεσε κατηγορίες παραπάνω</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {categories.filter((c) => c !== 'All').map((cat, idx) => {
                    const count = categoryCounts[cat] ?? 0;
                    const pct = Math.round((count / maxCatCount) * 100);
                    const isRenaming = renamingCategory === cat;
                    return (
                      <div key={cat} className={cn('flex items-center gap-4 px-5 py-4 transition-colors', idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50')}>
                        {/* Drag handle */}
                        <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />

                        {/* Name / rename input */}
                        <div className="min-w-0 flex-1">
                          {isRenaming ? (
                            <div className="flex items-center gap-2">
                              <input type="text" value={renameDraft} onChange={(e) => setRenameDraft(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') commitRenameCategory(); if (e.key === 'Escape') setRenamingCategory(null); }}
                                autoFocus
                                className="w-full max-w-xs rounded-lg border border-slate-900 px-3 py-1.5 text-sm font-semibold outline-none ring-2 ring-slate-900/10" />
                              <button type="button" onClick={commitRenameCategory}
                                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800">OK</button>
                              <button type="button" onClick={() => setRenamingCategory(null)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-3">
                                <span className="font-semibold text-slate-900">{cat}</span>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">{count} προϊόντα</span>
                              </div>
                              {/* Progress bar */}
                              <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                                <div className="h-full rounded-full bg-slate-400 transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {!isRenaming && (
                          <div className="flex shrink-0 items-center gap-1">
                            <button type="button" onClick={() => { setRenamingCategory(cat); setRenameDraft(cat); }}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">
                              <Pencil className="h-3 w-3" /> Μετονομασία
                            </button>
                            <button type="button" onClick={() => deleteCategory(cat)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50">
                              <Trash2 className="h-3 w-3" /> Διαγραφή
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── PRODUCT DETAIL MODAL ───────────────────────────────────── */}
      {detailProduct && detailDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Product details</h2>
              <button type="button" onClick={closeProductDetailModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Image + fields */}
              <div className="grid gap-5 md:grid-cols-[200px_1fr]">
                <div className="space-y-2">
                  <div className="overflow-hidden rounded-xl border border-slate-200 aspect-square">
                    <img src={detailProduct.image} alt={detailProduct.name} className="h-full w-full object-cover" />
                  </div>
                  <button type="button" onClick={() => detailFileInputRef.current?.click()} disabled={detailImageBusy}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                    {detailImageBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageIcon className="h-3.5 w-3.5" />}
                    {detailImageBusy ? 'Uploading...' : 'Αλλαγή εικόνας'}
                  </button>
                  <input ref={detailFileInputRef} type="file" accept="image/*,.avif,image/avif" className="hidden"
                    onChange={(e) => void handleDetailImageSelected(e)} />
                  {detailImageError && <p className="text-xs text-red-600">{detailImageError}</p>}
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Όνομα', key: 'name' as const, type: 'text' },
                  ].map(({ label, key }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">{label}</label>
                      <input type="text" value={detailDraft[key] as string}
                        onChange={(e) => setDetailDraft({ ...detailDraft, [key]: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Περιγραφή</label>
                    <textarea value={detailDraft.description}
                      onChange={(e) => setDetailDraft({ ...detailDraft, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 min-h-[80px] resize-none" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Κατηγορία</label>
                      <select value={detailDraft.category}
                        onChange={(e) => setDetailDraft({ ...detailDraft, category: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900">
                        {categories.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Τιμή (€)</label>
                      <input type="number" step="0.01" min="0" value={detailDraft.price}
                        onChange={(e) => setDetailDraft({ ...detailDraft, price: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">Points</label>
                      <input type="number" step="1" min="0" value={detailDraft.pointsReward}
                        onChange={(e) => setDetailDraft({ ...detailDraft, pointsReward: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm font-medium">
                    <input type="checkbox" checked={detailDraft.isActive}
                      onChange={(e) => setDetailDraft({ ...detailDraft, isActive: e.target.checked })}
                      className="rounded border-slate-300" />
                    Active / In Stock
                  </label>
                </div>
              </div>

              {/* Applied option groups */}
              {(() => {
                const assigned = optionGroups.filter(
                  (g) => g.assignedProductIds.includes(detailProduct.id) || g.assignedCategories.includes(detailProduct.category),
                );
                if (assigned.length === 0) return null;
                return (
                  <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900">Option Groups εφαρμοσμένες σε αυτό το προϊόν</h3>
                    <div className="flex flex-wrap gap-2">
                      {assigned.map((g) => (
                        <div key={g.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn('rounded text-[10px] font-bold px-1.5 py-0.5', g.type === 'radio' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700')}>
                              {g.type === 'radio' ? 'RADIO' : 'EXTRAS'}
                            </span>
                            <span className="text-xs font-semibold text-slate-800">{g.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{g.choices.map((c) => c.label).join(' · ')}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">Για να αλλάξεις, πήγαινε στο tab Options.</p>
                  </div>
                );
              })()}

              {detailSaveError && <p className="text-sm text-red-600" role="alert">{detailSaveError}</p>}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={closeProductDetailModal} disabled={detailSaveBusy}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Κλείσιμο
                </button>
                <button type="button" onClick={() => void saveDetailChanges()} disabled={detailSaveBusy}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                  {detailSaveBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {detailSaveBusy ? 'Αποθήκευση...' : 'Αποθήκευση'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT PRODUCT MODAL ───────────────────────────────── */}
      {isAddOpen && (
        <>
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:px-4 sm:py-8">
            <div className="w-full h-[92vh] sm:h-auto sm:max-h-[90vh] sm:max-w-2xl rounded-t-2xl sm:rounded-2xl bg-white shadow-xl overflow-y-auto">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">{editingProductId ? 'Επεξεργασία προϊόντος' : 'Νέο προϊόν'}</h2>
                <button type="button" onClick={() => { setIsAddOpen(false); resetForm(); }}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-4 p-5 pb-8">
                {saveError && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-xs text-red-600">{saveError}</p>}
                {saveSuccess && <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-xs text-emerald-700">{saveSuccess}</p>}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Όνομα *</label>
                  <input type="text" value={newProduct.name || ''} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Περιγραφή</label>
                  <textarea value={newProduct.description || ''} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 min-h-[80px] resize-y"
                    placeholder="Περιγραφή πιάτου, υλικά..." />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Κατηγορία *</label>
                  <select value={newProduct.category || ''} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900">
                    <option value="">Επίλεξε κατηγορία</option>
                    {categories.filter((c) => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Image upload */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Εικόνα {!editingProductId && '*'}</label>
                  <div className={cn('relative flex gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 cursor-pointer hover:border-slate-400 transition-colors', imageFieldBusy && 'pointer-events-none opacity-70')}
                    onClick={() => !imageFieldBusy && fileInputRef.current?.click()}>
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
                      {newProduct.image ? (
                        <img src={newProduct.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                      {imageFieldBusy ? (
                        <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-slate-700">{editingProductId ? 'Αλλαγή εικόνας' : 'Επίλεξε εικόνα'}</p>
                          <p className="text-xs text-slate-400">PNG / JPG / WEBP / AVIF · max 10MB</p>
                          {newProductImageFile && <p className="text-xs text-emerald-600">{newProductImageFile.name}</p>}
                        </>
                      )}
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*,.avif,image/avif" className="hidden" disabled={imageFieldBusy}
                    onChange={(e) => void handleModalImageSelected(e)} />
                  {editingProductId && newProduct.serverImageUrl && (
                    <button type="button" disabled={imageFieldBusy} onClick={() => setShowDeleteImageConfirm(true)}
                      className="text-xs font-semibold text-red-500 hover:underline">Αφαίρεση εικόνας</button>
                  )}
                  {modalImageError && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{modalImageError}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Τιμή (€) *</label>
                    <input type="number" step="0.01" min="0" placeholder="0.00" value={newProduct.price ?? ''}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">Points (XP)</label>
                    <input type="number" step="1" min="0" placeholder="0" value={newProduct.pointsReward ?? ''}
                      onChange={(e) => setNewProduct({ ...newProduct, pointsReward: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Αλλεργιογόνα (comma separated)</label>
                  <input type="text" value={(newProduct.allergens || []).join(', ')}
                    onChange={(e) => setNewProduct({ ...newProduct, allergens: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900"
                    placeholder="Γάλα, Γλουτένη" />
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">Επιλογές προϊόντος (options)</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Επίλεξε ομάδες από το tab <strong>Options</strong> (βιβλιοθήκη) και/ή πρόσθεσε ομάδες μόνο για αυτό το προϊόν.
                    </p>
                  </div>
                  {optionGroups.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Από βιβλιοθήκη</p>
                      <div className="flex flex-col gap-2">
                        {optionGroups.map((g) => (
                          <label
                            key={g.id}
                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLibraryGroupNames.includes(g.name)}
                              onChange={() => toggleLibraryGroupName(g.name)}
                              className="h-4 w-4 rounded border-slate-300"
                            />
                            <span className="font-medium text-slate-800">{g.name}</span>
                            <span className="text-xs text-slate-400">
                              {g.type === 'radio' ? 'Single' : 'Multiple'} · {g.choices.length} επιλογές
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Μόνο για αυτό το προϊόν
                      </p>
                      <button
                        type="button"
                        onClick={addProductExtraDraft}
                        className="text-xs font-semibold text-slate-700 underline decoration-slate-300 hover:decoration-slate-600"
                      >
                        + Ομάδα
                      </button>
                    </div>
                    {productExtraOptionDrafts.length === 0 ? (
                      <p className="text-[11px] text-slate-400">Καμία επιπλέον ομάδα. Πάτα «+ Ομάδα» για δική σου ομάδα μόνο σε αυτό το προϊόν.</p>
                    ) : (
                      <div className="space-y-3">
                        {productExtraOptionDrafts.map((draft, idx) => (
                          <div key={`extra-${idx}`} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <input
                                type="text"
                                value={draft.name}
                                onChange={(e) => patchProductExtraDraft(idx, { name: e.target.value })}
                                placeholder="Όνομα ομάδας"
                                className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => removeProductExtraDraft(idx)}
                                className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => patchProductExtraDraft(idx, { type: 'radio', required: true })}
                                className={cn(
                                  'flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold',
                                  draft.type === 'radio' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200',
                                )}
                              >
                                Single
                              </button>
                              <button
                                type="button"
                                onClick={() => patchProductExtraDraft(idx, { type: 'checkbox', required: false })}
                                className={cn(
                                  'flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold',
                                  draft.type === 'checkbox' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200',
                                )}
                              >
                                Multiple
                              </button>
                            </div>
                            {draft.choices.length > 0 && (
                              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 text-xs">
                                {draft.choices.map((c) => (
                                  <li key={c.id} className="flex items-center justify-between gap-2 px-2 py-1.5">
                                    <span>{c.label}</span>
                                    <span className="text-slate-400">+€{c.priceModifier.toFixed(2)}</span>
                                    <button
                                      type="button"
                                      onClick={() => removeChoiceFromProductExtraDraft(idx, c.id)}
                                      className="text-slate-300 hover:text-red-500"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={extraDraftChoiceLines[idx]?.label ?? ''}
                                onChange={(e) =>
                                  setExtraDraftChoiceLines((prev) => {
                                    const n = [...prev];
                                    while (n.length <= idx) n.push({ label: '', price: '' });
                                    n[idx] = { ...n[idx], label: e.target.value };
                                    return n;
                                  })
                                }
                                placeholder="Όνομα επιλογής"
                                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                              />
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={extraDraftChoiceLines[idx]?.price ?? ''}
                                onChange={(e) =>
                                  setExtraDraftChoiceLines((prev) => {
                                    const n = [...prev];
                                    while (n.length <= idx) n.push({ label: '', price: '' });
                                    n[idx] = { ...n[idx], price: e.target.value };
                                    return n;
                                  })
                                }
                                placeholder="€"
                                className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => addChoiceToProductExtraDraft(idx)}
                                className="shrink-0 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-700"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button type="button" onClick={() => { setIsAddOpen(false); resetForm(); }}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                    Ακύρωση
                  </button>
                  <button type="button" onClick={() => void handleAddProduct()} disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {isSaving ? 'Αποθήκευση...' : editingProductId ? 'Αποθήκευση αλλαγών' : 'Δημιουργία προϊόντος'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Delete image confirm */}
          {showDeleteImageConfirm && editingProductId && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4">
              <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                <p className="text-sm font-bold text-slate-900">Αφαίρεση εικόνας;</p>
                <p className="mt-2 text-xs text-slate-500">Η εικόνα θα αφαιρεθεί από τον server.</p>
                <div className="mt-5 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={imageFieldBusy} onClick={() => setShowDeleteImageConfirm(false)}>Ακύρωση</Button>
                  <Button type="button" variant="destructive" size="sm" disabled={imageFieldBusy} onClick={() => void handleConfirmDeleteProductImage()} className="gap-2">
                    {imageFieldBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Αφαίρεση
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Manage categories modal (kept for quick-add from primary action) */}
      {isManageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">Νέα Κατηγορία</h2>
              <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={() => setIsManageOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="flex gap-2">
              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { handleAddCategory(); setIsManageOpen(false); } }}
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-slate-900" placeholder="Όνομα κατηγορίας" />
              <button type="button" onClick={() => { handleAddCategory(); setIsManageOpen(false); }}
                className="rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800">
                Προσθήκη
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
