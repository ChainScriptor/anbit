import type { ApiMerchantUser } from '@/services/api';

const STORAGE_KEY = 'anbit_dashboard_registered_merchants_v1';

export interface RegisteredMerchantRecord {
  username: string;
  email: string;
  registeredAt: string;
}

/** Σταθερό pseudo-id για React keys· ΔΕΝ είναι έγκυρο GUID για API (QR / Products). */
export function localRegistryMerchantId(username: string): string {
  const u = username.trim();
  try {
    return `__local__${btoa(unescape(encodeURIComponent(u)))}`;
  } catch {
    return `__local__${encodeURIComponent(u)}`;
  }
}

export function isLocalRegistryMerchantId(id: string): boolean {
  return id.startsWith('__local__');
}

function readRaw(): RegisteredMerchantRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is RegisteredMerchantRecord =>
        x &&
        typeof x === 'object' &&
        typeof (x as RegisteredMerchantRecord).username === 'string' &&
        typeof (x as RegisteredMerchantRecord).email === 'string',
    );
  } catch {
    return [];
  }
}

export function readRegisteredMerchants(): RegisteredMerchantRecord[] {
  return readRaw();
}

export function appendRegisteredMerchant(username: string, email: string): void {
  const u = username.trim();
  const e = email.trim();
  if (!u || !e) return;
  const list = readRaw();
  if (list.some((x) => x.username.toLowerCase() === u.toLowerCase())) {
    return;
  }
  const next: RegisteredMerchantRecord[] = [
    { username: u, email: e, registeredAt: new Date().toISOString() },
    ...list,
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 500)));
}

/** Μετατροπή εγγραφών registry σε γραμμές λίστας (username / email πραγματικά από τη φόρμα). */
export function registeredRecordsToMerchantUsers(
  records: RegisteredMerchantRecord[],
): ApiMerchantUser[] {
  return records.map((r) => ({
    id: localRegistryMerchantId(r.username),
    username: r.username,
    email: r.email,
  }));
}

/** Τοπικές εγγραφές πρώτες (αν δεν υπάρχει ήδη το ίδιο username από API). */
export function mergeMerchantsWithLocalRegistry(
  fromDirectory: ApiMerchantUser[],
): ApiMerchantUser[] {
  const uname = new Set(
    fromDirectory.map((u) => u.username.trim().toLowerCase()),
  );
  const local = registeredRecordsToMerchantUsers(readRegisteredMerchants());
  const localsToAdd = local.filter(
    (l) => !uname.has(l.username.trim().toLowerCase()),
  );
  return [...localsToAdd, ...fromDirectory];
}
