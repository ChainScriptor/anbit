
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'el';

interface Translations {
  [key: string]: {
    en: string;
    el: string;
  };
}

const translations: Translations = {
  // Navigation
  dashboard: { en: 'Home', el: 'Αρχική' },
  network: { en: 'Stores', el: 'Καταστήματα' },
  scanner: { en: 'Scan', el: 'Σάρωση' },
  quests: { en: 'Offers', el: 'Προσφορές' },
  vault: { en: 'Redeem', el: 'Εξαργύρωση' },
  settings: { en: 'Settings', el: 'Ρυθμίσεις' },
  logout: { en: 'Log Out', el: 'Αποσύνδεση' },
  profile: { en: 'Profile', el: 'Προφίλ' },
  storeDashboard: { en: 'Store Dashboard', el: 'Πίνακας ελέγχου' },

  // Dashboard Strings
  masterLegacy: { en: 'Maximize Your Rewards.', el: 'Κερδίστε περισσότερα.' },
  warriorNetwork: { en: 'Partner Network', el: 'Δίκτυο συνεργατών' },
  watchingProgress: { en: 'track your daily rewards.', el: 'Δείτε την προοδό σας.' },
  commandCenter: { en: 'Loyalty Hub', el: 'Κέντρο επιβράβευσης' },
  pointsEarned: { en: 'Points Earned', el: 'Πόντοι που κερδίθηκαν' },
  walletBalance: { en: 'Balance', el: 'Υπόλοιπο' },
  statusTier: { en: 'Member Tier', el: 'Βαθμίδα μέλους' },
  toNextLevel: { en: 'Next Tier', el: 'Επόμενη βαθμίδα' },
  liveLedger: { en: 'Recent Activity', el: 'Πρόσφατη δραστηριότητα' },
  yourAddress: { en: 'Your address', el: 'Η διεύθυνσή σου' },
  clickToExpand: { en: 'Click to expand', el: 'Πάτησε για ανάπτυξη' },
  manageAddresses: { en: 'Manage addresses', el: 'Διαχείριση διευθύνσεων' },
  addNewAddress: { en: 'Add address', el: 'Προσθήκη διεύθυνσης' },
  addressLabel: { en: 'Label (e.g. Home)', el: 'Ετικέτα (π.χ. Σπίτι)' },
  addressLine: { en: 'Address', el: 'Διεύθυνση' },
  coordinatesLabel: { en: 'Coordinates', el: 'Συντεταγμένες' },
  setDefault: { en: 'Set as default', el: 'Προεπιλογή' },
  deleteAddress: { en: 'Delete', el: 'Διαγραφή' },
  saveAddress: { en: 'Save', el: 'Αποθήκευση' },
  maxAddresses: { en: 'You can have up to 3 addresses.', el: 'Μπορείς να έχεις έως 3 διευθύνσεις.' },
  noAddresses: { en: 'Add an address to see it on the map.', el: 'Πρόσθεσε μια διεύθυνση για να εμφανιστεί στον χάρτη.' },
  viewHistory: { en: 'History', el: 'Ιστορικό' },
  hallOfFame: { en: 'Leaderboard', el: 'Κατάταξη' },
  globalStandings: { en: 'Top Members', el: 'Κορυφαία μέλη' },
  liveData: { en: 'LIVE UPDATES', el: 'Ζωντανή ενημέρωση' },
  becomeMerchant: { en: 'Partner with Us', el: 'Γίνε συνεργατής' },
  joinEcosystem: { en: 'Bring your business to the Anbit ecosystem.', el: 'Εντάξτε την επιχείρησή σας στο οικοσύστημα Anbit.' },
  applyNow: { en: 'Apply Now', el: 'Κάνε αίτηση' },
  activeOperations: { en: 'Processing Order', el: 'Επεξεργασία παραγγελίας' },
  missionAt: { en: 'Order at:', el: 'Παραγγελία σε:' },
  awaitingXP: { en: 'Processing Points...', el: 'Επεξεργασία πόνων...' },

  // Network Strings
  theEcosystem: { en: 'Partner Network', el: 'Δίκτυο συνεργατών' },
  thessalonikiWarriorNetwork: { en: 'Thessaloniki Partner Network', el: 'Δίκτυο καταστημάτων Θεσσαλονίκης' },
  all: { en: 'All', el: 'Όλα' },
  coffee: { en: 'Coffee', el: 'Καφές' },
  food: { en: 'Food', el: 'Φαγητό' },
  lifestyle: { en: 'Lifestyle', el: 'Lifestyle' },
  services: { en: 'Services', el: 'Υπηρεσίες' },
  searchPartners: { en: 'Search by store or category...', el: 'Αναζήτηση καταστήματος ή κατηγορίας...' },
  viewMenu: { en: 'Order', el: 'Παράγγειλε' },
  checkIn: { en: 'Booking', el: 'κράτηση' },
  battleMap: { en: 'Store Map', el: 'Χάρτης καταστημάτων' },
  launchMap: { en: 'Launch Map', el: 'Εμφάνιση χάρτη' },
  partnerStores: { en: 'Partner Stores', el: 'Συνεργαζόμενα καταστήματα' },
  categories: { en: 'Categories', el: 'Κατηγορίες' },
  emptyCart: { en: 'Empty Cart', el: 'Άδειο Καλάθι' },
  fillCartHint: { en: 'Fill your cart with the products on the left', el: 'Γέμισε το καλάθι σου με τα προϊόντα που βρίσκονται αριστερά' },
  addAddressHint: { en: 'To order, click here and enter your address', el: 'Για να παραγγείλεις πάτησε εδώ και βάλε τη διεύθυνσή σου' },
  addAddress: { en: 'Enter address', el: 'Βάλε διεύθυνση' },
  placeOrder: { en: 'Order', el: 'Παράγγειλε' },
  minOrder: { en: 'Min.', el: 'Ελάχ.' },
  delivery: { en: 'Delivery', el: 'Delivery' },
  cart: { en: 'Cart', el: 'Καλάθι' },
  pointsAtStore: { en: 'Your points', el: 'Διαθέσιμοι πόντοι' },
  winCoupon: { en: 'Win a 4€ coupon', el: 'Κέρδισε κουπόνι 4€' },
  exploreThess: { en: 'Explore partner locations near you.', el: 'Εξερευνήστε τα συνεργαζόμενα καταστήματα.' },

  // Scanner Strings
  scanToOrder: { en: 'Scan to Order', el: 'Σαρώστε για παραγγελία' },
  opticalScan: { en: 'QR Scanner', el: 'Σάρωση QR' },
  nfcProximity: { en: 'NFC Tap', el: 'NFC Tap' },
  initiateCamera: { en: 'Start Camera', el: 'Εναρκτήρια κάμερα' },
  targetAcquired: { en: 'Store Linked', el: 'Το κατάστημα συνδέθηκε' },
  scannerIntro: { en: 'Scan the store\'s QR or tap your device.', el: 'Σαρώστε το QR ή ακουμπήστε τη συσκευή στο σημείο.' },
  protocolAwareness: { en: 'Usage Info', el: 'Πληροφορίες χρήσης' },
  tapStation: { en: 'NFC Point', el: 'Σημείο NFC' },

  // Quests / Store Offers Strings
  dealsOfTheDay: { en: 'Deals of the Day', el: 'Προσφορές της ημέρας' },
  storeOffers: { en: 'Store Offers', el: 'Προσφορές καταστημάτων' },
  storeOffersSubtitle: { en: 'Claim exclusive offers and earn XP rewards from your favorite stores.', el: 'Δεσμεύστε αποκλειστικές προσφορές και κερδίστε XP από τα αγαπημένα σας καταστήματα.' },
  yourLevel: { en: 'Your Level', el: 'Επίπεδο σου' },
  totalXP: { en: 'Total XP', el: 'Συνολικό XP' },
  progressToLevel: { en: 'Progress to Level', el: 'Πρόοδος προς επίπεδο' },
  filterBy: { en: 'Filter by:', el: 'Φίλτρο:' },
  allOffers: { en: 'All Offers', el: 'Όλες οι προσφορές' },
  highestXP: { en: 'Highest XP', el: 'Υψηλότερο XP' },
  expiringSoon: { en: 'Expiring Soon', el: 'Λήγουν σύντομα' },
  claimOffer: { en: 'Claim Offer', el: 'Δεσμεύστε προσφορά' },
  viewRules: { en: 'View Rules', el: 'Δείτε κανόνες' },
  expiresInDays: { en: 'Expires in', el: 'Λήγει σε' },
  daysLeft: { en: 'days', el: 'ημέρες' },
  xpMultiplierWeekend: { en: 'XP Weekend', el: 'XP Σαββατοκύριακο' },
  eliteMissions: { en: 'Member Challenges', el: 'Προκλήσεις μελών' },
  warriorLog: { en: 'Activity Log', el: 'Καταγραφή δραστηριότητας' },
  active: { en: 'Active', el: 'Ενεργές' },
  legendary: { en: 'Special', el: 'Ειδικές' },
  daily: { en: 'Daily', el: 'Καθημερινές' },
  completed: { en: 'Finished', el: 'Ολοκληρωμένες' },
  season: { en: 'Season', el: 'Περίοδος' },
  priorityMission: { en: 'High Reward', el: 'Υψηλή επιβράβευση' },
  launchMission: { en: 'Start Challenge', el: 'Ενάρξη προκλήσης' },
  progress: { en: 'Progress', el: 'Πρόοδος' },
  partnerStore: { en: 'Partner Store', el: 'Συνεργαζόμενο κατάστημα' },
  categoryOffer: { en: 'Offer', el: 'Προσφορά' },

  // Vault/Marketplace Strings
  marketplace: { en: 'Rewards', el: 'Επιβραβεύσεις' },
  catalog: { en: 'Catalog', el: 'Κατάλογος' },
  redeemVoucher: { en: 'Claim Voucher', el: 'Λήψη κουπονιού' },
  levelUpToUnlock: { en: 'Higher Level Required', el: 'Απαιτείται υψηλότερο επίπεδο' },
  yourLootBox: { en: 'My Rewards', el: 'Τα δώρα μου' },
  redeemNow: { en: 'Redeem Now', el: 'Εξαργύρωση τώρα' },
  expiresIn: { en: 'Expires in', el: 'Λήγει σε' },
  questCard: { en: 'Quest Card', el: 'Quest Card' },
  levelProgress: { en: 'Level', el: 'Level' },

  // Settings Page
  systemProtocols: { en: 'App Settings', el: 'Ρυθμίσεις εφαρμογής' },
  configuration: { en: 'Profile', el: 'Προφίλ' },
  regionalProtocol: { en: 'Regional Preferences', el: 'Τοπικές προτιμήσεις' },
  languageSelection: { en: 'Language', el: 'Γλώσσα' },
  warriorProfile: { en: 'Member Info', el: 'Στοιχεία μέλους' },
  codename: { en: 'Full Name', el: 'Ονοματεπώνυμο' },
  commLink: { en: 'Email Address', el: 'Διεύθυνση email' },
  commitChanges: { en: 'Save Changes', el: 'Αποθήκευση' },
  tacticalAlerts: { en: 'Notifications', el: 'Ειδοποιήσεις' },
  pushNotifications: { en: 'Push Alerts', el: 'Ειδοποιήσεις push' },
  ghostMode: { en: 'Private Profile', el: 'Ιδιωτικό προφίλ' },
  bioLock: { en: 'Security Lock', el: 'Κλειδωμά ασφαλείας' },

  // General UI
  order: { en: 'Order', el: 'Παραγγελία' },
  myId: { en: 'My Card', el: 'Η κάρτα μου' },
  points: { en: 'Points', el: 'Πόντοι' },
  warriorNode: { en: 'Member Point', el: 'Σημείο μέλους' },
  costUnit: { en: 'Price', el: 'Τιμή' },
  addLoadout: { en: 'Add to Cart', el: 'Προσθήκη στο καλάθι' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('el');

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
