import type { Partner, Quest } from '../types';

/** Quest-δομή για `QuestOfferCard` με `networkStoreCard` — ίδιο με `/network`. */
export function partnerToNetworkDisplayQuest(partner: Partner, earnedXp: number): Quest {
  const reward = earnedXp > 0 ? earnedXp : Math.round(partner.bonusXp ?? 0);
  const descParts = [partner.location, partner.deliveryTime].filter(Boolean) as string[];
  return {
    id: `nw-${partner.id}`,
    title: partner.name,
    description: descParts.length > 0 ? descParts.join(' · ') : (partner.location ?? 'Anbit partner'),
    progress: 0,
    total: 1,
    reward,
    expiresIn: '30',
    icon: '🏪',
    bannerImage: partner.image,
    partnerId: partner.id,
    storeName: partner.name,
    storeImage: partner.image,
  };
}
