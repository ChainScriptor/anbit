
export type OrderStatus = 'pending' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
  points: number;
  image?: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
  totalPoints: number;
  timestamp: string;
}

export interface Booking {
  id: string;
  customerName: string;
  squadSize: number;
  missionType: 'Καφές' | 'Φαγητό' | 'Εργασία' | 'Κοινωνικό';
  time: string;
  status: 'upcoming' | 'arrived' | 'no-show' | 'completed';
}

export interface ProductStat {
  label: string;
  value: number; // 0-100
}

/** Option groups όπως επιστρέφονται από το API προϊόντος (camelCase). */
export interface ProductOptionGroupFromApi {
  id: string;
  name: string;
  type: 'Single' | 'Multiple';
  options: { id: string; name: string; price: number }[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  pointsReward: number;
  image: string;
  /** URL εικόνας από API (null αν δεν υπάρχει upload στο backend). */
  serverImageUrl?: string | null;
  isActive: boolean;
  allergens?: string[];
  stats?: ProductStat[];
  description?: string;
  /** Επιλογές προϊόντος από το backend (για επεξεργασία / PUT). */
  optionGroups?: ProductOptionGroupFromApi[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  multiplier: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  type: 'Happy Hour' | 'Weekend Special' | 'Προσφορά';
}

export interface CustomerReview {
  id: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  items: { name: string; qty: number; price: number }[];
  totalSpent: number;
  pointsEarned: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
  totalSpent: number;
  avatar: string;
  preferredItems: string[];
  visitFrequency: 'Πρωί' | 'Μεσημέρι' | 'Βράδυ';
  lastVisit: string;
  totalOrders: number;
  reviews: CustomerReview[];
  transactions: Transaction[];
}
