
export interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: string[]; // Backend roles: e.g. ["User"], ["Admin"], ["Merchant"]
  totalXP: number; // Global XP (Coming Soon)
  storeXP: Record<string, number>; // Points per store: { "p1": 500, "p2": 150 }
  currentLevel: number;
  currentLevelName: string;
  nextLevelXP: number;
  levelProgress: number;
  /** Display address for delivery / map (legacy single) */
  address?: string;
  /** Coordinates for map pin (legacy) */
  coordinates?: string;
  /** Up to 3 saved addresses; first or isDefault is primary */
  addresses?: SavedAddress[];
}

export interface SavedAddress {
  id: string;
  label?: string;
  address: string;
  coordinates: string;
  isDefault?: boolean;
}

export interface Activity {
  id: string;
  type: 'earn' | 'redeem' | 'quest';
  partner?: string;
  partnerId?: string;
  xp: number;
  timestamp: string;
  icon: string;
  reward?: string;
  title?: string;
}

/** Weather type for animated icon in offers/quests */
export type QuestWeather =
  | "sun"
  | "moon"
  | "cloud"
  | "partly-cloudy"
  | "rain"
  | "heavy-rain"
  | "snow"
  | "thunder"
  | "wind"
  | "fog"
  | "sunrise"
  | "rainbow";

export interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  reward: number;
  expiresIn: string;
  icon: string;
  /** Optional weather for animated weather icon */
  weather?: QuestWeather;
  /** Optional store/partner name for offer card */
  storeName?: string;
  /** Optional store profile/logo image URL */
  storeImage?: string;
  /** Wide hero image for offer cards (quests) */
  bannerImage?: string;
  /** Optional 2x XP multiplier label */
  multiplier?: number;
  /** Links offer to dashboard partner for grouping / filters */
  partnerId?: string;
}

export interface Reward {
  id: string;
  partner: string;
  partnerId: string; // Linked to a specific partner
  title: string;
  xpCost: number;
  status: 'available' | 'locked';
  image: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  xpReward: number;
  image: string;
  category: string;
  ingredients?: string[];
  allergens?: string[];
}

/** Επιλογές προϊόντος πριν την προσθήκη στο καλάθι (π.χ. ζάχαρη για καφέ) */
export interface ProductCartOptions {
  sugarAmount?: string;
  sugarType?: string;
  [key: string]: string | undefined;
}

/** Στοιχείο καλαθιού με ποσότητα, επιλογές και προαιρετικά σχόλια */
export interface CartItemData extends Product {
  quantity: number;
  options?: ProductCartOptions;
  comments?: string;
}

export type PartnerCategory =
  | 'street_food' | 'sandwiches' | 'brunch' | 'coffee' | 'bar' | 'burger' | 'sweets' | 'bbq' | 'breakfast'
  | 'italian' | 'asian' | 'pizza' | 'crepe' | 'healthy' | 'pasta' | 'bougatsa' | 'salads' | 'souvlaki' | 'cooked';

export interface Partner {
  id: string;
  name: string;
  category: PartnerCategory;
  image: string;
  bonusXp?: number;
  location: string;
  rating: number;
  reviewCount?: number;
  deliveryTime?: string;
  minOrder?: string;
  menu?: Product[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

export interface DashboardData {
  user: UserData;
  activities: Activity[];
  quests: Quest[];
  rewards: Reward[];
  leaderboard: LeaderboardEntry[];
  partners: Partner[];
}
