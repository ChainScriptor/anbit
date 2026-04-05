
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Eye, Smartphone, Save, User, Mail, Zap, Globe, Sun, Moon } from 'lucide-react';
import { UserData } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const SettingsPage: React.FC<{ user: UserData }> = ({ user }) => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [ghostMode, setGhostMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <motion.div 
      className="space-y-8 lg:space-y-12 pb-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section - Scaled Down */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-anbit-yellow rounded-xl flex items-center justify-center shadow-lg">
            <Settings className="w-5 h-5 text-anbit-yellow-content" />
          </div>
          <span className="text-[10px] font-semibold text-anbit-yellow tracking-wide">{t('configuration')}</span>
        </div>
        <h2 className="text-3xl lg:text-5xl font-bold text-anbit-text leading-none tracking-tighter italic">
          {t('systemProtocols').split(' ')[0]} <span className="text-anbit-yellow">{t('systemProtocols').split(' ')[1]}</span>
        </h2>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Profile & Language */}
        <div className="xl:col-span-7 space-y-6 lg:space-y-8">
          
          {/* Language Selector Section - More Compact */}
          <div className="dashboard-card p-6 lg:p-8 space-y-6 border-anbit-yellow/10">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-anbit-yellow" />
              <h3 className="text-lg lg:text-xl font-bold text-anbit-text italic tracking-tighter">{t('regionalProtocol')}</h3>
            </div>

            <div className="space-y-3">
              <label className="text-[8px] lg:text-[10px] font-semibold text-anbit-muted tracking-wide ml-1">Θέμα εφαρμογής</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTheme('dark')}
                  className={`py-3 rounded-xl font-semibold text-xs tracking-wide transition-all border flex items-center justify-center gap-2 ${
                    theme === 'dark' ? 'bg-anbit-yellow border-anbit-yellow text-anbit-yellow-content shadow-lg' : 'bg-white/5 border-anbit-border text-anbit-muted hover:text-anbit-text'
                  }`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`py-3 rounded-xl font-semibold text-xs tracking-wide transition-all border flex items-center justify-center gap-2 ${
                    theme === 'light' ? 'bg-anbit-yellow border-anbit-yellow text-anbit-yellow-content shadow-lg' : 'bg-white/5 border-anbit-border text-anbit-muted hover:text-anbit-text'
                  }`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[8px] lg:text-[10px] font-semibold text-anbit-muted tracking-wide ml-1">{t('languageSelection')}</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`py-3 rounded-xl font-semibold text-xs tracking-wide transition-all border ${
                    language === 'en' 
                    ? 'bg-anbit-yellow border-anbit-yellow text-anbit-yellow-content shadow-lg' 
                    : 'bg-white/5 border-anbit-border text-anbit-muted hover:text-anbit-text'
                  }`}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('el')}
                  className={`py-3 rounded-xl font-semibold text-xs tracking-wide transition-all border ${
                    language === 'el' 
                    ? 'bg-anbit-yellow border-anbit-yellow text-anbit-yellow-content shadow-lg' 
                    : 'bg-white/5 border-anbit-border text-anbit-muted hover:text-anbit-text'
                  }`}
                >
                  Ελληνικά
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-card p-6 lg:p-8 space-y-8">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-anbit-yellow" />
              <h3 className="text-lg lg:text-xl font-bold text-anbit-text italic tracking-tighter">{t('warriorProfile')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-1.5">
                <label className="text-[8px] lg:text-[10px] font-semibold text-anbit-muted tracking-wide ml-1">{t('codename')}</label>
                <input 
                  type="text" 
                  defaultValue={user.name}
                  className="w-full bg-white/[0.03] border border-anbit-border rounded-xl px-4 py-2.5 text-sm font-bold text-anbit-text focus:border-anbit-yellow transition-all outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] lg:text-[10px] font-semibold text-anbit-muted tracking-wide ml-1">{t('commLink')}</label>
                <input 
                  type="email" 
                  defaultValue={user.email}
                  className="w-full bg-white/[0.03] border border-anbit-border rounded-xl px-4 py-2.5 text-sm font-bold text-anbit-text focus:border-anbit-yellow transition-all outline-none"
                />
              </div>
            </div>

            <button className="flex items-center justify-center gap-2 bg-anbit-card border border-anbit-border text-anbit-text px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wide hover:bg-anbit-yellow hover:text-anbit-yellow-content transition-all">
              <Save className="w-4 h-4" /> {t('commitChanges')}
            </button>
          </div>
        </div>

        {/* Right Column: Toggles - Compact list */}
        <div className="xl:col-span-5 space-y-6 lg:space-y-8">
          <div className="dashboard-card p-6 lg:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-anbit-xp-accent" />
              <h3 className="text-lg lg:text-xl font-bold text-anbit-text italic tracking-tighter">{t('tacticalAlerts')}</h3>
            </div>

            <div className="space-y-4">
              {[
                { label: t('pushNotifications'), state: notifications, setState: setNotifications, icon: Bell },
                { label: t('ghostMode'), state: ghostMode, setState: setGhostMode, icon: Eye },
                { label: t('bioLock'), state: twoFactor, setState: setTwoFactor, icon: Smartphone }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between group p-3 bg-white/[0.01] rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/[0.03] rounded-lg border border-white/5">
                      <item.icon className="w-4 h-4 text-anbit-muted group-hover:text-anbit-xp-accent transition-colors" />
                    </div>
                    <span className="text-xs font-semibold text-anbit-text italic">{item.label}</span>
                  </div>
                  <button 
                    onClick={() => item.setState(!item.state)}
                    className={`w-10 h-5 rounded-full relative transition-all ${item.state ? 'bg-anbit-yellow' : 'bg-anbit-border'}`}
                  >
                    <motion.div 
                      animate={{ x: item.state ? 20 : 4 }}
                      className={`absolute top-1 w-3 h-3 rounded-full ${item.state ? 'bg-black' : 'bg-anbit-muted'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SettingsPage;
