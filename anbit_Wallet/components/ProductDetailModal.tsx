
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, ChevronLeft, Heart, Share2, MessageCircle, 
  Phone, Clock, ChevronRight, Star 
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  partnerName?: string;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart, partnerName }) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-0 sm:p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-anbit-bg/95 backdrop-blur-xl" />

        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-2xl h-full sm:h-[95vh] bg-[#1a1a1c] sm:rounded-[48px] overflow-hidden flex flex-col shadow-2xl"
        >
          <div className="relative h-1/2 shrink-0 bg-black">
            <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
              <button onClick={onClose} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-[#1a1a1c] rounded-t-[48px]" />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-8 pb-32">
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold text-white italic tracking-tighter leading-tight">{product.name}</h2>
                  <p className="text-xs text-anbit-muted font-medium tracking-wide">Από {partnerName}</p>
                </div>
                <div className="flex items-center gap-1 text-anbit-yellow">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-black text-white">4.7</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#0a0a0a] p-4 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10">
                    <img src="https://i.pravatar.cc/150?u=merchant" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Στάθης Παπαδόπουλος</h4>
                    <p className="text-[10px] text-anbit-muted font-medium tracking-wide">ID: 13256626</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 bg-[#1a1a1c] rounded-full flex items-center justify-center text-white">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 bg-[#1a1a1c] rounded-full flex items-center justify-center text-white">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white tracking-wide">Περιγραφή</h4>
                <p className="text-sm text-anbit-muted leading-relaxed font-medium italic">
                  {product.description}. ΦΡΕΣΚΑ ΥΛΙΚΑ ΚΑΙ ΤΑΚΤΙΚΕΣ ΣΥΝΤΑΓΕΣ ΓΙΑ ΤΟΝ ΕΦΟΔΙΑΣΜΟ ΣΑΣ. 
                  ΠΑΡΑΓΓΕΙΛΕΤΕ ΤΩΡΑ ΚΑΙ ΘΑ ΦΤΑΣΟΥΜΕ ΓΡΗΓΟΡΑ! <span className="text-anbit-yellow font-black">ΔΙΑΒΑΣΤΕ ΠΕΡΙΣΣΟΤΕΡΑ</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1a1a1c] rounded-xl flex items-center justify-center text-anbit-yellow">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-semibold text-anbit-muted block">Χρόνος παράδοσης</span>
                    <span className="text-sm font-black text-white">25 ΛΕΠΤΑ</span>
                  </div>
                </div>
                <div className="bg-[#0a0a0a] p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                   <div className="w-10 h-10 bg-[#1a1a1c] rounded-xl flex items-center justify-center text-anbit-yellow">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-semibold text-anbit-muted block">Τύπος εφοδιασμού</span>
                    <span className="text-sm font-black text-white">{product.name.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-10 left-8 right-8 flex items-center gap-4">
            <div className="bg-[#0a0a0a] h-16 rounded-[28px] px-8 flex items-center justify-center border border-white/5 min-w-[120px]">
              <span className="text-xl font-black text-white italic tracking-tighter">${product.price.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => { onAddToCart(product); onClose(); }}
              className="flex-1 bg-anbit-yellow text-anbit-yellow-content h-16 rounded-[28px] font-bold italic tracking-tighter flex items-center justify-center gap-3 transition-all hover:opacity-90 active:scale-95 shadow-[0_20px_40px_rgba(230,53,51,0.35)]"
            >
              ΠΡΟΣΘΗΚΗ <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailModal;
