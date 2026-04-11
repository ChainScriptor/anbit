/**
 * Καρτέλες «Αναζήτηση ανά κατηγορία» στο Quests: open/close SVG από `public/categoriessvg/`
 * ανά επιλεγμένο quick category (Εστιατόρια, Ψώνια, Διαμονή, Υγεία & Ευεξία).
 */

export type CategoryStripBundle = 'food' | 'shopping' | 'airbnb' | 'health' | 'legacy';

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
]);

export function categoryStripBundleFromQuickId(quickId: string | null): CategoryStripBundle {
  if (quickId === 'q-restaurants') return 'food';
  if (quickId === 'q-shopping') return 'shopping';
  if (quickId === 'q-market') return 'airbnb';
  if (quickId === 'q-health') return 'health';
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
      openSrc: pu('categoriessvg/food/foodOpen/all.svg'),
      closeSrc: pu('categoriessvg/food/foodClose/allclose.svg'),
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
      openSrc: pu('categoriessvg/food/foodOpen/all.svg'),
      closeSrc: pu('categoriessvg/food/foodClose/allclose.svg'),
    },
    ...pairs.map(([id, label, o, c]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/airbnb/airbnbOpen/${o}`),
      closeSrc: pu(`categoriessvg/airbnb/airbnbClose/${c}`),
    })),
  ];
}

/** Υγεία & ευεξία — `health/` (HealthOpen 33–41, HealthClose 34–40). */
export function buildHealthCategoryTabs(pu: (p: string) => string, allLabel: string): QuestPartnerCategoryTab[] {
  const pairs: [string, string, string, string][] = [
    ['well_1', 'Γυμναστήρια & fitness', '33.svg', '34.svg'],
    ['well_2', 'Yoga & pilates', '35.svg', '36.svg'],
    ['well_3', 'Κολύμβηση & πισίνα', '37.svg', '38.svg'],
    ['well_4', 'Ευεξία, spa & ευ ζην', '39.svg', '40.svg'],
  ];
  return [
    {
      id: 'All',
      label: allLabel,
      openSrc: pu('categoriessvg/food/foodOpen/all.svg'),
      closeSrc: pu('categoriessvg/food/foodClose/allclose.svg'),
    },
    ...pairs.map(([id, label, o, c]) => ({
      id,
      label,
      openSrc: pu(`categoriessvg/health/HealthOpen/${o}`),
      closeSrc: pu(`categoriessvg/health/HealthClose/${c}`),
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
    default:
      return buildLegacyCategoryTabs(pu, allLabel);
  }
}
