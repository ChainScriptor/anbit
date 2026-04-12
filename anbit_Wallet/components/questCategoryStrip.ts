/**
 * Καρτέλες «Αναζήτηση ανά κατηγορία» στο Quests: open/close SVG από `public/categoriessvg/`
 * ανά επιλεγμένο quick category (Εστιατόρια, Ψώνια, Διαμονή, κ.λπ.).
 */

export type CategoryStripBundle =
  | 'food'
  | 'shopping'
  | 'airbnb'
  | 'health'
  | 'beauty'
  | 'drinks'
  | 'pets'
  | 'electronics'
  | 'baby'
  | 'home'
  | 'flowers'
  | 'hobbies'
  | 'clothes'
  | 'gifts'
  | 'legacy';

export type QuestPartnerCategoryTab = {
  id: string;
  label: string;
  openSrc: string;
  closeSrc: string;
};

/** Φίλτρα που δεν αντιστοιχούν ακόμα σε `Partner.category` — εμφανίζονται όλες οι προσφορές. */
export const PLACEHOLDER_CATEGORY_IDS = new Set<string>([
  'psonia_1',
  'psonia_2',
  'psonia_3',
  'psonia_4',
  'psonia_5',
  'psonia_6',
  'psonia_7',
  'psonia_8',
  'stay_1',
  'stay_2',
  'stay_3',
  'stay_4',
  'stay_5',
  'well_1',
  'well_2',
  'well_3',
  'well_4',
  'well_5',
  'beauty_1',
  'beauty_2',
  'beauty_3',
  'beauty_4',
  'beauty_5',
  'drink_1',
  'drink_2',
  'drink_3',
  'drink_4',
  'drink_5',
  'drink_6',
  'pet_1',
  'pet_2',
  'pet_3',
  'pet_4',
  'elec_1',
  'elec_2',
  'elec_3',
  'elec_4',
  'baby_1',
  'baby_2',
  'baby_3',
  'baby_4',
  'baby_5',
  'home_1',
  'home_2',
  'home_3',
  'home_4',
  'home_5',
  'flower_1',
  'flower_2',
  'flower_3',
  'hobby_1',
  'hobby_2',
  'hobby_3',
  'hobby_4',
  'hobby_5',
  'cloth_1',
  'cloth_2',
  'cloth_3',
  'cloth_4',
  'cloth_5',
  'gift_1',
  'gift_2',
  'gift_3',
  'gift_4',
  'gift_5',
]);

export function categoryStripBundleFromQuickId(quickId: string | null): CategoryStripBundle {
  if (quickId === 'q-restaurants') return 'food';
  if (quickId === 'q-shopping') return 'shopping';
  if (quickId === 'q-market') return 'airbnb';
  if (quickId === 'q-health') return 'health';
  if (quickId === 'q-beauty') return 'beauty';
  if (quickId === 'q-drinks') return 'drinks';
  if (quickId === 'q-pets') return 'pets';
  if (quickId === 'q-electronics') return 'electronics';
  if (quickId === 'q-baby') return 'baby';
  if (quickId === 'q-home') return 'home';
  if (quickId === 'q-flowers') return 'flowers';
  if (quickId === 'q-hobbies') return 'hobbies';
  if (quickId === 'q-clothes') return 'clothes';
  if (quickId === 'q-gifts') return 'gifts';
  return 'legacy';
}

export function partnerCategoryTabImageSrc(tab: QuestPartnerCategoryTab, active: boolean): string {
  return active ? tab.openSrc : tab.closeSrc;
}

function food(pu: (p: string) => string, openFile: string, closeFile: string) {
  return {
    openSrc: pu(`categoriessvg/food/foodOpen/${openFile}`),
    closeSrc: pu(`categoriessvg/food/foodClose/${closeFile}`),
  };
}

