import React from 'react';
import { motion } from 'framer-motion';
import { AuthTabs } from '@/components/auth/AuthTabs';

const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80';

const AuthPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-stretch bg-[#F8FAFC] text-[#0F172A]">
      {/* Left side – hero (desktop only) */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <img
            src={HERO_IMAGE_URL}
            alt="Anbit merchant working with laptop"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/70 to-black/30" />
        <div className="relative z-10 flex flex-col items-center justify-center p-10 text-white xl:p-14">
          <div className="max-w-xl space-y-5 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="inline-flex items-center justify-center rounded-full bg-black/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/95">
                For merchants & local businesses
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight drop-shadow-lg sm:text-5xl">
                Grow your business with{' '}
                <span className="text-[#0a0a0a]">Anbit</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm font-medium text-white/90 drop-shadow-md sm:text-base">
                Join the Anbit marketplace and reach more customers with powerful
                delivery and ordering tools tailored for modern hospitality.
              </p>
            </motion.div>

            <motion.ul
              className="mt-6 space-y-3 text-sm xl:text-base"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#0a0a0a]" />
                <p>More customers without extra marketing.</p>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#0a0a0a]" />
                <p>Fast and reliable delivery network.</p>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-[#0a0a0a]" />
                <p>Simple, centralized order management system.</p>
              </li>
            </motion.ul>
          </div>

          <motion.div
            className="mt-8 text-xs text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Powered by Anbit • Designed for restaurants, cafés, bakeries & more.
          </motion.div>
        </div>
      </div>

      {/* Right side – auth card */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="mb-6 flex items-center justify-center gap-2 lg:justify-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a0a0a] text-lg font-bold text-white">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-[#0a0a0a]">Anbit Merchant</p>
              <p className="text-xs text-slate-500">
                Partner dashboard login & onboarding
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-7">
            <AuthTabs />
          </div>

          <p className="mt-4 text-center text-xs text-slate-500 lg:text-left">
            Need help? Contact our merchant support team at{' '}
            <span className="font-medium text-[#0a0a0a]">support@anbit.app</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;

