import React from 'react';
import { motion } from 'framer-motion';
import { AuthTabs } from '@/components/auth/AuthTabs';
import { PawPrint, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HandWrittenTitle } from '@/components/ui/hand-writing-text';

const HERO_IMAGE_URL =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [authTab, setAuthTab] = React.useState<'login' | 'register'>('login');

  return (
    <div className="omnes-auth relative flex min-h-screen flex-col bg-[#f5f3ef] text-[#0F172A] lg:flex-row">
      <style>{`
        @font-face {
          font-family: 'OmnesBoldItalic';
          src: url('/fonts/OmnesBoldItalic.ttf') format('truetype');
          font-weight: 700;
          font-style: italic;
          font-display: swap;
        }
        .omnes-auth * {
          font-family: OmnesBoldItalic, sans-serif !important;
          font-weight: 700 !important;
          font-style: italic !important;
        }
      `}</style>
      {/* Left side – previous full-image background */}
      <div className="relative z-10 flex min-h-[44vh] flex-1 items-center justify-center overflow-hidden lg:min-h-screen">
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
        <div className="relative z-10 flex flex-col items-center justify-center px-6 py-10 text-white sm:px-10 lg:px-14">
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
                <span className="inline-flex w-[260px] translate-y-5 align-middle sm:w-[320px]">
                  <HandWrittenTitle
                    title="Anbit"
                    subtitle=""
                    className="py-0"
                    titleClassName="text-[#0a0a0a] [text-shadow:0_1px_0_rgba(255,255,255,0.95),0_-1px_0_rgba(255,255,255,0.95),1px_0_0_rgba(255,255,255,0.95),-1px_0_0_rgba(255,255,255,0.95)] !text-4xl sm:!text-5xl"
                    titleStyle={{ fontFamily: 'OmnesBoldItalic, sans-serif', fontStyle: 'italic', fontWeight: 700 }}
                  />
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm font-medium text-white/90 drop-shadow-md sm:text-base">
                Join the Anbit marketplace and reach more customers with powerful delivery and
                ordering tools tailored for modern hospitality.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Wave divider: horizontal on mobile, vertical on desktop */}
      <div className="pointer-events-none absolute inset-0 z-20">
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          className="absolute bottom-[48%] left-0 h-20 w-full text-[#1a1a1a] lg:hidden"
          aria-hidden
        >
          <path
            d="M0,120 C220,200 420,40 680,110 C930,175 1170,55 1440,120 L1440,220 L0,220 Z"
            fill="currentColor"
          />
        </svg>
        <svg
          viewBox="0 0 220 1440"
          preserveAspectRatio="none"
          className="absolute right-[49%] top-0 hidden h-full w-24 text-[#1a1a1a] lg:block"
          aria-hidden
        >
          <path
            d="M98,0 C178,230 28,470 110,720 C186,970 24,1210 106,1440 L220,1440 L220,0 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Right side – login panel */}
      <div className="relative z-10 flex flex-1 flex-col bg-[#1a1a1a] text-white">
        <header className="flex h-16 w-full items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <PawPrint className="h-4.5 w-4.5 text-[#0a0a0a]" strokeWidth={2.4} />
            </div>
            <span className="font-semibold tracking-tight text-white">Anbit Merchant</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-white/60 transition-opacity hover:text-white"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </header>

        <div className="flex flex-1 items-start justify-center px-8 pb-16 pt-10">
          <motion.div
            className="w-full max-w-md"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="mb-10 text-center">
              <h1 className="text-5xl font-extrabold tracking-tight text-white">Welcome Back,</h1>
              <p className="mt-3 text-3xl font-medium tracking-tight text-white/55">
                {authTab === 'login'
                  ? 'Please login to your account'
                  : 'Create your merchant account'}
              </p>
            </div>
            <AuthTabs onTabChange={setAuthTab} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

