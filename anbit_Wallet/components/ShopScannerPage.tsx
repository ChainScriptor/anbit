
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, QrCode, Cpu, ShieldAlert, Camera, Zap, CheckCircle2 } from 'lucide-react';
import { Partner } from '../types';
import { containerVariants, itemVariants } from '../constants';
import { useLanguage } from '../context/LanguageContext';

interface ShopScannerPageProps {
  partners: Partner[];
  onOpenPartnerMenu: (partner: Partner) => void;
}

const ShopScannerPage: React.FC<ShopScannerPageProps> = ({ partners, onOpenPartnerMenu }) => {
  const { t } = useLanguage();
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scannedPartner, setScannedPartner] = useState<Partner | null>(null);

  const startScanner = async () => {
    setScanState('scanning');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
      setTimeout(() => {
        const randomPartner = partners[Math.floor(Math.random() * partners.length)];
        setScannedPartner(randomPartner);
        setScanState('success');
        stopCamera();
      }, 3000);
    } catch (err) {
      setScanState('error');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const simulateNFCTap = () => {
    setScanState('scanning');
    setTimeout(() => {
      const randomPartner = partners[Math.floor(Math.random() * partners.length)];
      setScannedPartner(randomPartner);
      setScanState('success');
    }, 1500);
  };

  useEffect(() => {
    if (scanState === 'success' && scannedPartner) {
      const timer = setTimeout(() => {
        onOpenPartnerMenu(scannedPartner);
        setScanState('idle');
        setScannedPartner(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [scanState, scannedPartner, onOpenPartnerMenu]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <motion.div className="max-w-2xl mx-auto space-y-8 lg:space-y-12 py-6" initial="hidden" animate="visible" variants={containerVariants}>
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-anbit-yellow/10 rounded-2xl flex items-center justify-center border border-anbit-yellow">
            <Scan className="w-7 h-7 text-anbit-yellow" />
          </div>
        </div>
        <h2 className="text-2xl lg:text-4xl font-bold text-white italic tracking-tighter leading-none">
          {t('scanToOrder').split(' to ')[0]} <span className="text-anbit-yellow">{t('scanToOrder').split('Scan ')[1]}</span>
        </h2>
        <p className="text-xs lg:text-sm text-anbit-muted italic max-w-md mx-auto">{t('scannerIntro')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dashboard-card p-6 lg:p-8 space-y-6 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-2">
             <QrCode className="w-5 h-5 text-anbit-yellow" />
             <span className="text-[10px] font-bold text-white italic tracking-tighter">{t('opticalScan')}</span>
          </div>
          <div className="relative w-full aspect-square rounded-2xl bg-black overflow-hidden border border-anbit-border flex items-center justify-center">
            {cameraActive ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-50" /> : <Camera className="w-10 h-10 text-anbit-muted" />}
            <AnimatePresence>
              {scanState === 'success' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-anbit-yellow flex flex-col items-center justify-center text-anbit-yellow-content p-4 z-20">
                  <CheckCircle2 className="w-10 h-10 mb-2" />
                  <p className="text-lg font-bold italic text-center leading-none">{scannedPartner?.name}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={startScanner} disabled={scanState === 'scanning'} className="w-full py-3 rounded-xl font-semibold text-xs tracking-wide bg-anbit-card border border-anbit-border text-anbit-text hover:bg-anbit-yellow hover:text-anbit-yellow-content transition-all">
            {scanState === 'scanning' ? 'Scanning...' : t('initiateCamera')}
          </button>
        </div>

        <div className="dashboard-card p-6 lg:p-8 space-y-6 flex flex-col justify-between items-center">
          <div className="w-full flex justify-between items-center mb-2">
             <Cpu className="w-5 h-5 text-anbit-yellow" />
             <span className="text-[10px] font-bold text-white italic tracking-tighter">{t('nfcProximity')}</span>
          </div>
          <div className="w-full aspect-square rounded-2xl bg-white/[0.02] border border-dashed border-anbit-border flex flex-col items-center justify-center text-center p-6 space-y-4">
             <Zap className="w-12 h-12 text-anbit-yellow" />
             <p className="text-[10px] font-semibold text-white tracking-wide">{t('tapStation')}</p>
          </div>
          <button onClick={simulateNFCTap} className="w-full py-3 rounded-xl bg-anbit-yellow text-anbit-yellow-content font-semibold text-xs tracking-wide hover:opacity-90 transition-all">
            NFC Sync
          </button>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-anbit-border p-6 rounded-2xl flex items-start gap-4">
        <ShieldAlert className="w-8 h-8 text-anbit-yellow shrink-0" />
        <div className="space-y-1">
           <h4 className="text-sm font-bold text-white italic tracking-tighter">{t('protocolAwareness')}</h4>
           <p className="text-[10px] text-anbit-muted font-medium italic">Ensure you are at the partner's location to authenticate your deployment.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ShopScannerPage;