/** Εστιατόρια — `id` = `Partner.category` όπου υπάρχει. */
export function buildFoodCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const f = (id: string, label: string, o: string, c: string): QuestPartnerCategoryTab => ({
    id,
    label,
    ...food(pu, o, c),
  });
  return [
    f('All', allLabel, 'all.svg', 'allclose.svg'),
    f('street_food', 'Street Food', 'streetfood.svg', 'streetfoodclose.svg'),
    f('burger', 'Burger', 'burger.svg', 'burgerclose.svg'),
    f('bbq', 'Chicken', 'chicken.svg', 'chickenclose.svg'),
    f('pizza', 'Pizza', 'pizza.svg', 'pizzaclose.svg'),
    f('italian', 'Ιταλικό', 'italic.svg', 'italianclose.svg'),
    f('sweets', 'Γλυκά', 'sweets.svg', 'sweetsclose.svg'),
    f('brunch', 'Brunch', 'sandwitch.svg', 'brucnhclose.svg'),
    f('pasta', 'Ζυμαρικά', 'italic.svg', 'pastaclose.svg'),
    f('healthy', 'Healthy', 'healthy.svg', 'healthyclose.svg'),
    f('asian', 'Asian', 'asian.svg', 'asianclose.svg'),
    f('sandwiches', 'Sandwiches', 'sandwitch.svg', 'sandwitchclose.svg'),
  ];
}

/** Ψώνια — αριθμημένα SVG στο `psonia/`. */
export function buildShoppingCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string, string][] = [
    ['psonia_1', 'Ψωμί', '7.svg', '8.svg'],
    ['psonia_2', 'Κρέας & Ψάρι', '9.svg', '10.svg'],
    ['psonia_3', 'Φρούτα & Λαχανικά', '11.svg', '12.svg'],
    ['psonia_4', 'Σνάκ & Παγωτά', '13.svg', '14.svg'],
    ['psonia_5', 'Ποτά', '15.svg', '16.svg'],
    ['psonia_6', 'Ψιλικά', '17.svg', '18.svg'],
    ['psonia_7', 'Vape Shop', '19.svg', '20.svg'],
    ['psonia_8', 'Τυροκομικά & Αυγά', '21.svg', '22.svg'],
  ];
  return [
    {
      id: 'All',
      label: allLabel,
      openSrc: pu('categoriessvg/psonia/pswniaOpen/all.svg'),
      closeSrc: pu('categoriessvg/psonia/pswniaClose/all.svg'),
    },
    ...pairs.map(([id, label, o, c]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/psonia/pswniaOpen/${o}`),
      closeSrc: pu(`categoriessvg/psonia/pswniaClose/${c}`),
    })),
  ];
}

/** Διαμονή — `airbnb/` (open 24–32, close 23/25/28/31· το `stay_5` μοιράζεται προσωρινά το `31.svg`). */
export function buildAirbnbCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string, string][] = [
    ['stay_1', 'Διαμερίσματα & Airbnb', '24.svg', '23.svg'],
    ['stay_2', 'Boutique Hotels', '27.svg', '28.svg'],
    ['stay_3', 'Luxury Suites', '29.svg', '25.svg'],
    ['stay_4', 'Βίλες', '30.svg', '31.svg'],
    ['stay_5', 'Resorts & Spa Hotels', '32.svg', '31.svg'],
  ];
  return [
    {
      id: 'All',
      label: allLabel,
      openSrc: pu('categoriessvg/airbnb/airbnbOpen/all.svg'),
      closeSrc: pu('categoriessvg/airbnb/airbnbClose/all.svg'),
    },
    ...pairs.map(([id, label, o, c]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/airbnb/airbnbOpen/${o}`),
      closeSrc: pu(`categoriessvg/airbnb/airbnbClose/${c}`),
    })),
  ];
}

