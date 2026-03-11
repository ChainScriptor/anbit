import React, { useState } from 'react';

interface MerchantUser {
  id: number;
  username: string;
  email: string;
}

const MerchantUsers: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<MerchantUser[]>([]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    // TODO: όταν προστεθεί backend endpoint για merchants, κάνε εδώ πραγματικό POST.
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setUsers((prev) => [
        ...prev,
        {
          id: Date.now(),
          username,
          email,
        },
      ]);

      setSuccessMessage('Ο χρήστης merchant προστέθηκε (mock). Συνδέστε backend endpoint.');
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
          <h2 className="text-base font-semibold text-slate-900 mb-4">
            Merchants που έχουν προστεθεί
          </h2>
          {users.length === 0 ? (
            <p className="text-sm text-slate-600">
              Δεν έχουν προστεθεί ακόμη merchants. Χρησιμοποίησε τη φόρμα δίπλα
              για να δημιουργήσεις τον πρώτο.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-2 pr-4">Username</th>
                    <th className="pb-2 pr-4">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-medium text-slate-900">
                        {u.username}
                      </td>
                      <td className="py-2 pr-4 text-slate-700">{u.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchantUsers;

