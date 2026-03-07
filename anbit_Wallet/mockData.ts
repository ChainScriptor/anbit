
import { DashboardData, Product } from './types';

const generateMockMenu = (category: string): Product[] => {
  if (category === 'coffee') {
    return [
      { 
        id: 'c1', 
        name: 'Premium Espresso', 
        description: 'Double shot of our specialty roasted blend.', 
        price: 2.50, 
        xpReward: 10, 
        category: 'Coffee', 
        image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=400',
        ingredients: ['100% Arabica Beans', 'Filtered Water'],
        allergens: ['None']
      },
      { 
        id: 'c2', 
        name: 'Freddo Espresso', 
        description: 'Iced espresso with smooth crema.', 
        price: 3.50, 
        xpReward: 15, 
        category: 'Coffee', 
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=400',
        ingredients: ['Espresso Roast', 'Ice Cubes'],
        allergens: ['None']
      },
      { 
        id: 'c3', 
        name: 'Caramel Latte', 
        description: 'Smooth milk with a golden caramel hint.', 
        price: 4.20, 
        xpReward: 20, 
        category: 'Coffee', 
        image: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=400',
        ingredients: ['Espresso', 'Steamed Milk', 'Caramel Syrup'],
        allergens: ['Dairy']
      }
    ];
  }
  return [
    { 
      id: 'f1', 
      name: 'Classic Burger', 
      description: 'Triple beef, secret sauce, and smoked cheese.', 
      price: 9.50, 
      xpReward: 50, 
      category: 'Main', 
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400',
      ingredients: ['Grass-fed Beef', 'Cheddar Cheese', 'Brioche Bun', 'Anbit Sauce'],
      allergens: ['Gluten', 'Dairy', 'Mustard']
    }
  ];
};

