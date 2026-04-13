import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Quest, Partner } from '../types';
import { PLACEHOLDER_CATEGORY_IDS } from './questCategoryStrip';
import { cn } from '@/lib/utils';
import { NetworkStoreCard } from './NetworkStoreCard';

export type QuickCategoryStoreEntry = {
  key: string;
  name: string;
  image: string;
  location: string;
  partnerId?: string;
  questCount: number;
};

function resolveQuestPartner(quest: Quest, partners: Partner[]): Partner | undefined {
  if (quest.partnerId) return partners.find((p) => p.id === quest.partnerId);
  if (quest.storeName) return partners.find((p) => p.name === quest.storeName);
  return undefined;
}

function questMatchesPartnerCategory(quest: Quest, partners: Partner[], categoryId: string): boolean {
  if (categoryId === 'All') return true;
  if (PLACEHOLDER_CATEGORY_IDS.has(categoryId)) return true;
  const p = resolveQuestPartner(quest, partners);
  if (!p) return false;
  return p.category === categoryId;
}

/** Μοναδικά καταστήματα (από quests) ανά quick category `categoryId`. */
export function buildQuickCategoryStoreEntries(
  quests: Quest[],
  partners: Partner[],
  categoryId: string,
): QuickCategoryStoreEntry[] {
  const matched = quests.filter((q) => questMatchesPartnerCategory(q, partners, categoryId));
  const map = new Map<string, QuickCategoryStoreEntry>();
  for (const q of matched) {
    const p = resolveQuestPartner(q, partners);
    const key = p?.id ?? `name:${q.storeName ?? q.id}`;
    const existing = map.get(key);
    if (existing) {
      existing.questCount += 1;
    } else {
      map.set(key, {
        key,
        name: p?.name ?? q.storeName ?? 'Κατάστημα',
        image: p?.image ?? q.storeImage ?? '',
        location: p?.location ?? '—',
        partnerId: p?.id,
        questCount: 1,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'el'));
}

type QuickCategoryStoresModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categoryLabel: string;
  partners: Partner[];
  storeXP: Record<string, number>;
  onOpenPartner: (partner: Partner) => void;
};

export const QuickCategoryStoresModal: React.FC<QuickCategoryStoresModalProps> = ({
  isOpen,
  onClose,
  categoryLabel,
  partners,
  storeXP,
  onOpenPartner,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-stores-modal-title"
            className={cn(
              'flex max-h-[min(88dvh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-zinc-800/80 bg-[#111] shadow-2xl sm:rounded-2xl',
            )}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-800/80 px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h2 id="quick-stores-modal-title" className="truncate text-base font-bold text-white sm:text-lg">
                  Καταστήματα
                </h2>
                <p className="truncate text-xs text-zinc-400 sm:text-sm">{categoryLabel}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-700/80 text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-800/80 hover:text-white"
                aria-label="Κλείσιμο"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4">
              {partners.length === 0 ? (
                <p className="py-10 text-center text-sm text-zinc-500">Δεν υπάρχουν καταστήματα για αυτή την κατηγορία.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {partners.map((partner) => (
                    <div key={partner.id} className="min-w-0">
                      <NetworkStoreCard
                        partner={partner}
                        xp={storeXP[partner.id] ?? 0}
                        onOpen={() => {
                          onOpenPartner(partner);
                          onClose();
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
