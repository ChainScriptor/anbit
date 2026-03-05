/**
 * Merges class names. Supports strings and conditional objects.
 * Used by UI components (e.g. shadcn-style).
 */
export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (typeof input === 'string' && input.trim()) {
      classes.push(input.trim());
    } else if (input && typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }
  return classes.filter(Boolean).join(' ');
}
