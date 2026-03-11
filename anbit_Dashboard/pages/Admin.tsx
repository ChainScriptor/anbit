import React, { useState } from 'react';
import { api } from '@/services/api';

const AdminPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const adminSecret = import.meta.env.VITE_ADMIN_SECRET;

    if (!adminSecret) {
      setErrorMessage('Λείπει η μεταβλητή περιβάλλοντος VITE_ADMIN_SECRET.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/Auth/register-admin', {
        username,
        email,
        password,
        secret: adminSecret,
      });

      setSuccessMessage('Ο συνεργάτης δημιουργήθηκε με επιτυχία!');
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Κάτι πήγε στραβά κατά τη δημιουργία συνεργάτη.',
      );
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
            'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fca5a5 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Προσθήκη Νέου Συνεργάτη
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
              Δημιουργήστε νέους συνεργάτες με πρόσβαση στο Anbit Dashboard.
            </p>
          </div>
          <div className="mt-4 flex justify-center md:mt-0 md:block">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/70 text-4xl shadow-sm md:h-28 md:w-28">
              🛠️
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-medium text-slate-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-[#0C0C0C] focus:ring-2 focus:ring-[#0C0C0C]/10"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-[#0C0C0C] focus:ring-2 focus:ring-[#0C0C0C]/10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
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
            {isSubmitting ? 'Αποστολή...' : 'Προσθήκη Συνεργάτη'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;