/** Υγεία & ευεξία — `health/` (open 33–41, close 34–40· το `well_5` μοιράζεται προσωρινά το `40.svg`). */
export function buildHealthCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string, string][] = [
    ['well_1', 'Φαρμακείο', '33.svg', '34.svg'],
    ['well_2', 'Γυμναστήριο & Διατροφή', '35.svg', '36.svg'],
    ['well_3', 'Οπτικά', '37.svg', '38.svg'],
    ['well_4', 'Massage & Spa', '39.svg', '40.svg'],
    ['well_5', 'Οδοντιατρική Φροντίδα', '41.svg', '40.svg'],
  ];
  return [
    {
      id: 'All',
      label: allLabel,
      openSrc: pu('categoriessvg/health/HealthOpen/all.svg'),
      closeSrc: pu('categoriessvg/health/HealthClose/all.svg'),
    },
    ...pairs.map(([id, label, o, c]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/health/HealthOpen/${o}`),
      closeSrc: pu(`categoriessvg/health/HealthClose/${c}`),
    })),
  ];
}

/** Ομορφιά — `beauty/` (open 63–67, close 69–73). Το «Όλα» χρησιμοποιεί `beautyClose/all.svg` (δεν υπάρχει ακόμα open variant). */
export function buildBeautyCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string, string][] = [
    ['beauty_1', 'Φροντίδα Μαλλιών', '63.svg', '69.svg'],
    ['beauty_2', 'Μπαρμπεράδικο', '64.svg', '70.svg'],
    ['beauty_3', 'Νυχια & μανικιούρ', '65.svg', '71.svg'],
    ['beauty_4', 'Αρώματα', '66.svg', '72.svg'],
    ['beauty_5', 'Lazer & Περιποίηση', '67.svg', '73.svg'],
  ];
  const allClose = pu('categoriessvg/beauty/beautyClose/all.svg');
  return [
    {
      id: 'All',
      label: allLabel,
      openSrc: allClose,
      closeSrc: allClose,
    },
    ...pairs.map(([id, label, o, c]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/beauty/beautyOpen/${o}`),
      closeSrc: pu(`categoriessvg/beauty/beautyClose/${c}`),
    })),
  ];
}

/** Ποτά — `drinks/` (open 74–79, close 80–84· τα `drink_5` & `drink_6` μοιράζονται το `84.svg`). Το «Όλα»: `drinksClose/all.svg` (και για open μέχρι να υπάρξει `drinksOpen/all.svg`). */
export function buildDrinksCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string, string][] = [
    ['drink_1', 'Ποτό', '74.svg', '80.svg'],
    ['drink_2', 'Κρασί', '75.svg', '81.svg'],
    ['drink_3', 'Μπύρες', '76.svg', '82.svg'],
    ['drink_4', 'Club', '77.svg', '83.svg'],
    ['drink_5', 'Beach Bar', '78.svg', '84.svg'],
    ['drink_6', 'Cocktails', '79.svg', '84.svg'],
  ];
  const drinksAll = pu('categoriessvg/drinks/drinksClose/all.svg');
  return [
    {
      id: 'All',
      label: allLabel,
      openSrc: drinksAll,
      closeSrc: drinksAll,
    },
    ...pairs.map(([id, label, o, c]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/drinks/drinksOpen/${o}`),
      closeSrc: pu(`categoriessvg/drinks/drinksClose/${c}`),
    })),
  ];
}

/** Κατοικίδια — `pets/` (open 85–88, close 89–92). Το «Όλα»: `petsClose/all.svg` (και για open μέχρι να υπάρξει `petsOpen/all.svg`). */
export function buildPetsCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string, string][] = [
    ['pet_1', 'Pet Shop', '85.svg', '89.svg'],
    ['pet_2', 'Vet', '86.svg', '90.svg'],
    ['pet_3', 'Grooming', '87.svg', '91.svg'],
    ['pet_4', 'Pet boutique', '88.svg', '92.svg'],
  ];
  const petsAll = pu('categoriessvg/pets/petsClose/all.svg');
  return [
    {
      id: 'All',
      label: allLabel,
      openSrc: petsAll,
      closeSrc: petsAll,
    },
    ...pairs.map(([id, label, o, c]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/pets/petsOpen/${o}`),
      closeSrc: pu(`categoriessvg/pets/petsClose/${c}`),
    })),
  ];
}

