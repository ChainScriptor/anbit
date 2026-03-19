import React, { useEffect, useMemo, useState } from 'react';
import {
  api,
  type ApiUserSummary,
  type ApiUserLeaderboardEntry,
  type ApiUserActivityEntry,
} from '@/services/api';
import { Button } from '@/components/ui/button';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<ApiUserSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<ApiUserLeaderboardEntry[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [banError, setBanError] = useState<string | null>(null);
  const [banSuccess, setBanSuccess] = useState<string | null>(null);
  const [selectedUserForActivity, setSelectedUserForActivity] =
    useState<ApiUserSummary | null>(null);
  const [activity, setActivity] = useState<ApiUserActivityEntry[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      setUsersError(null);
      try {
        const data = await api.getUsers();
        setUsers(data);
      } catch (e) {
        console.error(e);
        setUsersError('Αποτυχία φόρτωσης χρηστών (Wallet).');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    const loadLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      setLeaderboardError(null);
      try {
        const data = await api.getUsersLeaderboard();
        setLeaderboard(data);
      } catch (e) {
        console.error(e);
        setLeaderboardError('Αποτυχία φόρτωσης leaderboard.');
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    void loadUsers();
    void loadLeaderboard();
  }, []);

  const handleBanUser = async (user: ApiUserSummary) => {
    if (user.isBanned) return;
    const confirm = window.confirm(
      `Είσαι σίγουρος ότι θέλεις να μπλοκάρεις τον χρήστη "${user.username}" για ύποπτη δραστηριότητα;`,
    );
    if (!confirm) return;

    setBanError(null);
    setBanSuccess(null);
    try {
      await api.banUser(user.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBanned: true } : u)),
      );
      setBanSuccess('Ο χρήστης μπλοκαρίστηκε επιτυχώς.');
    } catch (e) {
      console.error(e);
      setBanError('Αποτυχία ban χρήστη.');
    }
  };

  const activeUsers = useMemo(
    () => users.filter((u) => !u.isBanned),
    [users],
  );

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, userSearch]);

  const handleOpenActivity = async (user: ApiUserSummary) => {
    setSelectedUserForActivity(user);
    setIsLoadingActivity(true);
    setActivityError(null);
    setActivity([]);
    try {
      const data = await api.getUserActivity(user.id);
      setActivity(data);
    } catch (e) {
      console.error(e);
      setActivityError('Αποτυχία φόρτωσης activity για τον χρήστη.');
    } finally {
      setIsLoadingActivity(false);
    }
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
            <p className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-rose-700 mb-2">
              Platform Administrator
            </p>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Users Management
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-700 md:text-base">
              Δες όλους τους τελικούς πελάτες που έχουν γραφτεί στο Anbit Wallet,
              παρακολούθησε το XP/Level leaderboard και κάνε ban σε υπόπτους
              χρήστες με ψεύτικες παραγγελίες.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Λίστα Χρηστών (Wallet Customers)
            </h2>
            <span className="text-xs text-slate-500">
              Σύνολο: {users.length} • Ενεργοί: {activeUsers.length}
            </span>
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Αναζήτηση χρήστη (όνομα ή email)..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          {isLoadingUsers && (
            <p className="text-xs text-slate-500 mb-2">
              Φόρτωση χρηστών...
            </p>
          )}
          {usersError && (
            <p className="text-xs text-red-600 mb-2">{usersError}</p>
          )}
          {banError && (
            <p className="text-xs text-red-600 mb-2">{banError}</p>
          )}
          {banSuccess && (
            <p className="text-xs text-emerald-600 mb-2">{banSuccess}</p>
          )}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
            {users.length === 0 && !isLoadingUsers && (
              <div className="p-4 text-xs text-slate-500">
                Δεν έχουν γραφτεί ακόμα χρήστες στο Wallet.
              </div>
            )}
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm bg-white"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {u.username}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {u.email}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Roles: {u.roles.join(', ')} • Created:{' '}
                    {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={
                      u.isBanned
                        ? 'rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700'
                        : 'rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700'
                    }
                  >
                    {u.isBanned ? 'BANNED' : 'ACTIVE'}
                  </span>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => void handleOpenActivity(u)}
                    className="h-7 px-2 text-[11px]"
                  >
                    Activity
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={u.isBanned}
                    onClick={() => void handleBanUser(u)}
                    className="h-7 px-2 text-[11px]"
                  >
                    {u.isBanned ? 'Already banned' : 'Ban user'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              XP / Loyalty Leaderboard
            </h2>
          </div>
          {isLoadingLeaderboard && (
            <p className="text-xs text-slate-500 mb-2">
              Φόρτωση leaderboard...
            </p>
          )}
          {leaderboardError && (
            <p className="text-xs text-red-600 mb-2">{leaderboardError}</p>
          )}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {leaderboard.length === 0 && !isLoadingLeaderboard && (
              <p className="text-xs text-slate-500">
                Δεν υπάρχουν ακόμα XP από παραγγελίες για να εμφανιστεί leaderboard.
              </p>
            )}
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-rose-600">
                  #{entry.rank}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900">
                    {entry.username}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {entry.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-rose-600">
                    {entry.totalXp.toLocaleString()} XP
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            Το leaderboard βασίζεται στα συνολικά XP από παραγγελίες (TotalXp)
            που έχουν συλλέξει οι χρήστες στο Anbit Wallet.
          </p>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Activity Feed
            </h2>
            <span className="text-xs text-slate-500">
              {selectedUserForActivity
                ? `Χρήστης: ${selectedUserForActivity.username}`
                : 'Επίλεξε χρήστη από τη λίστα για να δεις το activity του.'}
            </span>
          </div>
          {isLoadingActivity && (
            <p className="text-xs text-slate-500 mb-2">
              Φόρτωση activity...
            </p>
          )}
          {activityError && (
            <p className="text-xs text-red-600 mb-2">{activityError}</p>
          )}
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {selectedUserForActivity && activity.length === 0 && !isLoadingActivity && (
              <p className="text-xs text-slate-500">
                Ο χρήστης δεν έχει ακόμα παραγγελίες.
              </p>
            )}
            {!selectedUserForActivity && (
              <p className="text-xs text-slate-500">
                Επίλεξε έναν χρήστη (κουμπί Activity) για να δεις τι έχει
                σκανάρει και τι έχει παραγγείλει.
              </p>
            )}
            {activity.map((entry) => (
              <div
                key={entry.orderId}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {entry.merchantName} • Τραπέζι {entry.tableNumber}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-rose-600">
                      €{entry.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {entry.totalXp} XP
                    </p>
                  </div>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {entry.products.map((p) => (
                    <li key={p.productId} className="flex justify-between gap-2">
                      <span className="truncate text-slate-700">
                        {p.quantity}× {p.name}
                      </span>
                      <span className="shrink-0 text-slate-500">
                        €{p.unitPrice.toFixed(2)} • {p.unitXp} XP
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

