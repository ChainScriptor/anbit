import { useState, useEffect } from 'react';
import { mockDashboardData } from '../mockData';
import { DASHBOARD_URL } from '../constants';
import type { Activity, Quest, Reward, Partner, LeaderboardEntry } from '../types';

export type DashboardFeed = {
  activities: Activity[];
  quests: Quest[];
  rewards: Reward[];
  partners: Partner[];
  leaderboard: LeaderboardEntry[];
};

const WALLET_DATA_URL = `${DASHBOARD_URL.replace(/\/$/, '')}/wallet-data.json`;

export function useDashboardData(): DashboardFeed & { fromDashboard: boolean } {
  const [feed, setFeed] = useState<DashboardFeed>({
    activities: mockDashboardData.activities,
    quests: mockDashboardData.quests,
    rewards: mockDashboardData.rewards,
    partners: mockDashboardData.partners,
    leaderboard: mockDashboardData.leaderboard,
  });
  const [fromDashboard, setFromDashboard] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(WALLET_DATA_URL, { method: 'GET' })
      .then((res) => {
        if (!res.ok) throw new Error('Not ok');
        return res.json();
      })
      .then((data: DashboardFeed) => {
        if (cancelled) return;
        if (
          Array.isArray(data.activities) &&
          Array.isArray(data.quests) &&
          Array.isArray(data.rewards) &&
          Array.isArray(data.partners) &&
          Array.isArray(data.leaderboard)
        ) {
          // Enrich quests with storeName/storeImage from mockData (by id or index) so offers always show store name and image
          const mockQuests = mockDashboardData.quests;
          const quests: Quest[] = data.quests.map((q, i) => {
            const mock = mockQuests.find((m) => m.id === q.id) ?? mockQuests[i];
            return {
              ...q,
              storeName: q.storeName ?? mock?.storeName,
              storeImage: q.storeImage ?? mock?.storeImage,
              multiplier: q.multiplier ?? mock?.multiplier,
            };
          });
          setFeed({
            activities: data.activities,
            quests,
            rewards: data.rewards,
            partners: data.partners,
            leaderboard: data.leaderboard,
          });
          setFromDashboard(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFromDashboard(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ...feed, fromDashboard };
}