export const mockDashboardData: DashboardData = {
  user: {
    id: "user_001",
    name: "STATHIS",
    email: "stathis@anbit.gr",
    avatar: "https://i.pravatar.cc/150?u=stathis",
    totalXP: 0,
    storeXP: {
      "p1": 450,
      "p2": 120,
      "p5": 85
    },
    currentLevel: 5,
    currentLevelName: "GOLD MEMBER",
    nextLevelXP: 2000,
    levelProgress: 62.5
  },
  activities: [
    {
      id: "act_001",
      type: "earn",
      partner: "THE COFFEE HUB",
      partnerId: "p1",
      xp: 50,
      timestamp: "2 ΩΡΕΣ ΠΡΙΝ",
      icon: "☕"
    }
  ],
  quests: [
    {
      id: "quest_001",
      title: "20% Έκπτωση σε όλους τους καφέδες",
      description: "Αγόρασε 3 καφέδες αυτή την εβδομάδα και κέρδισε extra πόντους.",
      progress: 2,
      total: 3,
      reward: 150,
      expiresIn: "3",
      icon: "☕",
      weather: "sun",
      storeName: "THE COFFEE HUB",
      storeImage: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200",
      multiplier: 2
    },
    {
      id: "quest_002",
      title: "Προσφορά βροχερής μέρας",
      description: "Παράγγειλε σε βροχερή μέρα και κέρδισε +20% πόντους.",
      progress: 0,
      total: 1,
      reward: 80,
      expiresIn: "7",
      icon: "🌧️",
      weather: "rain",
      storeName: "Anbit Partners",
      storeImage: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=200"
    },
    {
      id: "quest_003",
      title: "Βραδινές αμοιβές",
      description: "Επίσκεψου μετά τη δουλειά και κέρδισε bonus XP.",
      progress: 1,
      total: 2,
      reward: 100,
      expiresIn: "5",
      icon: "🌙",
      weather: "moon",
      storeName: "MEAT THE KING",
      storeImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=200"
    },
    {
      id: "quest_004",
      title: "Δωρεάν μεταφορά πάνω από 15€",
      description: "Παράγγειλε πάνω από 15€ και κέρδισε δωρεάν delivery.",
      progress: 0,
      total: 1,
      reward: 50,
      expiresIn: "2",
      icon: "🛵",
      storeName: "BLUE CUP",
      storeImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=200"
    },
    {
      id: "quest_005",
      title: "Combo μεσημεριανό",
      description: "Ειδικό combo μεσημεριανό με ποτό και επιδόρπιο.",
      progress: 1,
      total: 1,
      reward: 120,
      expiresIn: "4",
      icon: "🍽️",
      storeName: "Gourmet Delights",
      storeImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=200",
      multiplier: 2
    },
    {
      id: "quest_006",
      title: "Νέο μέλος δικτύου",
      description: "Επίσκεψου 3 διαφορετικά καταστήματα αυτό το μήνα.",
      progress: 2,
      total: 3,
      reward: 200,
      expiresIn: "12",
      icon: "🗺️",
      weather: "partly-cloudy",
      storeName: "Anbit Network",
      storeImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=200"
    }
  ],
  rewards: [
    {
      id: "reward_001",
      partner: "THE COFFEE HUB",
      partnerId: "p1",
      title: "ΔΩΡΕΑΝ ESPRESSO",
      xpCost: 70,
      status: "available",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "reward_002",
      partner: "MEAT THE KING",
      partnerId: "p2",
      title: "ΔΩΡΕΑΝ BURGER",
      xpCost: 150,
      status: "locked",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400"
    }
  ],
  partners: [
    {
      id: "p1",
      name: "THE COFFEE HUB",
      category: "coffee",
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600",
      bonusXp: 25,
      location: "ΤΣΙΜΙΣΚΗ 45",
      rating: 4.8,
      reviewCount: 2126,
      deliveryTime: "55' - 60'",
      minOrder: "7,00€",
      menu: generateMockMenu('coffee')
    },
    {
      id: "p2",
      name: "MEAT THE KING",
      category: "burger",
      image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=600",
      bonusXp: 50,
      location: "ΠΛΑΤΕΙΑ ΑΡΙΣΤΟΤΕΛΟΥΣ",
      rating: 4.9,
      reviewCount: 1842,
      deliveryTime: "40' - 50'",
      minOrder: "9,00€",
      menu: generateMockMenu('burger')
    },
    {
      id: "p3",
      name: "ZEN SPA & FITNESS",
      category: "healthy",
      image: "https://images.unsplash.com/photo-1544161515-450a91adbd05?auto=format&fit=crop&q=80&w=600",
      location: "ΛΕΩΦΟΡΟΣ ΝΙΚΗΣ",
      rating: 4.7,
      reviewCount: 318,
      deliveryTime: "—",
      minOrder: "—",
      menu: generateMockMenu('healthy')
    },
    {
      id: "p4",
      name: "TECH REPAIR PRO",
      category: "cooked",
      image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=600",
      bonusXp: 15,
      location: "ΕΓΝΑΤΙΑ 112",
      rating: 4.5,
      reviewCount: 89,
      deliveryTime: "—",
      minOrder: "—",
      menu: generateMockMenu('cooked')
    },
    {
      id: "p5",
      name: "BLUE CUP",
      category: "coffee",
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600",
      bonusXp: 30,
      location: "ΛΑΔΑΔΙΚΑ",
      rating: 4.9,
      reviewCount: 520,
      deliveryTime: "30' - 35'",
      minOrder: "5,00€",
      menu: generateMockMenu('coffee')
    },
    {
      id: "p6",
      name: "Ο ΓΥΡΟΣ ΤΗΣ ΑΡΙΣΤΟΤΕΛΟΥΣ",
      category: "souvlaki",
      image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&q=80&w=600",
      bonusXp: 20,
      location: "ΑΡΙΣΤΟΤΕΛΟΥΣ 12",
      rating: 4.7,
      reviewCount: 890,
      deliveryTime: "25' - 35'",
      minOrder: "6,00€",
      menu: generateMockMenu('burger')
    },
    {
      id: "p7",
      name: "GOODY'S BURGER HOUSE",
      category: "burger",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600",
      bonusXp: 35,
      location: "ΕΘΝΙΚΗΣ ΑΜΥΝΗΣ 45",
      rating: 4.6,
      reviewCount: 2100,
      deliveryTime: "35' - 45'",
      minOrder: "8,00€",
      menu: generateMockMenu('burger')
    },
    {
      id: "p8",
      name: "SUSHI MASTER",
      category: "asian",
      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600",
      location: "ΜΙΤΡΟΠΟΛΕΩΣ 8",
      rating: 4.9,
      reviewCount: 456,
      deliveryTime: "40' - 55'",
      minOrder: "12,00€",
      menu: generateMockMenu('burger')
    },
    {
      id: "p9",
      name: "CAFFÈ ROMA",
      category: "coffee",
      image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=600",
      bonusXp: 25,
      location: "ΤΣΙΜΙΣΚΗ 78",
      rating: 4.8,
      reviewCount: 634,
      deliveryTime: "20' - 30'",
      minOrder: "4,00€",
      menu: generateMockMenu('coffee')
    },
    {
      id: "p10",
      name: "PIZZA EXPRESS",
      category: "pizza",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600",
      bonusXp: 40,
      location: "ΕΓΝΑΤΙΑ 56",
      rating: 4.5,
      reviewCount: 1200,
      deliveryTime: "30' - 40'",
      minOrder: "10,00€",
      menu: generateMockMenu('burger')
    },
    {
      id: "p11",
      name: "SWEET DREAMS",
      category: "sweets",
      image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=600",
      location: "ΠΛ. ΝΑΥΑΡΙΝΟΥ 3",
      rating: 4.9,
      reviewCount: 312,
      deliveryTime: "25' - 35'",
      minOrder: "7,00€",
      menu: generateMockMenu('burger')
    },
    {
      id: "p12",
      name: "FRESH JUICE BAR",
      category: "healthy",
      image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=600",
      bonusXp: 15,
      location: "ΛΕΩΦ. ΣΤΡΑΤΟΥ 22",
      rating: 4.6,
      reviewCount: 198,
      deliveryTime: "15' - 25'",
      minOrder: "5,00€",
      menu: generateMockMenu('healthy')
    },
    {
      id: "p13",
      name: "TAVERNA OLYMPUS",
      category: "cooked",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600",
      bonusXp: 30,
      location: "ΑΓ. ΣΟΦΙΑΣ 15",
      rating: 4.7,
      reviewCount: 567,
      deliveryTime: "45' - 60'",
      minOrder: "15,00€",
      menu: generateMockMenu('burger')
    },
    {
      id: "p14",
      name: "MORNING GLORY",
      category: "coffee",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
      bonusXp: 20,
      location: "ΒΕΝΙΖΕΛΟΥ 90",
      rating: 4.8,
      reviewCount: 423,
      deliveryTime: "25' - 35'",
      minOrder: "6,00€",
      menu: generateMockMenu('coffee')
    },
    {
      id: "p15",
      name: "BURGER STATION",
      category: "burger",
      image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&q=80&w=600",
      bonusXp: 45,
      location: "ΠΑΝΕΠΙΣΤΗΜΙΟΥ 34",
      rating: 4.4,
      reviewCount: 876,
      deliveryTime: "20' - 30'",
      minOrder: "7,00€",
      menu: generateMockMenu('burger')
    },
    {
      id: "p16",
      name: "YOGA & SMOOTHIE",
      category: "healthy",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600",
      location: "ΚΑΣΣΑΝΔΡΟΥ 7",
      rating: 4.9,
      reviewCount: 234,
      deliveryTime: "—",
      minOrder: "—",
      menu: generateMockMenu('healthy')
    },
    {
      id: "p17",
      name: "BAKERY CENTRAL",
      category: "bougatsa",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600",
      bonusXp: 18,
      location: "ΜΑΡΤΎΡΩΝ 12",
      rating: 4.8,
      reviewCount: 701,
      deliveryTime: "30' - 40'",
      minOrder: "5,00€",
      menu: generateMockMenu('burger')
    },
    {
      id: "p18",
      name: "QUICK FIX PHONE",
      category: "cooked",
      image: "https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&q=80&w=600",
      bonusXp: 10,
      location: "ΜΑΚΕΔΟΝΟΜΑΧΩΝ 5",
      rating: 4.5,
      reviewCount: 145,
      deliveryTime: "—",
      minOrder: "—",
      menu: generateMockMenu('cooked')
    },
    {
      id: "p19",
      name: "GREEK FLAVOURS",
      category: "italian",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600",
      bonusXp: 28,
      location: "ΔΙΚΗΓΟΥΡΟΥ 18",
      rating: 4.7,
      reviewCount: 534,
      deliveryTime: "35' - 50'",
      minOrder: "9,00€",
      menu: generateMockMenu('burger')
    },
    {
      id: "p20",
      name: "ESPRESSO LAB",
      category: "coffee",
      image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=600",
      bonusXp: 35,
      location: "ΦΡΑΓΚΟΥΛΗ 2",
      rating: 4.9,
      reviewCount: 389,
      deliveryTime: "15' - 25'",
      minOrder: "3,50€",
      menu: generateMockMenu('coffee')
    }
  ],
  leaderboard: [
    { rank: 1, name: "ΔΗΜΗΤΡΗΣ", level: 12, xp: 5420 },
    { rank: 2, name: "ΜΑΡΙΑ", level: 10, xp: 4890 },
    { rank: 3, name: "ΝΙΚΟΣ", level: 9, xp: 4120 },
    { rank: 4, name: "ΕΛΕΝΗ", level: 8, xp: 3750 },
    { rank: 5, name: "STATHIS", level: 5, xp: 1250, isCurrentUser: true }
  ]
};
