import { useState, useEffect } from 'react';
import { mockDashboardData } from '../mockData';
import type { Activity, Quest, Reward, Partner, LeaderboardEntry, Product } from '../types';
import { api, type ApiProduct, type ApiMerchantUser } from '../services/api';

export type DashboardFeed = {
  activities: Activity[];
  quests: Quest[];
  rewards: Reward[];
  partners: Partner[];
  leaderboard: LeaderboardEntry[];
};

export function useDashboardData(isAuthenticated: boolean): DashboardFeed & { fromDashboard: boolean } {
  const [feed, setFeed] = useState<DashboardFeed>({
    activities: mockDashboardData.activities,
    quests: mockDashboardData.quests,
    rewards: mockDashboardData.rewards,
    partners: mockDashboardData.partners,
    leaderboard: mockDashboardData.leaderboard,
  });
  const [fromDashboard, setFromDashboard] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const canReadMerchantsDirectory = (): boolean => {
      try {
        const raw = localStorage.getItem('anbit_user');
        if (!raw) return false;
        const parsed = JSON.parse(raw) as { roles?: unknown };
        const roles = Array.isArray(parsed.roles) ? parsed.roles.map((r) => String(r)) : [];
        // GET /Merchants is admin-protected in backend.
        return roles.includes('Admin');
      } catch {
        return false;
      }
    };

    const load = async () => {
      try {
        const [products, merchants] = await Promise.all([
          api.getProducts(),
          canReadMerchantsDirectory()
            ? api.getMerchantsDirectory().catch(() => [] as ApiMerchantUser[])
            : Promise.resolve([] as ApiMerchantUser[]),
        ]);
        if (cancelled) return;
        const partners = groupProductsByMerchant(products, merchants);
        setFeed((prev) => ({
          ...prev,
          partners,
        }));
        setFromDashboard(true);
      } catch (e) {
        console.error('Failed to load products from API, using mock partners.', e);
        if (!cancelled) setFromDashboard(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  return { ...feed, fromDashboard };
}

function groupProductsByMerchant(products: ApiProduct[], merchants: ApiMerchantUser[]): Partner[] {
  const map = new Map<string, Partner>();
  const merchantNameById = new Map<string, string>();
  for (const m of merchants) {
    merchantNameById.set(m.id.toLowerCase(), m.username);
  }

  for (const p of products) {
    const existing = map.get(p.merchantId);
    const menuItem: Product = {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      xpReward: p.xp,
      image:
        p.imageUrl ||
        'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: p.category ?? 'Menu',
    };
    if (!existing) {
      const partnerIndex = map.size + 1;
      const merchantName = merchantNameById.get(p.merchantId.toLowerCase());
      map.set(p.merchantId, {
        id: p.merchantId,
        name: merchantName || `Partner Store ${partnerIndex}`,
        category: 'burger',
        image: 'https://images.pexels.com/photos/323682/pexels-photo-323682.jpeg?auto=compress&cs=tinysrgb&w=400',
        location: 'Unknown',
        rating: 4.8,
        menu: [menuItem],
      });
    } else {
      existing.menu = [...(existing.menu ?? []), menuItem];
    }
  }
  return Array.from(map.values());
}
