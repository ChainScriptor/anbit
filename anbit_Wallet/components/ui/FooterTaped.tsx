import React from 'react';
import { cn } from '../../lib/utils';

export interface FooterTapedProps {
  t: (key: string) => string;
  className?: string;
}

export const FooterTaped: React.FC<FooterTapedProps> = ({ t, className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('w-full bg-[#111111] text-white py-16 px-4 sm:px-8 mt-12', className)}>
      <div className="mx-auto max-w-[1180px] px-3 sm:px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-20">
          <div className="lg:col-span-1">
            <div className="text-4xl font-black italic text-white mb-8 leading-none tracking-tight">Anbit</div>
            <div className="space-y-3">
              <a className="block w-36" href="#" aria-label="Λήψη από App Store">
                <img
                  alt="Download on App Store"
                  className="w-full h-auto"
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                />
              </a>
              <a className="block w-40" href="#" aria-label="Λήψη από Google Play">
                <img
                  alt="Get it on Google Play"
                  className="w-full h-auto"
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm mb-6">Συνεργασία με την Anbit</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a className="hover:text-white transition-colors" href="#">Για συνεργάτες διανομείς</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Για εμπόρους</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Για συνεργάτες</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm mb-6">Εταιρεία</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a className="hover:text-white transition-colors" href="#">Σχετικά με εμάς</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Τι αντιπροσωπεύουμε</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Εργασία</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Ασφάλεια</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm mb-6">Προϊόντα</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a className="hover:text-white transition-colors" href="#">Anbit Drive</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Αγορά Anbit</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Anbit+</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Anbit Ads</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm mb-6">Χρήσιμα links</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a className="hover:text-white transition-colors" href="#">Υποστήριξη</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Media</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Επικοινωνία</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Προγραμματιστές</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm mb-6">Ακολουθήστε μας</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a className="hover:text-white transition-colors" href="#">Instagram</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Facebook</a></li>
              <li><a className="hover:text-white transition-colors" href="#">X</a></li>
              <li><a className="hover:text-white transition-colors" href="#">LinkedIn</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-white/10 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-white/80">
          <div>Greece</div>
          <div>Ελληνικά</div>
          <div>Cookies</div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-gray-400">
          <a className="hover:text-white transition-colors" href="#">Δήλωση προσβασιμότητας</a>
          <a className="hover:text-white transition-colors" href="#">Όροι Χρήσης Υπηρεσίας</a>
          <span className="text-white/30">©Anbit {currentYear}</span>
        </div>
      </div>
      {/* Keep t prop in use for compatibility with current App call site */}
      <span className="sr-only">{t('dashboard')}</span>
      <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}`}</style>
    </footer>
  );
};
