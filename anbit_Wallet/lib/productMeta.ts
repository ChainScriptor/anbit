import type { CartItemData, Product } from '../types';

/** Κατηγορία όπως στο dashboard (π.χ. Coffee, Burgers). */
export function getProductCategoryLabel(product: Product): string | null {
  const c = (product.category || '').trim();
  return c.length > 0 ? c : null;
}

/** Ονόματα ομάδων επιλογών από το API (`optionGroups`), όπως στο admin. */
export function getApiOptionGroupsSummary(product: Product): string | null {
  if (!product.optionGroups?.length) return null;
  const s = product.optionGroups.map((g) => g.name.trim()).filter(Boolean).join(' · ');
  return s.length > 0 ? s : null;
}

/** Αναγνώσιμη γραμμή για τις επιλεγμένες επιλογές στη γραμμή καλαθιού (χρειάζεται `optionGroups` στο προϊόν). */
export function formatCartItemSelectedOptions(item: CartItemData): string | null {
  if (!item.selectedOptions?.length) return null;
  const parts: string[] = [];
  for (const sel of item.selectedOptions) {
    const g = item.optionGroups?.find((x) => x.id === sel.groupId);
    const o = g?.options.find((x) => x.id === sel.optionId);
    if (g && o) parts.push(`${g.name}: ${o.name}`);
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}
