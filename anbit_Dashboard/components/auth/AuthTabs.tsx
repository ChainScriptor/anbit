import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type Tab = 'login' | 'register';

interface AuthTabsProps {
  onTabChange?: (tab: Tab) => void;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = React.useState<Tab>('login');
  React.useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);

  return (
    <div>
      {activeTab === 'register' && (
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          className="mb-4 font-playpen-sans text-xs font-extrabold uppercase tracking-widest text-white/70 hover:text-white"
        >
          Back to Sign in
        </button>
      )}

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
            <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

