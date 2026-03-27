import React, { useEffect, useMemo, useState } from 'react';
import { api, type ApiMerchantUser } from '@/services/api';
import { mergeMerchantsWithLocalRegistry } from '@/utils/merchantRegistry';
import { Button } from '@/components/ui/button';

type OfferType = 'percent' | 'fixed' | 'xp';

interface PlatformOffer {
  id: string;
  title: string;
  description: string;
  type: OfferType;
  value: number;
  active: boolean;
}

interface PointsSettings {
  basePointsPerEuro: number;
  signupBonus: number;
  referralBonus: number;
  firstOrderBonus: number;
}

interface MerchantCategoryAssignment {
  merchantId: string;
  category: string;
}

interface AnbitManagementState {
  categories: string[];
  points: PointsSettings;
  offers: PlatformOffer[];
  assignments: MerchantCategoryAssignment[];
  updatedAt: string;
}

const STORAGE_KEY = 'anbit_admin_management_v1';

const DEFAULT_STATE: AnbitManagementState = {
  categories: ['Coffee', 'Burger', 'Pizza'],
  points: {
    basePointsPerEuro: 10,
    signupBonus: 200,
    referralBonus: 100,
    firstOrderBonus: 80,
  },
  offers: [],
  assignments: [],
  updatedAt: new Date(0).toISOString(),
};

function readState(): AnbitManagementState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<AnbitManagementState>;
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_STATE.categories,
      points: {
        ...DEFAULT_STATE.points,
        ...(parsed.points ?? {}),
      },
      offers: Array.isArray(parsed.offers) ? parsed.offers : [],
      assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
      updatedAt:
        typeof parsed.updatedAt === 'string' ? parsed.updatedAt : DEFAULT_STATE.updatedAt,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

