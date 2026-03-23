import React, { useEffect, useState } from 'react';
import { api, type ApiMerchantUser, type MerchantTableQr } from '@/services/api';
import {
  appendRegisteredMerchant,
  isLocalRegistryMerchantId,
  mergeMerchantsWithLocalRegistry,
} from '@/utils/merchantRegistry';

const MerchantUsers: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<ApiMerchantUser[]>([]);
  const [merchantsSource, setMerchantsSource] = useState<
    'auth' | 'derived' | 'mixed' | null
  >(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<ApiMerchantUser | null>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [qrSuccess, setQrSuccess] = useState<string | null>(null);
  const [merchantTables, setMerchantTables] = useState<Record<string, MerchantTableQr[]>>({});
  const [isLoadingTablesFor, setIsLoadingTablesFor] = useState<string | null>(null);

  const loadMerchants = async () => {
    setIsLoadingUsers(true);
    try {
      const { merchants, source } = await api.getMerchantsDirectory();
      setUsers(mergeMerchantsWithLocalRegistry(merchants));
      setMerchantsSource(source);
    } catch {
      setUsers(mergeMerchantsWithLocalRegistry([]));
      setMerchantsSource(null);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadTablesForMerchant = async (merchantId: string) => {
    setIsLoadingTablesFor(merchantId);
    try {
      const tables = await api.getMerchantTables(merchantId);
      setMerchantTables((prev) => ({ ...prev, [merchantId]: tables }));
    } catch {
      // σιωπηλό error, η UI απλά δεν θα δείξει tables
    } finally {
      setIsLoadingTablesFor(null);
    }
  };

  useEffect(() => {
    void loadMerchants();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    setIsSubmitting(true);
    try {
      const adminSecret = import.meta.env.VITE_ADMIN_SECRET;
      if (!adminSecret) {
        setErrorMessage('Λείπει η μεταβλητή περιβάλλοντος VITE_ADMIN_SECRET.');
        setIsSubmitting(false);
        return;
      }

      await api.registerMerchant({
        username,
        email,
        password,
        secret: adminSecret,
      });
      appendRegisteredMerchant(username, email);
      await loadMerchants();

      setSuccessMessage('Ο χρήστης merchant δημιουργήθηκε με επιτυχία!');
      setUsername('');
      setEmail('');
      setPassword('');
    } catch {
      setErrorMessage('Κάτι πήγε στραβά κατά την προσθήκη του χρήστη.');
    } finally {
      setIsSubmitting(false);
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
              Merchant Users
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
              Δημιουργία νέων merchant χρηστών και προβολή όσων έχουν προστεθεί.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Φόρμα προσθήκης νέου merchant */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Προσθήκη νέου Merchant
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="merchantUsername"
                className="block text-xs font-medium text-slate-700"
              >
                Username
              </label>
              <input
                id="merchantUsername"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-[#0C0C0C] focus:ring-2 focus:ring-[#0C0C0C]/10"
              />
            </div>

            <div>
              <label
                htmlFor="merchantEmail"
                className="block text-xs font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="merchantEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-[#0C0C0C] focus:ring-2 focus:ring-[#0C0C0C]/10"
              />
            </div>

            <div>
              <label
                htmlFor="merchantPassword"
                className="block text-xs font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="merchantPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-[#0C0C0C] focus:ring-2 focus:ring-[#0C0C0C]/10"
              />
            </div>

            {successMessage && (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {successMessage}
              </p>
            )}

            {errorMessage && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#0C0C0C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#0C0C0C]/30 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Προσθήκη...' : 'Προσθήκη Merchant'}
            </button>
          </form>
        </div>

        {/* Λίστα με merchants που έχουν προστεθεί */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Merchants που έχουν προστεθεί
            </h2>
            <button
              type="button"
              disabled={isLoadingUsers}
              onClick={() => void loadMerchants()}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Ανανέωση λίστας
            </button>
          </div>
          {(merchantsSource === 'derived' || merchantsSource === null) &&
            !isLoadingUsers && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              <strong>Όλοι οι merchants στη ΒΔ</strong> με πλήρη{' '}
              <code className="rounded bg-amber-100/80 px-1">username / email / uuid</code> απαιτούν
              στο API το{' '}
              <code className="rounded bg-amber-100/80 px-1">GET /api/v1/Auth/merchants</code> και στο{' '}
              <code className="rounded bg-amber-100/80 px-1">.env</code> το{' '}
              <code className="rounded bg-amber-100/80 px-1">VITE_FETCH_AUTH_MERCHANTS=true</code>{' '}
              (χωρίς αυτό φαίνονται uuid από προϊόντα/παραγγελίες + τοπικές εγγραφές από εδώ).
            </p>
          )}
          {(merchantsSource === 'auth' || merchantsSource === 'mixed') &&
            !isLoadingUsers && (
            <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
              Λίστα από <strong>GET /Auth/merchants</strong>· εμφανίζονται username, email και uuid από
              τη βάση{merchantsSource === 'mixed' ? '· συμπληρώνονται και uuid χωρίς λίστα χρηστών.' : '.'}
            </p>
          )}
          {isLoadingUsers && (
            <p className="mb-2 text-xs text-slate-500">Φόρτωση merchants...</p>
          )}
          {!isLoadingUsers && users.length === 0 ? (
            <p className="text-sm text-slate-600">
              {merchantsSource === 'derived' ? (
                <>
                  Δεν βρέθηκαν merchantId σε προϊόντα/παραγγελίες. Πρόσθεσε merchant από
                  τη φόρμα ή δημιούργησε προϊόντα ώστε να εμφανιστεί ο λογαριασμός.
                </>
              ) : (
                <>
                  Δεν έχουν προστεθεί ακόμη merchants. Χρησιμοποίησε τη φόρμα δίπλα για
                  να δημιουργήσεις τον πρώτο.
                </>
              )}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-2 pr-4">Στοιχεία merchant</th>
                    <th className="pb-2 pr-4 w-[140px]">Ενέργειες</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isPendingLocal = isLocalRegistryMerchantId(u.id);
                    const uuidLine = isPendingLocal
                      ? '— (αναμονή GUID από προϊόν ή API)'
                      : u.id;
                    return (
                      <tr
                        key={u.id}
                        className={`border-b border-slate-100 ${isPendingLocal ? 'bg-sky-50/40' : ''}`}
                      >
                        <td className="py-3 pr-4 align-top">
                          <div className="rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2.5 font-mono text-[13px] leading-relaxed text-slate-800">
                            <div>
                              <span className="text-slate-500">username:</span>{' '}
                              <span className="font-semibold text-slate-900">{u.username}</span>
                            </div>
                            <div className="mt-1 break-all">
                              <span className="text-slate-500">email:</span>{' '}
                              <span className="text-slate-900">{u.email}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 break-all">
                              <span className="text-slate-500">uuid:</span>{' '}
                              <span className="text-slate-900">{uuidLine}</span>
                              {!isPendingLocal && (
                                <button
                                  type="button"
                                  className="shrink-0 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100"
                                  onClick={() => void navigator.clipboard.writeText(u.id)}
                                >
                                  Copy uuid
                                </button>
                              )}
                            </div>
                          </div>
                          {isPendingLocal && (
                            <p className="mt-1.5 text-[10px] text-sky-800">
                              Μόλις προστέθηκε από εδώ· το uuid εμφανίζεται όταν μπει στο API λίστας ή
                              δημιουργηθεί προϊόν.
                            </p>
                          )}
                        </td>
                        <td className="py-3 pr-4 align-top">
                          <button
                            type="button"
                            disabled={isPendingLocal}
                            title={
                              isPendingLocal
                                ? 'Χρειάζεται πραγματικό merchant uuid'
                                : undefined
                            }
                            onClick={() => {
                              setSelectedMerchant(u);
                              setTableNumber('');
                              setQrError(null);
                              setQrSuccess(null);
                              void loadTablesForMerchant(u.id);
                              setQrModalOpen(true);
                            }}
                            className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            QR / τραπέζια
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {qrModalOpen && selectedMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Δημιουργία QR για τραπέζι
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Merchant: <span className="font-semibold">{selectedMerchant.username}</span>
                </p>
                {isLocalRegistryMerchantId(selectedMerchant.id) ? (
                  <p className="mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] text-amber-900">
                    Δεν υπάρχει ακόμα merchant GUID. Δημιούργησε προϊόν για αυτόν τον λογαριασμό
                    ή επίλεξε τη γραμμή με πραγματικό ID από τη λίστα.
                  </p>
                ) : (
                  <p className="mt-1 break-all font-mono text-[10px] text-slate-500">
                    ID: {selectedMerchant.id}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-slate-800"
                onClick={() => setQrModalOpen(false)}
              >
                Κλείσιμο
              </button>
            </div>

            <div className="space-y-3">
              {qrError && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
                  {qrError}
                </p>
              )}
              {qrSuccess && (
                <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  QR δημιουργήθηκε! ShortCode:{' '}
                  <button
                    type="button"
                    className="font-mono underline"
                    onClick={() => navigator.clipboard.writeText(qrSuccess!)}
                  >
                    {qrSuccess}
                  </button>
                </p>
              )}

              <div>
                {selectedMerchant && (
                  <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      Τραπέζια για τον merchant
                    </p>
                    {isLoadingTablesFor === selectedMerchant.id ? (
                      <p className="text-xs text-slate-500">Φόρτωση τραπεζιών...</p>
                    ) : (
                      <ul className="space-y-1 max-h-32 overflow-y-auto text-xs text-slate-700">
                        {(merchantTables[selectedMerchant.id] ?? []).length === 0 ? (
                          <li className="text-slate-500">
                            Δεν υπάρχουν ακόμη τραπέζια για αυτόν τον merchant.
                          </li>
                        ) : (
                          (merchantTables[selectedMerchant.id] ?? []).map((t) => (
                            <li
                              key={t.id}
                              className="flex items-center justify-between gap-2 rounded-md bg-white px-2 py-1"
                            >
                              <span className="text-[11px]">
                                Τραπέζι #{t.tableId}{' '}
                                <span className="text-slate-400">
                                  ({new Date(t.createdAt).toLocaleDateString()})
                                </span>
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                                  {t.shortCode}
                                </span>
                                <button
                                  type="button"
                                  className="text-[10px] px-1.5 py-0.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-100"
                                  onClick={() => navigator.clipboard.writeText(t.shortCode)}
                                >
                                  Copy
                                </button>
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                )}

                <label
                  htmlFor="tableNumber"
                  className="block text-xs font-medium text-slate-700"
                >
                  Table Number
                </label>
                <input
                  id="tableNumber"
                  type="number"
                  min={1}
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-[#0C0C0C] focus:ring-2 focus:ring-[#0C0C0C]/10"
                />
              </div>

              <button
                type="button"
                disabled={
                  qrLoading || (selectedMerchant && isLocalRegistryMerchantId(selectedMerchant.id))
                }
                onClick={async () => {
                  if (!selectedMerchant) return;
                  if (isLocalRegistryMerchantId(selectedMerchant.id)) {
                    setQrError('Χρειάζεται πραγματικό merchant GUID.');
                    return;
                  }
                  const tableId = Number(tableNumber);
                  if (!tableId || tableId <= 0) {
                    setQrError('Συμπλήρωσε ένα έγκυρο table number.');
                    return;
                  }
                  setQrError(null);
                  setQrSuccess(null);
                  setQrLoading(true);
                  try {
                    const shortCode = await api.generateQrCode({
                      merchantId: selectedMerchant.id,
                      tableId,
                    });
                    setQrSuccess(shortCode);
                    // Ανανέωση λίστας τραπεζιών για να εμφανιστεί αμέσως το νέο τραπέζι
                    await loadTablesForMerchant(selectedMerchant.id);
                  } catch {
                    setQrError('Αποτυχία δημιουργίας QR. Δοκίμασε ξανά.');
                  } finally {
                    setQrLoading(false);
                  }
                }}
                className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#0C0C0C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#0C0C0C]/30 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
              >
                {qrLoading ? 'Δημιουργία...' : 'Δημιουργία QR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchantUsers;