/** Ηλεκτρονικά — `electronics/` (open 99–102, close 95–97· το `elec_4` μοιράζεται το `97.svg`). */
export function buildElectronicsCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string, string][] = [
    ['elec_1', 'Smartphones & αξεσουάρ', '99.svg', '95.svg'],
    ['elec_2', 'Laptop & PC', '100.svg', '96.svg'],
    ['elec_3', 'Gaming & κονσόλες', '101.svg', '97.svg'],
    ['elec_4', 'Smart home & gadgets', '102.svg', '97.svg'],
  ];
  const all = pu('categoriessvg/electronics/electronicsClose/all.svg');
  return [
    { id: 'All', label: allLabel, openSrc: all, closeSrc: all },
    ...pairs.map(([id, label, o, c]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/electronics/electronicsOpen/${o}`),
      closeSrc: pu(`categoriessvg/electronics/electronicsClose/${c}`),
    })),
  ];
}

/** Παιδικά — `baby/` (ζεύγη 104/103 … 111/112). «Όλα»: ίδιο SVG και για open/close (δεν υπάρχει all). */
export function buildBabyCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string, string][] = [
    ['baby_1', 'Βρεφικά είδη', '104.svg', '103.svg'],
    ['baby_2', 'Παιχνίδια', '106.svg', '105.svg'],
    ['baby_3', 'Ρούχα & υπόδηση', '108.svg', '107.svg'],
    ['baby_4', 'Βρεφική διατροφή', '110.svg', '109.svg'],
    ['baby_5', 'Καροτσάκια & εξοπλισμός', '111.svg', '112.svg'],
  ];
  const allSrc = pu('categoriessvg/baby/babyClose/103.svg');
  return [
    { id: 'All', label: allLabel, openSrc: allSrc, closeSrc: allSrc },
    ...pairs.map(([id, label, o, c]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/baby/babyOpen/${o}`),
      closeSrc: pu(`categoriessvg/baby/babyClose/${c}`),
    })),
  ];
}

/** Σπίτι & DIY — `home/` (open all + 114–118, close μόνο `113.svg` για όλα τα inactive). */
export function buildHomeCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string][] = [
    ['home_1', 'Έπιπλα', '114.svg'],
    ['home_2', 'Διακόσμηση', '115.svg'],
    ['home_3', 'Εργαλεία & DIY', '116.svg'],
    ['home_4', 'Κουζίνα & μπάνιο', '117.svg'],
    ['home_5', 'Φωτισμός', '118.svg'],
  ];
  const close113 = pu('categoriessvg/home/homeClose/113.svg');
  const allOpen = pu('categoriessvg/home/homeOpen/all.svg');
  return [
    { id: 'All', label: allLabel, openSrc: allOpen, closeSrc: close113 },
    ...pairs.map(([id, label, o]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/home/homeOpen/${o}`),
      closeSrc: close113,
    })),
  ];
}

/** Ανθοπωλεία — `flowers/` (open 120–122, close μόνο `123.svg`). «Όλα»: 123 και για τις δύο καταστάσεις. */
export function buildFlowersCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string][] = [
    ['flower_1', 'Ανθοδέσμες', '120.svg'],
    ['flower_2', 'Φυτά εσωτερικού χώρου', '121.svg'],
    ['flower_3', 'Εποχιακά & δώρα', '122.svg'],
  ];
  const onlyClose = pu('categoriessvg/flowers/flowersClose/123.svg');
  return [
    { id: 'All', label: allLabel, openSrc: onlyClose, closeSrc: onlyClose },
    ...pairs.map(([id, label, o]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/flowers/flowersOpen/${o}`),
      closeSrc: onlyClose,
    })),
  ];
}

/** Χόμπι & αθλητισμός — `hobbies/` (open 125–129, close μόνο `124.svg`). */
export function buildHobbiesCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string][] = [
    ['hobby_1', 'Ομαδικά αθλήματα', '125.svg'],
    ['hobby_2', 'Fitness & γυμναστική', '126.svg'],
    ['hobby_3', 'Outdoor & πεζοπορία', '127.svg'],
    ['hobby_4', 'Χόμπι & δημιουργία', '128.svg'],
    ['hobby_5', 'Αθλητικός εξοπλισμός', '129.svg'],
  ];
  const close124 = pu('categoriessvg/hobbies/hobbiesClose/124.svg');
  return [
    { id: 'All', label: allLabel, openSrc: close124, closeSrc: close124 },
    ...pairs.map(([id, label, o]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/hobbies/hobbiesOpen/${o}`),
      closeSrc: close124,
    })),
  ];
}

/** Ένδυση — `clothes/` (open 131–135, close μόνο `130.svg`). */
export function buildClothesCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string][] = [
    ['cloth_1', 'Γυναικεία', '131.svg'],
    ['cloth_2', 'Ανδρικά', '132.svg'],
    ['cloth_3', 'Παιδικά ρούχα', '133.svg'],
    ['cloth_4', 'Αθλητικά & streetwear', '134.svg'],
    ['cloth_5', 'Αξεσουάρ & υπόδηση', '135.svg'],
  ];
  const close130 = pu('categoriessvg/clothes/clothesClose/130.svg');
  return [
    { id: 'All', label: allLabel, openSrc: close130, closeSrc: close130 },
    ...pairs.map(([id, label, o]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/clothes/clothesOpen/${o}`),
      closeSrc: close130,
    })),
  ];
}