const AnbitManagement: React.FC = () => {
  const [state, setState] = useState<AnbitManagementState>(() => readState());
  const [merchants, setMerchants] = useState<ApiMerchantUser[]>([]);
  const [isLoadingMerchants, setIsLoadingMerchants] = useState(false);
  const [merchantError, setMerchantError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState('');
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [offerTitle, setOfferTitle] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerType, setOfferType] = useState<OfferType>('percent');
  const [offerValue, setOfferValue] = useState('');

  useEffect(() => {
    const loadMerchants = async () => {
      setIsLoadingMerchants(true);
      setMerchantError(null);
      try {
        const { merchants: fromApi } = await api.getMerchantsDirectory();
        const merged = mergeMerchantsWithLocalRegistry(fromApi);
        setMerchants(merged);
        if (merged.length > 0) {
          setSelectedMerchantId((prev) => prev || merged[0].id);
        }
      } catch {
        setMerchantError('Αποτυχία φόρτωσης merchants.');
      } finally {
        setIsLoadingMerchants(false);
      }
    };
    void loadMerchants();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, updatedAt: new Date().toISOString() }),
    );
  }, [state]);

  const merchantById = useMemo(
    () => new Map(merchants.map((m) => [m.id, m] as const)),
    [merchants],
  );

  const assignedCategoryByMerchant = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of state.assignments) map.set(a.merchantId, a.category);
    return map;
  }, [state.assignments]);

  const saveNotice = (msg: string) => {
    setSavedMessage(msg);
    window.setTimeout(() => setSavedMessage(null), 2000);
  };

  const addCategory = () => {
    const value = newCategory.trim();
    if (!value) return;
    if (state.categories.some((c) => c.toLowerCase() === value.toLowerCase())) return;
    setState((prev) => ({ ...prev, categories: [...prev.categories, value].sort() }));
    setNewCategory('');
    saveNotice('Η κατηγορία προστέθηκε.');
  };

  const deleteCategory = (category: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
      assignments: prev.assignments.filter((a) => a.category !== category),
    }));
    saveNotice('Η κατηγορία διαγράφηκε.');
  };

  const assignMerchantToCategory = () => {
    if (!selectedMerchantId || !selectedCategory) return;
    setState((prev) => {
      const others = prev.assignments.filter((a) => a.merchantId !== selectedMerchantId);
      return {
        ...prev,
        assignments: [...others, { merchantId: selectedMerchantId, category: selectedCategory }],
      };
    });
    saveNotice('Η αντιστοίχιση αποθηκεύτηκε.');
  };

  const removeAssignment = (merchantId: string) => {
    setState((prev) => ({
      ...prev,
      assignments: prev.assignments.filter((a) => a.merchantId !== merchantId),
    }));
    saveNotice('Η αντιστοίχιση αφαιρέθηκε.');
  };

  const addOffer = () => {
    const title = offerTitle.trim();
    const description = offerDescription.trim();
    const value = Number(String(offerValue).replace(',', '.'));
    if (!title || !Number.isFinite(value) || value <= 0) return;
    const offer: PlatformOffer = {
      id: crypto.randomUUID(),
      title,
      description,
      type: offerType,
      value,
      active: true,
    };
    setState((prev) => ({ ...prev, offers: [offer, ...prev.offers] }));
    setOfferTitle('');
    setOfferDescription('');
    setOfferValue('');
    setOfferType('percent');
    saveNotice('Η global προσφορά προστέθηκε.');
  };

  const toggleOffer = (offerId: string) => {
    setState((prev) => ({
      ...prev,
      offers: prev.offers.map((o) => (o.id === offerId ? { ...o, active: !o.active } : o)),
    }));
  };

  const deleteOffer = (offerId: string) => {
    setState((prev) => ({ ...prev, offers: prev.offers.filter((o) => o.id !== offerId) }));
  };

  return (
    <div className="flex flex-col gap-6 text-slate-900">
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-6 md:px-8 md:py-8"
        style={{
          background:
            'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-red-700">
              Platform Administrator
            </p>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Anbit Management</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-700 md:text-base">
              Κεντρική διαχείριση για wallet categories, global points και προσφορές Anbit.
            </p>
          </div>
          {savedMessage && (
            <p className="mt-3 rounded-md bg-white/80 px-3 py-2 text-xs font-medium text-emerald-700 md:mt-0">
              {savedMessage}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Anbit Categories</h2>
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Νέα κατηγορία (π.χ. Brunch)"
            />
            <Button type="button" size="sm" onClick={addCategory}>
              Προσθήκη
            </Button>
          </div>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {state.categories.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <span>{category}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs"
                  onClick={() => deleteCategory(category)}
                >
                  Διαγραφή
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Global Points Rules</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-slate-600">
              Base points / 1€
              <input
                type="number"
                min={0}
                value={state.points.basePointsPerEuro}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    points: { ...prev.points, basePointsPerEuro: Number(e.target.value) || 0 },
                  }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-600">
              Signup bonus
              <input
                type="number"
                min={0}
                value={state.points.signupBonus}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    points: { ...prev.points, signupBonus: Number(e.target.value) || 0 },
                  }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-600">
              Referral bonus
              <input
                type="number"
                min={0}
                value={state.points.referralBonus}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    points: { ...prev.points, referralBonus: Number(e.target.value) || 0 },
                  }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-slate-600">
              First order bonus
              <input
                type="number"
                min={0}
                value={state.points.firstOrderBonus}
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    points: { ...prev.points, firstOrderBonus: Number(e.target.value) || 0 },
                  }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Οι κανόνες αποθηκεύονται τοπικά στο browser μέχρι να συνδεθούν με backend endpoint.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            Merchant → Category Assignment
          </h2>
          {merchantError && <p className="mb-2 text-xs text-red-600">{merchantError}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <select
              value={selectedMerchantId}
              onChange={(e) => setSelectedMerchantId(e.target.value)}
              disabled={isLoadingMerchants || merchants.length === 0}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.username}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Επίλεξε category</option>
              {state.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={assignMerchantToCategory}
            disabled={!selectedMerchantId || !selectedCategory}
          >
            Αποθήκευση αντιστοίχισης
          </Button>

          <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
            {merchants.map((m) => {
              const assigned = assignedCategoryByMerchant.get(m.id);
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{m.username}</p>
                    <p className="text-[11px] text-slate-500">{assigned || 'Χωρίς category'}</p>
                  </div>
                  {assigned ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => removeAssignment(m.id)}
                    >
                      Αφαίρεση
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-slate-900">Global Anbit Offers</h2>
          <div className="space-y-2">
            <input
              type="text"
              value={offerTitle}
              onChange={(e) => setOfferTitle(e.target.value)}
              placeholder="Τίτλος προσφοράς"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={offerDescription}
              onChange={(e) => setOfferDescription(e.target.value)}
              placeholder="Περιγραφή"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                value={offerType}
                onChange={(e) => setOfferType(e.target.value as OfferType)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed (€)</option>
                <option value="xp">Bonus XP</option>
              </select>
              <input
                type="number"
                min={0}
                value={offerValue}
                onChange={(e) => setOfferValue(e.target.value)}
                placeholder="Τιμή"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <Button type="button" size="sm" onClick={addOffer}>
              Προσθήκη προσφοράς
            </Button>
          </div>

          <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
            {state.offers.length === 0 ? (
              <p className="text-xs text-slate-500">Δεν υπάρχουν global προσφορές.</p>
            ) : (
              state.offers.map((offer) => (
                <div
                  key={offer.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{offer.title}</p>
                      <p className="text-[11px] text-slate-500">{offer.description || '—'}</p>
                      <p className="mt-1 text-[11px] text-slate-600">
                        {offer.type} • {offer.value}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => toggleOffer(offer.id)}
                      >
                        {offer.active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => deleteOffer(offer.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        Last updated: {state.updatedAt === DEFAULT_STATE.updatedAt ? '—' : new Date(state.updatedAt).toLocaleString('el-GR')}
      </p>
    </div>
  );
};

export default AnbitManagement;
