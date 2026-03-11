import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type Tab = 'login' | 'register';

export const AuthTabs: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<Tab>('login');

  return (
    <div>
      <div className="mb-6 flex rounded-full bg-slate-100 p-1 text-xs font-medium">
        {(['login', 'register'] as Tab[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'login' ? 'Login' : 'Register';
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 rounded-full px-3 py-2 transition-colors ${
                isActive
                  ? 'text-[#0F172A]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-pressed={isActive}
            >
              {isActive && (
                <motion.span
                  layoutId="authTabPill"
                  className="absolute inset-0 rounded-full bg-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <LoginForm onSwitchToRegister={() => setActiveTab('register')} />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <RegisterForm />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

