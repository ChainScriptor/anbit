import { useState, useEffect } from 'react';
import { mockDashboardData } from '../mockData';
import type { Activity, Quest, Reward, Partner, LeaderboardEntry, Product } from '../types';
import { api, type ApiProduct } from '../services/api';

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
    const load = async () => {
      try {
        const products = await api.getProducts();
        if (cancelled) return;
        const partners = groupProductsByMerchant(products);
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

function groupProductsByMerchant(products: ApiProduct[]): Partner[] {
  const map = new Map<string, Partner>();
  for (const p of products) {
    const existing = map.get(p.merchantId);
    const menuItem: Product = {
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      xpReward: p.xp,
      image: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=400',
      category: p.category ?? 'Menu',
    };
    if (!existing) {
      map.set(p.merchantId, {
        id: p.merchantId,
        name: `Store ${p.merchantId.slice(0, 6)}`,
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
