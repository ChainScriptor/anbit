import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Star, Trash2 } from 'lucide-react';
import { SavedAddress } from '../types';
import { useLanguage } from '../context/LanguageContext';

const MAX_ADDRESSES = 3;

interface AddressManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: SavedAddress[];
  onSave: (addresses: SavedAddress[]) => void;
}

export const AddressManagerModal: React.FC<AddressManagerModalProps> = ({
  isOpen,
  onClose,
  addresses,
  onSave,
}) => {
  const { t } = useLanguage();
  const [list, setList] = useState<SavedAddress[]>(() => [...(addresses || [])]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ label: '', address: '', coordinates: '' });

  const handleSetDefault = (id: string) => {
    setList((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const handleDelete = (id: string) => {
    setList((prev) => prev.filter((a) => a.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ label: '', address: '', coordinates: '' });
    }
    if (isAdding) setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setForm({ label: '', address: '', coordinates: '' });
  };

  const startEdit = (a: SavedAddress) => {
    setEditingId(a.id);
    setIsAdding(false);
    setForm({ label: a.label ?? '', address: a.address, coordinates: a.coordinates });
  };

  const cancelForm = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm({ label: '', address: '', coordinates: '' });
  };

  const saveForm = () => {
    const label = form.label.trim() || undefined;
    const address = form.address.trim();
    const coordinates = form.coordinates.trim();
    if (!address || !coordinates) return;

    if (editingId) {
      setList((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...a, label, address, coordinates }
            : a
        )
      );
      setEditingId(null);
    } else if (isAdding) {
      if (list.length >= MAX_ADDRESSES) return;
      const newOne: SavedAddress = {
        id: `addr_${Date.now()}`,
        label,
        address,
        coordinates,
        isDefault: list.length === 0,
      };
      setList((prev) => {
        const next = [...prev, newOne];
        return next;
      });
      setIsAdding(false);
    }
    setForm({ label: '', address: '', coordinates: '' });
  };

  const handleClose = () => {
    onSave(list);
    setList([...(addresses || [])]);
    setEditingId(null);
    setIsAdding(false);
    setForm({ label: '', address: '', coordinates: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-anbit-card border border-anbit-border rounded-2xl shadow-xl max-w-md w-full max-h-[85vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 lg:p-6 border-b border-anbit-border flex items-center justify-between">
            <h2 className="text-lg font-bold text-anbit-text tracking-tight">
              {t('manageAddresses')}
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-anbit-muted hover:text-anbit-text hover:bg-anbit-border transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 lg:p-6 overflow-y-auto flex-1 space-y-4">
            <p className="text-[10px] text-anbit-muted font-medium tracking-wide">
              {t('maxAddresses')}
            </p>

            {list.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-anbit-border bg-anbit-bg/50 p-4 space-y-2"
              >
                {editingId === a.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder={t('addressLabel')}
                      value={form.label}
                      onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-anbit-card border border-anbit-border text-anbit-text text-sm placeholder:text-anbit-muted outline-none focus:border-anbit-yellow"
                    />
                    <input
                      type="text"
                      placeholder={t('addressLine')}
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-anbit-card border border-anbit-border text-anbit-text text-sm placeholder:text-anbit-muted outline-none focus:border-anbit-yellow"
                    />
                    <input
                      type="text"
                      placeholder={t('coordinatesLabel')}
                      value={form.coordinates}
                      onChange={(e) => setForm((f) => ({ ...f, coordinates: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-anbit-card border border-anbit-border text-anbit-text text-sm font-mono placeholder:text-anbit-muted outline-none focus:border-anbit-yellow"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveForm}
                        className="flex-1 py-2 rounded-xl bg-anbit-yellow text-anbit-yellow-content font-semibold text-xs"
                      >
                        {t('saveAddress')}
                      </button>
                      <button
                        type="button"
                        onClick={cancelForm}
                        className="px-4 py-2 rounded-xl border border-anbit-border text-anbit-muted font-bold text-xs hover:text-anbit-text"
                      >
                        Ακύρωση
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-anbit-text text-sm truncate">
                          {a.label || a.address}
                        </p>
                        {a.label && (
                          <p className="text-xs text-anbit-muted truncate">{a.address}</p>
                        )}
                        <p className="text-[10px] text-anbit-muted font-mono mt-0.5">
                          {a.coordinates}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSetDefault(a.id)}
                          className={`p-2 rounded-lg transition-colors ${a.isDefault ? 'text-anbit-yellow' : 'text-anbit-muted hover:text-anbit-yellow'}`}
                          title={t('setDefault')}
                        >
                          <Star className={`w-4 h-4 ${a.isDefault ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(a)}
                          className="p-2 rounded-lg text-anbit-muted hover:text-anbit-text"
                        >
                          Επεξεργασία
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id)}
                          className="p-2 rounded-lg text-anbit-muted hover:text-red-400"
                          title={t('deleteAddress')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {isAdding && (
              <div className="rounded-xl border border-anbit-border bg-anbit-bg/50 p-4 space-y-3">
                <input
                  type="text"
                  placeholder={t('addressLabel')}
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-anbit-card border border-anbit-border text-anbit-text text-sm placeholder:text-anbit-muted outline-none focus:border-anbit-yellow"
                />
                <input
                  type="text"
                  placeholder={t('addressLine')}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-anbit-card border border-anbit-border text-anbit-text text-sm placeholder:text-anbit-muted outline-none focus:border-anbit-yellow"
                />
                <input
                  type="text"
                  placeholder={t('coordinatesLabel')}
                  value={form.coordinates}
                  onChange={(e) => setForm((f) => ({ ...f, coordinates: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-anbit-card border border-anbit-border text-anbit-text text-sm font-mono placeholder:text-anbit-muted outline-none focus:border-anbit-yellow"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveForm}
                    className="flex-1 py-2 rounded-xl bg-anbit-yellow text-anbit-yellow-content font-semibold text-xs"
                  >
                    {t('saveAddress')}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="px-4 py-2 rounded-xl border border-anbit-border text-anbit-muted font-bold text-xs"
                  >
                    Ακύρωση
                  </button>
                </div>
              </div>
            )}

            {!isAdding && list.length < MAX_ADDRESSES && (
              <button
                type="button"
                onClick={startAdd}
                className="w-full py-3 rounded-xl border-2 border-dashed border-anbit-border text-anbit-muted font-bold text-sm flex items-center justify-center gap-2 hover:border-anbit-yellow hover:text-anbit-yellow transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('addNewAddress')}
              </button>
            )}
          </div>

          <div className="p-4 lg:p-6 border-t border-anbit-border">
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-anbit-yellow text-anbit-yellow-content font-semibold text-sm"
            >
              Έτοιμο
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
