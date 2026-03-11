import React, { useState } from 'react';

const StoresManagement: React.FC = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCreateStore = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      // TODO: Συνδέστε με πραγματικό API δημιουργίας καταστήματος όταν είναι διαθέσιμο.
      await new Promise((resolve) => setTimeout(resolve, 700));
      setMessage('Το κατάστημα δημιουργήθηκε (mock). Συνδέστε backend endpoint.');
      setName('');
      setLocation('');
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
              Stores Management
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
              Δημιουργήστε και διαχειριστείτε συνεργαζόμενα καταστήματα στην
              πλατφόρμα.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 max-w-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            Create New Store
          </h2>
        </div>
        <form onSubmit={handleCreateStore} className="space-y-4">
          <div>
            <label
              htmlFor="storeName"
              className="block text-xs font-medium text-slate-700"
            >
              Store Name
            </label>
            <input
              id="storeName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-[#0C0C0C] focus:ring-2 focus:ring-[#0C0C0C]/10"
            />
          </div>

          <div>
            <label
              htmlFor="storeLocation"
              className="block text-xs font-medium text-slate-700"
            >
              Location
            </label>
            <input
              id="storeLocation"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm outline-none ring-0 transition focus:bg-white focus:border-[#0C0C0C] focus:ring-2 focus:ring-[#0C0C0C]/10"
            />
          </div>

          {message && (
            <p className="rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-[#0C0C0C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#0C0C0C]/30 transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Creating...' : 'Create New Store'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StoresManagement;

