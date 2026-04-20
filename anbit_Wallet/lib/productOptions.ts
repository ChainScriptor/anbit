import type { Product, SelectedOptionPayload } from '../types';
import { getApiOptionGroupsSummary } from './productMeta';

/** Επιλογή μέσα σε ομάδα (UI / τιμή extra). */
export interface ProductChoice {
  id: string;
  label: string;
  priceAdd?: number;
}

/** Ομάδα προσαρμογής προϊόντος — από API ή heuristic. */
export interface ProductCustomizationOption {
  id: string;
  label: string;
  required?: boolean;
  type: 'single' | 'multi';
  choices: ProductChoice[];
  /** Όταν υπάρχει, οι επιλογές στέλνονται στο API ως groupId / optionId */
  apiGroupId?: string;
}

export function buildSelectedOptionsPayload(
  options: ProductCustomizationOption[],
  selections: Record<string, string | string[]>,
): SelectedOptionPayload[] | undefined {
  const out: SelectedOptionPayload[] = [];
  for (const opt of options) {
    if (!opt.apiGroupId) continue;
    const sel = selections[opt.id];
    const ids = Array.isArray(sel) ? sel : sel ? [sel] : [];
    for (const cid of ids) {
      if (cid) out.push({ groupId: opt.apiGroupId, optionId: cid });
    }
  }
  return out.length ? out : undefined;
}

/** `apiOnly` (QR store): μόνο `optionGroups` από GET προϊόντος — χωρίς heuristic ζάχαρη/πίτσα. */
export type ProductOptionsMode = 'full' | 'apiOnly';

/**
 * Σειρά εμφάνισης στο PWA: υποχρεωτικές πρώτες, μετά προαιρετικές single, τέλος multiple (extras).
 * Ισόβαθμες ομάδες κρατούν την αρχική σειρά (stable sort).
 */
export function sortCustomizationOptionsForDisplay(
  options: ProductCustomizationOption[],
): ProductCustomizationOption[] {
  return [...options].sort((a, b) => {
    const rank = (o: ProductCustomizationOption) => {
      if (o.required) return 0;
      if (o.type === 'single') return 1;
      return 2;
    };
    return rank(a) - rank(b);
  });
}

export function getProductOptions(
  product: Product,
  mode: ProductOptionsMode = 'full',
): ProductCustomizationOption[] {
  if (product.optionGroups && product.optionGroups.length > 0) {
    return sortCustomizationOptionsForDisplay(
      product.optionGroups.map((g) => ({
        id: g.id,
        apiGroupId: g.id,
        label: g.name,
        required: g.type === 'Single',
        type: g.type === 'Single' ? 'single' : 'multi',
        choices: g.options.map((o) => ({
          id: o.id,
          label: o.price > 0 ? `${o.name} +€${o.price.toFixed(2)}` : o.name,
          priceAdd: o.price,
        })),
      })),
    );
  }
  if (mode === 'apiOnly') {
    return [];
  }
  return sortCustomizationOptionsForDisplay(getHeuristicProductOptions(product));
}

export function getHeuristicProductOptions(
  product: Pick<Product, 'name' | 'category' | 'description'>,
): ProductCustomizationOption[] {
  const txt = `${product.name} ${product.description} ${product.category}`.toLowerCase();
  const opts: ProductCustomizationOption[] = [];

  if (/καφ|coffee|espresso|cappuccino|latte|freddo|frappe/.test(txt)) {
    opts.push({
      id: 'sugar',
      label: 'Ζάχαρη',
      required: true,
      type: 'single',
      choices: [
        { id: 'plain', label: 'Σκέτος' },
        { id: 'medium', label: 'Μέτριος' },
        { id: 'sweet', label: 'Γλυκός' },
        { id: 'very', label: 'Πολύγλυκος' },
      ],
    });
    opts.push({
      id: 'milk',
      label: 'Γάλα',
      type: 'single',
      choices: [
        { id: 'normal', label: 'Κανονικό' },
        { id: 'oat', label: 'Βρώμης +0.50€', priceAdd: 0.5 },
        { id: 'almond', label: 'Αμυγδάλου +0.50€', priceAdd: 0.5 },
        { id: 'none', label: 'Χωρίς' },
      ],
    });
    opts.push({
      id: 'size',
      label: 'Μέγεθος',
      type: 'single',
      choices: [
        { id: 'small', label: 'Small' },
        { id: 'medium', label: 'Medium' },
        { id: 'large', label: 'Large +0.50€', priceAdd: 0.5 },
      ],
    });
  } else if (/burger|smash|μπέικ|bbq|chees/.test(txt)) {
    opts.push({
      id: 'cooking',
      label: 'Ψήσιμο',
      required: true,
      type: 'single',
      choices: [
        { id: 'medium', label: 'Medium' },
        { id: 'well', label: 'Well Done' },
      ],
    });
    opts.push({
      id: 'extras',
      label: 'Extras',
      type: 'multi',
      choices: [
        { id: 'xcheese', label: 'Έξτρα τυρί +0.50€', priceAdd: 0.5 },
        { id: 'bacon', label: 'Μπέικον +1.00€', priceAdd: 1 },
        { id: 'noOnion', label: 'Χωρίς κρεμμύδι' },
        { id: 'noSauce', label: 'Χωρίς σάλτσα' },
      ],
    });
  } else if (/pizza|πίτσ/.test(txt)) {
    opts.push({
      id: 'crust',
      label: 'Ζύμη',
      required: true,
      type: 'single',
      choices: [
        { id: 'thin', label: 'Λεπτή' },
        { id: 'thick', label: 'Χοντρή' },
      ],
    });
    opts.push({
      id: 'extras',
      label: 'Extras',
      type: 'multi',
      choices: [
        { id: 'xcheese', label: 'Έξτρα τυρί +0.80€', priceAdd: 0.8 },
        { id: 'pepperoni', label: 'Πεπερόνι +1.00€', priceAdd: 1 },
        { id: 'mushrooms', label: 'Μανιτάρια +0.50€', priceAdd: 0.5 },
      ],
    });
  } else if (/σαλάτ|salad/.test(txt)) {
    opts.push({
      id: 'dressing',
      label: 'Dressing',
      type: 'single',
      choices: [
        { id: 'none', label: 'Χωρίς' },
        { id: 'oil', label: 'Λαδόξιδο' },
        { id: 'mustard', label: 'Μουστάρδα' },
        { id: 'caesar', label: 'Caesar' },
      ],
    });
  } else if (/panuozzo|σάντουιτς|toast|wrap/.test(txt)) {
    opts.push({
      id: 'extras',
      label: 'Extras',
      type: 'multi',
      choices: [
        { id: 'xcheese', label: 'Έξτρα τυρί +0.50€', priceAdd: 0.5 },
        { id: 'noSauce', label: 'Χωρίς σάλτσα' },
        { id: 'noVeg', label: 'Χωρίς λαχανικά' },
      ],
    });
  }
  return opts;
}

/** Περίληψη για κάρτα μενού (API ή heuristic). */
export function getMenuOptionsSummaryLine(
  product: Product,
  mode: ProductOptionsMode = 'full',
): string | null {
  const fromApi = getApiOptionGroupsSummary(product);
  if (fromApi) return fromApi;
  if (mode === 'apiOnly') return null;
  const h = getHeuristicProductOptions(product);
  return h.length > 0 ? h.map((o) => o.label).join(' · ') : null;
}