/** Δώρα — `gifts/` (open 136–140, close μόνο `141.svg`). */
export function buildGiftsCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string][] = [
    ['gift_1', 'Είδη δώρου', '136.svg'],
    ['gift_2', 'Παιχνίδια & δώρα για παιδιά', '137.svg'],
    ['gift_3', 'Κοσμήματα & ρολόγια', '138.svg'],
    ['gift_4', 'Είδη σπιτιού ως δώρο', '139.svg'],
    ['gift_5', 'Εμπειρίες & vouchers', '140.svg'],
  ];
  const close141 = pu('categoriessvg/gifts/giftsClose/141.svg');
  return [
    { id: 'All', label: allLabel, openSrc: close141, closeSrc: close141 },
    ...pairs.map(([id, label, o]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/gifts/giftsOpen/${o}`),
      closeSrc: close141,
    })),
  ];
}

/** Παλιά `svg/` + `svgclose/` (ίδια λίστα ids με food). */
export function buildLegacyCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const legacy: [string, string, string, string][] = [
    ['All', allLabel, 'svg/all.svg', 'svgclose/allclose.svg'],
    ['street_food', 'Street Food', 'svg/streetfood.svg', 'svgclose/streetfoodclose.svg'],
    ['burger', 'Burger', 'svg/burger.svg', 'svgclose/burgerclose.svg'],
    ['bbq', 'Chicken', 'svg/chicken.svg', 'svgclose/chickenclose.svg'],
    ['pizza', 'Pizza', 'svg/pizza.svg', 'svgclose/pizzaclose.svg'],
    ['italian', 'Ιταλικό', 'svg/italic.svg', 'svgclose/italianclose.svg'],
    ['sweets', 'Γλυκά', 'svg/sweets.svg', 'svgclose/sweetsclose.svg'],
    ['brunch', 'Brunch', 'svg/sandwitch.svg', 'svgclose/brucnhclose.svg'],
    ['pasta', 'Ζυμαρικά', 'svg/italic.svg', 'svgclose/pastaclose.svg'],
    ['healthy', 'Healthy', 'svg/healthy.svg', 'svgclose/healthyclose.svg'],
    ['asian', 'Asian', 'svg/asian.svg', 'svgclose/asianclose.svg'],
    ['sandwiches', 'Sandwiches', 'svg/sandwitch.svg', 'svgclose/sandwitchclose.svg'],
  ];
  return legacy.map(([id, label, o, c]) => ({
    id,
    label,
    openSrc: pu(o),
    closeSrc: pu(c),
  }));
}

export function buildPartnerCategoryTabsForBundle(
  bundle: CategoryStripBundle,
  pu: (p: string) => string,
  allLabel: string,
): QuestPartnerCategoryTab[] {
  switch (bundle) {
    case 'food':
      return buildFoodCategoryTabs(pu, allLabel);
    case 'shopping':
      return buildShoppingCategoryTabs(pu, allLabel);
    case 'airbnb':
      return buildAirbnbCategoryTabs(pu, allLabel);
    case 'health':
      return buildHealthCategoryTabs(pu, allLabel);
    case 'beauty':
      return buildBeautyCategoryTabs(pu, allLabel);
    case 'drinks':
      return buildDrinksCategoryTabs(pu, allLabel);
    case 'pets':
      return buildPetsCategoryTabs(pu, allLabel);
    case 'electronics':
      return buildElectronicsCategoryTabs(pu, allLabel);
    case 'baby':
      return buildBabyCategoryTabs(pu, allLabel);
    case 'home':
      return buildHomeCategoryTabs(pu, allLabel);
    case 'flowers':
      return buildFlowersCategoryTabs(pu, allLabel);
    case 'hobbies':
      return buildHobbiesCategoryTabs(pu, allLabel);
    case 'clothes':
      return buildClothesCategoryTabs(pu, allLabel);
    case 'gifts':
      return buildGiftsCategoryTabs(pu, allLabel);
    default:
      return buildLegacyCategoryTabs(pu, allLabel);
  }
}
