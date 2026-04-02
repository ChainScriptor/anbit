
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Package, 
  Tag, 
  Image as ImageIcon,
  DollarSign,
  Star,
  ShieldAlert,
  ChevronRight,
  Activity,
  X,
  Upload,
  Camera,
  PlusCircle,
  Save,
  Check,
  AlertTriangle
} from 'lucide-react';
import { INITIAL_PRODUCTS } from '../constants';
import { Product, ProductStat } from '../types';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState<string[]>(['Όλα', 'Καφέδες', 'Φαγητό', 'Ποτά', 'Specialty']);
  const [availableAllergens, setAvailableAllergens] = useState<string[]>(['Γλουτένη', 'Γάλα', 'Αυγό', 'Ξηροί Καρποί', 'Σόγια']);
  const [customAllergen, setCustomAllergen] = useState('');
  
  const [activeCategory, setActiveCategory] = useState('Όλα');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Category Management State
  const [newCatName, setNewCatName] = useState('');
  const [editingCatIndex, setEditingCatIndex] = useState<number | null>(null);
  const [editCatValue, setEditCatValue] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Products
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: 'Καφέδες',
    price: 0,
    pointsReward: 0,
    image: '',
    allergens: [],
  });

  const filteredProducts = activeCategory === 'Όλα' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.image) {
      alert("Παρακαλώ συμπληρώστε όνομα και επιλέξτε εικόνα.");
      return;
    }

    const product: Product = {
      ...newProduct as Product,
      id: `P-${Date.now()}`,
      isActive: true,
      stats: [] 
    };
    setProducts([...products, product]);
    setIsModalOpen(false);
    setNewProduct({
      name: '',
      category: categories[1] || 'Γενικά',
      price: 0,
      pointsReward: 0,
      image: '',
      allergens: [],
    });
  };

  const toggleAllergen = (allergen: string) => {
    const current = newProduct.allergens || [];
    if (current.includes(allergen)) {
      setNewProduct({ ...newProduct, allergens: current.filter(a => a !== allergen) });
    } else {
      setNewProduct({ ...newProduct, allergens: [...current, allergen] });
    }
  };

  const addNewAllergen = () => {
    if (customAllergen.trim() && !availableAllergens.includes(customAllergen.trim())) {
      setAvailableAllergens([...availableAllergens, customAllergen.trim()]);
      toggleAllergen(customAllergen.trim());
      setCustomAllergen('');
    }
  };

  // Category Management Handlers
  const addCategory = () => {
    if (newCatName.trim() && !categories.includes(newCatName.trim())) {
      setCategories([...categories, newCatName.trim()]);
      setNewCatName('');
    }
  };

  const deleteCategory = (catToDelete: string) => {
    if (catToDelete === 'Όλα') return;
    if (window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε την κατηγορία "${catToDelete}"; Τα προϊόντα αυτής της κατηγορίας θα παραμείνουν αλλά χωρίς κατηγορία.`)) {
      setCategories(categories.filter(c => c !== catToDelete));
      if (activeCategory === catToDelete) setActiveCategory('Όλα');
      // Update products category if needed
      setProducts(products.map(p => p.category === catToDelete ? { ...p, category: 'Χωρίς Κατηγορία' } : p));
    }
  };

  const startEditCategory = (index: number) => {
    setEditingCatIndex(index);
    setEditCatValue(categories[index]);
  };

  const saveCategoryName = (index: number) => {
    const oldName = categories[index];
    const newName = editCatValue.trim();
    if (newName && !categories.includes(newName)) {
      const updatedCategories = [...categories];
      updatedCategories[index] = newName;
      setCategories(updatedCategories);
      
      // Update products belonging to this category
      setProducts(products.map(p => p.category === oldName ? { ...p, category: newName } : p));
      
      if (activeCategory === oldName) setActiveCategory(newName);
      setEditingCatIndex(null);
    } else if (newName === oldName) {
      setEditingCatIndex(null);
    } else {
      alert("Το όνομα κατηγορίας υπάρχει ήδη ή είναι κενό.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight uppercase italic flex items-center gap-3 text-white">
            <Package className="text-anbit-yellow" size={24} /> Καταλογος Ειδων
          </h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
            Κεντρικη Διαχειριση Inventory & Loyalty Rewards
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition-all"
          >
            <Tag size={14} /> Κατηγοριες
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-anbit-yellow text-anbit-dark rounded-lg text-[10px] font-black uppercase tracking-wider shadow-glow-yellow active:scale-95 transition-all"
          >
            <Plus size={16} /> Νεο Προϊον
          </button>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border
              ${activeCategory === cat 
                ? 'bg-anbit-yellow border-anbit-yellow text-anbit-dark shadow-glow-yellow' 
                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <motion.div 
            layout
            key={product.id} 
            className="glass-tactical rounded-heavy border border-white/5 overflow-hidden group hover:border-anbit-yellow/30 transition-all"
          >
            <div className="relative h-40 overflow-hidden">
               <img src={product.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500" alt="" />
               <div className="absolute inset-0 bg-gradient-to-t from-anbit-dark via-transparent to-transparent opacity-60" />
               <div className="absolute top-3 right-3 px-2 py-1 bg-anbit-dark/80 backdrop-blur-md rounded border border-white/10">
                 <span className="text-[9px] font-black text-anbit-yellow uppercase italic tracking-tighter">€{product.price.toFixed(2)}</span>
               </div>
               <div className="absolute bottom-3 left-3">
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">{product.category}</span>
                  <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{product.name}</h4>
               </div>
            </div>

            <div className="p-5 space-y-4">
               <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {product.allergens?.map((alg, i) => (
                      <div key={i} className="group/alg relative">
                        <ShieldAlert size={14} className="text-red-500/40 hover:text-red-500 transition-colors cursor-help" />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-red-950 text-red-200 text-[8px] font-black uppercase rounded opacity-0 group-hover/alg:opacity-100 transition-opacity whitespace-nowrap border border-red-500/20">
                          {alg}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-anbit-gold">+{product.pointsReward}</span>
                    <Star size={10} className="text-anbit-gold fill-anbit-gold" />
                  </div>
               </div>

               <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-white/60">
                    <Edit size={12} /> Επεξεργασια
                  </button>
                  <button 
                    onClick={() => setProducts(products.filter(p => p.id !== product.id))}
                    className="p-2 bg-red-500/5 border border-red-500/20 text-red-500/40 rounded-lg hover:text-red-500 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CATEGORY MANAGEMENT MODAL */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="fixed inset-0 bg-anbit-dark/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass border border-white/10 rounded-heavy shadow-2xl p-6 sm:p-8"
            >
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-anbit-yellow/10 rounded-2xl border border-anbit-yellow/20 text-anbit-yellow">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black italic text-white uppercase tracking-tight">Διαχειριση Κατηγοριων</h3>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Οργάνωση Καταλόγου</p>
                    </div>
                 </div>
                 <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 text-white/20 hover:text-white transition-colors"><X size={20}/></button>
              </div>

              <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl group">
                    <div className="flex-1">
                      {editingCatIndex === idx ? (
                        <input 
                          autoFocus
                          type="text"
                          value={editCatValue}
                          onChange={(e) => setEditCatValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveCategoryName(idx)}
                          className="w-full bg-white/10 border border-anbit-yellow/30 rounded px-2 py-1 text-xs font-bold text-white outline-none"
                        />
                      ) : (
                        <span className="text-xs font-bold text-white/80 uppercase tracking-wide">{cat}</span>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingCatIndex === idx ? (
                        <button onClick={() => saveCategoryName(idx)} className="text-anbit-green hover:scale-110 transition-transform"><Check size={16}/></button>
                      ) : (
                        <>
                          {cat !== 'Όλα' && (
                            <>
                              <button onClick={() => startEditCategory(idx)} className="text-white/40 hover:text-anbit-yellow transition-colors"><Edit size={14}/></button>
                              <button onClick={() => deleteCategory(cat)} className="text-white/40 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Προσθηκη Νεας Κατηγοριας</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    placeholder="Όνομα κατηγορίας..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white focus:border-anbit-yellow outline-none transition-all placeholder:text-white/10"
                  />
                  <button 
                    onClick={addCategory}
                    className="px-4 bg-anbit-yellow text-anbit-dark rounded-xl font-black shadow-glow-yellow hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW PRODUCT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-anbit-dark/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-3xl glass border border-white/10 rounded-heavy shadow-2xl p-8 max-h-[90vh] overflow-y-auto no-scrollbar"
            >
               <div className="flex justify-between items-center mb-8">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-anbit-yellow/10 rounded-2xl border border-anbit-yellow/20 text-anbit-yellow">
                      <Plus size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Νεο Τακτικο Ειδος</h3>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">Προσθηκη στον Καταλογο Επιχειρησης</p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-white/20 hover:text-white transition-colors"><X size={20}/></button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Image Upload & Preview */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={10} /> Εικονα Προϊοντος</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative h-64 bg-white/5 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/10 hover:border-anbit-yellow/40 transition-all group overflow-hidden"
                      >
                        {newProduct.image ? (
                          <>
                            <img src={newProduct.image} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" alt="Preview" />
                            <div className="relative z-10 p-3 bg-anbit-dark/80 rounded-xl border border-white/10 text-white/80">
                              <Camera size={24} />
                            </div>
                            <span className="relative z-10 text-[10px] font-black uppercase text-white/80 bg-anbit-dark/80 px-4 py-2 rounded-lg">Αλλαγη Εικονας</span>
                          </>
                        ) : (
                          <>
                            <div className="p-4 bg-white/5 rounded-2xl text-white/20 group-hover:text-anbit-yellow transition-colors">
                              <Upload size={32} />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-black text-white/60 uppercase">Κλικ για Μεταφορτωση</p>
                              <p className="text-[8px] font-bold text-white/20 uppercase mt-1">PNG, JPG, WebP ή AVIF</p>
                            </div>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*,.avif,image/avif" 
                        className="hidden" 
                      />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2"><ShieldAlert size={12} /> Αλλεργιογονα</label>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {availableAllergens.map(alg => (
                            <button
                              key={alg}
                              onClick={() => toggleAllergen(alg)}
                              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all border ${
                                newProduct.allergens?.includes(alg) 
                                ? 'bg-red-500/20 border-red-500 text-red-200' 
                                : 'bg-white/5 border-white/5 text-white/20 hover:border-white/20'
                              }`}
                            >
                              {alg}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2">
                           <input 
                            type="text" 
                            value={customAllergen}
                            onChange={(e) => setCustomAllergen(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addNewAllergen()}
                            placeholder="Προσθήκη νέου..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[10px] font-bold focus:border-anbit-yellow outline-none transition-all placeholder:text-white/10"
                           />
                           <button 
                            onClick={addNewAllergen}
                            className="p-2 bg-anbit-yellow/10 border border-anbit-yellow/20 rounded-lg text-anbit-yellow hover:bg-anbit-yellow/20 transition-all"
                           >
                             <PlusCircle size={18} />
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Text Inputs */}
                  <div className="space-y-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2"><Activity size={10} /> Ονομα Προϊοντος</label>
                        <input 
                          type="text" 
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                          placeholder="π.χ. Neon Espresso" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm font-bold text-white focus:border-anbit-yellow outline-none transition-all placeholder:text-white/10" 
                        />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2"><DollarSign size={10} /> Τιμη Μοναδας (€)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                            placeholder="0.00" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm font-bold text-white focus:border-anbit-yellow outline-none" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2"><Star size={10} /> Ποντοι Loyalty</label>
                          <input 
                            type="number" 
                            value={newProduct.pointsReward}
                            onChange={(e) => setNewProduct({...newProduct, pointsReward: parseInt(e.target.value)})}
                            placeholder="0" 
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm font-bold text-white focus:border-anbit-yellow outline-none" 
                          />
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest">Κατηγορια</label>
                        <select 
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm font-bold text-white outline-none appearance-none"
                        >
                           {categories.filter(c => c !== 'Όλα').map(c => <option key={c} value={c} className="bg-anbit-dark">{c}</option>)}
                        </select>
                     </div>

                     <div className="p-6 bg-anbit-yellow/5 border border-anbit-yellow/10 rounded-2xl">
                       <h4 className="text-[10px] font-black text-anbit-yellow uppercase tracking-widest mb-2 flex items-center gap-2">
                         <Star size={12} className="fill-anbit-yellow" /> Loyalty Intelligence
                       </h4>
                       <p className="text-[10px] text-white/40 font-medium leading-relaxed italic">
                         Το προϊόν αυτό θα αποδίδει <span className="text-white font-bold">{newProduct.pointsReward} πόντους</span> ανά αγορά. 
                         Αυτό αντιστοιχεί σε μια αξία επιβράβευσης περίπου <span className="text-anbit-green">€{(Number(newProduct.pointsReward || 0) * 0.01).toFixed(2)}</span> για τον πελάτη.
                       </p>
                     </div>
                  </div>
               </div>

               <div className="mt-10 flex gap-4">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 text-white/40 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                  >
                    Ακυρωση
                  </button>
                  <button 
                    onClick={handleAddProduct}
                    className="flex-1 py-4 bg-anbit-yellow text-anbit-dark rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-glow-yellow hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Ολοκληρωση & Προσθηκη
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
