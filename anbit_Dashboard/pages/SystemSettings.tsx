import React from 'react';

const SystemSettings: React.FC = () => {
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
              System Settings
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 md:text-base">
              Ρυθμίσεις πλατφόρμας για admins (API keys, secrets, feature flags).
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <p className="text-sm text-slate-600">
          Οι system settings θα συνδεθούν με πραγματικά configuration endpoints
          σε επόμενο βήμα. Προς το παρόν η σελίδα είναι admin-only placeholder.
        </p>
      </div>
    </div>
  );
};

export default SystemSettings;

