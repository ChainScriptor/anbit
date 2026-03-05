
import { Order, Booking, Product, Quest, Customer } from './types';

/** URL της εφαρμογής Anbit Wallet (πελάτες). Ορίζεται με VITE_WALLET_URL στο .env */
export const WALLET_URL = import.meta.env.VITE_WALLET_URL || 'http://localhost:3000';

export const REVENUE_HISTORY = [
  { time: '08:00', amount: 120 },
  { time: '10:00', amount: 450 },
  { time: '12:00', amount: 890 },
  { time: '14:00', amount: 1200 },
  { time: '16:00', amount: 1100 },
  { time: '18:00', amount: 1550 },
  { time: '20:00', amount: 1980 },
  { time: '22:00', amount: 2100 },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'TX-9021',
    tableNumber: '5',
    customerName: 'Δημήτρης Βαρσός',
    items: [
      { name: 'Burgers', qty: 2, price: 8.0, points: 10, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=100&h=100' },
      { name: 'Beer', qty: 1, price: 5.0, points: 5, image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=100&h=100' }
    ],
    status: 'pending',
    totalPrice: 21.0,
    totalPoints: 25,
    timestamp: new Date().toISOString()
  },
  {
    id: 'TX-9022',
    tableNumber: '3',
    customerName: 'Μαρία Παπαδοπούλου',
    items: [
      { name: 'Flat White', qty: 2, price: 4.2, points: 5, image: 'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&q=80&w=100&h=100' },
      { name: 'Croissant', qty: 1, price: 3.5, points: 5, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=100&h=100' }
    ],
    status: 'pending',
    totalPrice: 11.9,
    totalPoints: 15,
    timestamp: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: 'TX-9020',
    tableNumber: '8',
    customerName: 'Νίκος Κωνσταντίνου',
    items: [
      { name: 'Cyber Burger', qty: 1, price: 12.5, points: 25, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=100&h=100' },
      { name: 'Craft IPA', qty: 2, price: 6.0, points: 10, image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=100&h=100' }
    ],
    status: 'completed',
    totalPrice: 24.5,
    totalPoints: 45,
    timestamp: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 'TX-9019',
    tableNumber: '2',
    customerName: 'Ελένη Γεωργίου',
    items: [
      { name: 'Freddo Espresso', qty: 1, price: 3.5, points: 8, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=100&h=100' },
      { name: 'Chocolate Cake', qty: 1, price: 5.5, points: 12, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=100&h=100' }
    ],
    status: 'completed',
    totalPrice: 9.0,
    totalPoints: 20,
    timestamp: new Date(Date.now() - 90 * 60000).toISOString()
  },
  {
    id: 'TX-9018',
    tableNumber: '12',
    customerName: 'Γιάννης Αντωνίου',
    items: [
      { name: 'Burgers', qty: 3, price: 8.0, points: 10, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=100&h=100' },
      { name: 'Beer', qty: 3, price: 5.0, points: 5, image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=100&h=100' }
    ],
    status: 'completed',
    totalPrice: 39.0,
    totalPoints: 45,
    timestamp: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    id: 'TX-9017',
    tableNumber: '1',
    customerName: 'Κατερίνα Μήτσου',
    items: [
      { name: 'Flat White', qty: 1, price: 4.2, points: 5, image: 'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&q=80&w=100&h=100' }
    ],
    status: 'cancelled',
    totalPrice: 4.2,
    totalPoints: 5,
    timestamp: new Date(Date.now() - 180 * 60000).toISOString()
  },
  {
    id: 'TX-9016',
    tableNumber: '7',
    customerName: 'Στέφανος Δημητρίου',
    items: [
      { name: 'Cyber Burger', qty: 2, price: 12.5, points: 25, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=100&h=100' },
      { name: 'Cheese Fries', qty: 2, price: 4.5, points: 8, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=100&h=100' }
    ],
    status: 'completed',
    totalPrice: 34.0,
    totalPoints: 66,
    timestamp: new Date(Date.now() - 200 * 60000).toISOString()
  },
  {
    id: 'TX-9015',
    tableNumber: '4',
    customerName: 'Αννα Φωτιάδου',
    items: [
      { name: 'Caramel Latte', qty: 1, price: 4.2, points: 10, image: 'https://images.unsplash.com/photo-1536939459926-301728717817?auto=format&fit=crop&q=80&w=100&h=100' },
      { name: 'Croissant', qty: 2, price: 3.5, points: 5, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=100&h=100' }
    ],
    status: 'pending',
    totalPrice: 11.2,
    totalPoints: 20,
    timestamp: new Date(Date.now() - 5 * 60000).toISOString()
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  { id: 'BK-001', customerName: 'Μαρία Β.', squadSize: 4, missionType: 'Φαγητό', time: '14:30', status: 'upcoming' },
  { id: 'BK-002', customerName: 'Νίκος Κ.', squadSize: 2, missionType: 'Καφές', time: '15:15', status: 'upcoming' },
  { id: 'BK-003', customerName: 'Δημήτρης Βαρσός', squadSize: 6, missionType: 'Φαγητό', time: '19:00', status: 'upcoming' },
  { id: 'BK-004', customerName: 'Ελένη Γεωργίου', squadSize: 2, missionType: 'Καφές', time: '10:30', status: 'upcoming' },
  { id: 'BK-005', customerName: 'Γιάννης Αντωνίου', squadSize: 8, missionType: 'Κοινωνικό', time: '20:30', status: 'upcoming' },
  { id: 'BK-006', customerName: 'Κατερίνα Μήτσου', squadSize: 3, missionType: 'Εργασία', time: '09:00', status: 'upcoming' },
  { id: 'BK-007', customerName: 'Στέφανος Δημητρίου', squadSize: 4, missionType: 'Φαγητό', time: '13:00', status: 'arrived' },
  { id: 'BK-008', customerName: 'Αννα Φωτιάδου', squadSize: 2, missionType: 'Καφές', time: '11:45', status: 'completed' },
  { id: 'BK-009', customerName: 'Παύλος Νικολάου', squadSize: 5, missionType: 'Φαγητό', time: '18:00', status: 'completed' },
  { id: 'BK-010', customerName: 'Χριστίνα Λαμπρή', squadSize: 2, missionType: 'Καφές', time: '16:00', status: 'no-show' }
];

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 'P-1', 
    name: 'Flat White', 
    category: 'Καφέδες', 
    price: 4.2, 
    pointsReward: 5, 
    image: 'https://images.unsplash.com/photo-1510972527921-ce03766a1cf1?auto=format&fit=crop&q=80&w=400&h=400', 
    isActive: true,
    allergens: ['Γάλα'],
    stats: [
      { label: 'Caffeine', value: 80 },
      { label: 'Aroma', value: 95 }
    ]
  },
  { 
    id: 'P-2', 
    name: 'Cyber Burger', 
    category: 'Φαγητό', 
    price: 12.5, 
    pointsReward: 25, 
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=400&h=400', 
    isActive: true,
    allergens: ['Γλουτένη', 'Αυγό'],
    stats: [
      { label: 'Energy', value: 90 },
      { label: 'Protein', value: 75 }
    ]
  },
  { 
    id: 'P-3', 
    name: 'Craft IPA', 
    category: 'Ποτά', 
    price: 6.0, 
    pointsReward: 10, 
    image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&q=80&w=400&h=400', 
    isActive: true,
    allergens: ['Γλουτένη'],
    stats: [
      { label: 'Alcohol', value: 65 },
      { label: 'Bitterness', value: 85 }
    ]
  }
];

export const INITIAL_QUESTS: Quest[] = [
  { id: 'Q-1', title: 'Πρωινή Προσφορά', description: '2x Πόντοι σε όλους τους Espresso 16:00 - 18:00', multiplier: 2, startTime: '2024-05-20T16:00:00Z', endTime: '2024-05-20T18:00:00Z', isActive: true, type: 'Προσφορά' }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'C-001',
    name: 'Δημήτρης Βαρσός',
    email: 'd.varsos@email.com',
    loyaltyPoints: 1250,
    totalSpent: 450.50,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dimitris',
    preferredItems: ['Burgers', 'Draft Beer', 'Cold Brew'],
    visitFrequency: 'Μεσημέρι',
    lastVisit: 'Σήμερα, 14:20',
    totalOrders: 156,
    reviews: [
      { id: 'R-1', rating: 5, comment: 'Εξαιρετικό σέρβις και ποιότητα!', date: '2024-05-15' }
    ],
    transactions: [
      {
        id: 'T-101',
        date: '2024-05-20',
        time: '14:20',
        items: [{ name: 'Legendary Burger', qty: 1, price: 12.0 }, { name: 'Craft Beer', qty: 2, price: 6.5 }],
        totalSpent: 25.0,
        pointsEarned: 50
      }
    ]
  },
  {
    id: 'C-002',
    name: 'Μαρία Παπαδοπούλου',
    email: 'm.papadopoulou@email.com',
    loyaltyPoints: 890,
    totalSpent: 320.00,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    preferredItems: ['Flat White', 'Croissant', 'Freddo'],
    visitFrequency: 'Πρωί',
    lastVisit: 'Σήμερα, 11:00',
    totalOrders: 72,
    reviews: [
      { id: 'R-2', rating: 5, comment: 'Ο αγαπημένος μου καφές!', date: '2024-05-18' }
    ],
    transactions: [
      {
        id: 'T-102',
        date: '2024-05-20',
        time: '11:00',
        items: [{ name: 'Flat White', qty: 2, price: 4.2 }, { name: 'Croissant', qty: 1, price: 3.5 }],
        totalSpent: 11.9,
        pointsEarned: 15
      }
    ]
  },
  {
    id: 'C-003',
    name: 'Νίκος Κωνσταντίνου',
    email: 'n.konstantinou@email.com',
    loyaltyPoints: 2100,
    totalSpent: 780.20,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nikos',
    preferredItems: ['Cyber Burger', 'Craft IPA', 'Cheese Fries'],
    visitFrequency: 'Βράδυ',
    lastVisit: 'Χθες, 20:15',
    totalOrders: 203,
    reviews: [
      { id: 'R-3', rating: 4, comment: 'Πολύ καλό φαγητό, λίγη αναμονή το Σαββατοκύριακο.', date: '2024-05-12' }
    ],
    transactions: [
      {
        id: 'T-103',
        date: '2024-05-19',
        time: '20:15',
        items: [{ name: 'Cyber Burger', qty: 1, price: 12.5 }, { name: 'Craft IPA', qty: 2, price: 6.0 }],
        totalSpent: 24.5,
        pointsEarned: 45
      }
    ]
  },
  {
    id: 'C-004',
    name: 'Ελένη Γεωργίου',
    email: 'e.georgiou@email.com',
    loyaltyPoints: 540,
    totalSpent: 195.80,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eleni',
    preferredItems: ['Freddo Espresso', 'Chocolate Cake', 'Caramel Latte'],
    visitFrequency: 'Μεσημέρι',
    lastVisit: 'Χθες, 15:30',
    totalOrders: 41,
    reviews: [
      { id: 'R-4', rating: 5, comment: 'Τέλεια γλυκά και καφέδες.', date: '2024-05-10' }
    ],
    transactions: [
      {
        id: 'T-104',
        date: '2024-05-19',
        time: '15:30',
        items: [{ name: 'Freddo Espresso', qty: 1, price: 3.5 }, { name: 'Chocolate Cake', qty: 1, price: 5.5 }],
        totalSpent: 9.0,
        pointsEarned: 20
      }
    ]
  },
  {
    id: 'C-005',
    name: 'Γιάννης Αντωνίου',
    email: 'g.antoniou@email.com',
    loyaltyPoints: 3200,
    totalSpent: 1200.00,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Giannis',
    preferredItems: ['Burgers', 'Beer', 'Wings'],
    visitFrequency: 'Βράδυ',
    lastVisit: '2 ημέρες πριν',
    totalOrders: 312,
    reviews: [
      { id: 'R-5', rating: 5, comment: 'Καλύτερο burger στη Θεσσαλονίκη!', date: '2024-05-01' }
    ],
    transactions: [
      {
        id: 'T-105',
        date: '2024-05-18',
        time: '21:00',
        items: [{ name: 'Burgers', qty: 3, price: 8.0 }, { name: 'Beer', qty: 3, price: 5.0 }],
        totalSpent: 39.0,
        pointsEarned: 45
      }
    ]
  },
  {
    id: 'C-006',
    name: 'Κατερίνα Μήτσου',
    email: 'k.mitsou@email.com',
    loyaltyPoints: 320,
    totalSpent: 118.50,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Katerina',
    preferredItems: ['Flat White', 'Espresso'],
    visitFrequency: 'Πρωί',
    lastVisit: '3 ημέρες πριν',
    totalOrders: 28,
    reviews: [],
    transactions: [
      {
        id: 'T-106',
        date: '2024-05-17',
        time: '09:15',
        items: [{ name: 'Flat White', qty: 1, price: 4.2 }],
        totalSpent: 4.2,
        pointsEarned: 5
      }
    ]
  },
  {
    id: 'C-007',
    name: 'Στέφανος Δημητρίου',
    email: 's.dimitriou@email.com',
    loyaltyPoints: 1680,
    totalSpent: 620.40,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Stefanos',
    preferredItems: ['Cyber Burger', 'Cheese Fries', 'Craft IPA'],
    visitFrequency: 'Μεσημέρι',
    lastVisit: 'Σήμερα, 13:00',
    totalOrders: 98,
    reviews: [
      { id: 'R-6', rating: 4, comment: 'Συνεπείς ποιότητα.', date: '2024-05-14' }
    ],
    transactions: [
      {
        id: 'T-107',
        date: '2024-05-20',
        time: '13:00',
        items: [{ name: 'Cyber Burger', qty: 2, price: 12.5 }, { name: 'Cheese Fries', qty: 2, price: 4.5 }],
        totalSpent: 34.0,
        pointsEarned: 66
      }
    ]
  },
  {
    id: 'C-008',
    name: 'Αννα Φωτιάδου',
    email: 'a.fotiadow@email.com',
    loyaltyPoints: 450,
    totalSpent: 165.00,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    preferredItems: ['Caramel Latte', 'Croissant', 'Cake'],
    visitFrequency: 'Πρωί',
    lastVisit: 'Σήμερα, 10:45',
    totalOrders: 35,
    reviews: [
      { id: 'R-7', rating: 5, comment: 'Όμορφο μέρος και νόστιμα γλυκά.', date: '2024-05-16' }
    ],
    transactions: [
      {
        id: 'T-108',
        date: '2024-05-20',
        time: '10:45',
        items: [{ name: 'Caramel Latte', qty: 1, price: 4.2 }, { name: 'Croissant', qty: 2, price: 3.5 }],
        totalSpent: 11.2,
        pointsEarned: 20
      }
    ]
  },
  {
    id: 'C-009',
    name: 'Παύλος Νικολάου',
    email: 'p.nikolaou@email.com',
    loyaltyPoints: 980,
    totalSpent: 380.00,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pavlos',
    preferredItems: ['Burgers', 'Beer', 'Salad'],
    visitFrequency: 'Βράδυ',
    lastVisit: 'Χθες, 18:30',
    totalOrders: 67,
    reviews: [
      { id: 'R-8', rating: 4, comment: 'Καλή επιλογή για ομαδικές βραδιές.', date: '2024-05-08' }
    ],
    transactions: [
      {
        id: 'T-109',
        date: '2024-05-19',
        time: '18:30',
        items: [{ name: 'Cyber Burger', qty: 2, price: 12.5 }, { name: 'Craft IPA', qty: 4, price: 6.0 }],
        totalSpent: 49.0,
        pointsEarned: 90
      }
    ]
  },
  {
    id: 'C-010',
    name: 'Χριστίνα Λαμπρή',
    email: 'ch.lampri@email.com',
    loyaltyPoints: 210,
    totalSpent: 85.20,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christina',
    preferredItems: ['Freddo', 'Iced Latte'],
    visitFrequency: 'Μεσημέρι',
    lastVisit: '5 ημέρες πριν',
    totalOrders: 18,
    reviews: [],
    transactions: [
      {
        id: 'T-110',
        date: '2024-05-15',
        time: '16:00',
        items: [{ name: 'Freddo Espresso', qty: 2, price: 3.5 }],
        totalSpent: 7.0,
        pointsEarned: 16
      }
    ]
  }
];
