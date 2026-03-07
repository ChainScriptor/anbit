# Anbit Wallet – Οδηγός Frontend

Μικρός οδηγός για τη ροή δεδομένων και τη λειτουργία κάθε "σελίδας" της εφαρμογής πελάτη (anbit_Wallet).

---

## 1. Ξεκίνημα εφαρμογής και πρώτο component

- **Entry point:** `index.html` φορτώνει `index.tsx`.
- **index.tsx** κάνει render την ιεραρχία:
  ```
  ThemeProvider → AuthProvider → LanguageProvider → App
  ```
- Το **πρώτο component που φορτώνει** (ως οθόνη) είναι το **App**. Μέσα στο App:
  - Αν ο χρήστης **δεν** είναι authenticated (`!isAuthenticated && !isAuthLoading`) → εμφανίζεται **LoginPage**.
  - Αν είναι authenticated → εμφανίζεται το κύριο layout (Header + περιεχόμενο ανά tab + FooterTaped).

Άρα: **πρώτο component που βλέπει ο χρήστης** = είτε **LoginPage** είτε το **κεντρικό view** (Dashboard tab με AnbitCafeDemoScene, XPProgressCircle, κ.λπ.).

---

## 2. Αποθήκευση δεδομένων χρήστη μετά το login

Μετά το login τα δεδομένα του χρήστη αποθηκεύονται σε **δύο** μέρη:

| Πού | Τι |
|-----|-----|
| **AuthContext (state)** | `user` (αντικείμενο UserData), `token` (JWT string). |
| **localStorage** | `anbit_token` = το token, `anbit_user` = JSON.stringify(user). |

Η **login** συνάρτηση στο `context/AuthContext.tsx` καλεί `api.login()`, παίρνει `response.token` και `response.user`, και τα βάζει και στο state και στο localStorage. Το **App** συγχρονίζει το `user` του AuthContext με το δικό του state `userData` μέσω `useEffect(() => { if (user) setUserData(user); }, [user]);`, ώστε τα παιδικά components να παίρνουν `userData` (π.χ. XP, storeXP, name).

---

## 3. Από πού έρχεται το μενού (mock vs API)

- Το **μενού** ανήκει σε κάθε **Partner**: `Partner.menu` (πίνακας Product).
- Οι partners έρχονται από το hook **useDashboardData** (`hooks/useDashboardData.ts`), που αρχικά γεμίζει το feed από **mockDashboardData** (`mockData.ts`). Στο `mockData.ts`, κάθε partner έχει `menu: generateMockMenu('Coffee')` ή `generateMockMenu('Food')` κ.λπ. — δηλαδή το μενού είναι **mock**.
- Το `dashboardFeed.partners` περνάει στο **StoreMenuPage** και στο **PartnerMenuModal**. Εκεί το μενού διαβάζεται ως `partner.menu` (π.χ. `const menu = useMemo(() => partner.menu || [], [partner]);`).

**Για να αλλάξεις από mock σε API:**

- **Κύριο σημείο:** `hooks/useDashboardData.ts` — η αρχική κατάσταση `feed` βασίζεται σε `mockDashboardData` (partners με menu). Εκεί μπορείς να κάνεις fetch partners (με menus) από το backend και να καλύψεις το `partners` (και άλλα feed data αν χρειάζεται) από API αντί για mock.
- **Εναλλακτικά:** Αν το API δίνει μενού ξεχωριστά ανά partner (π.χ. `GET /api/v1/Products?partnerId=...`), μπορείς να φορτώνεις το `menu` στο **StoreMenuPage** ή **PartnerMenuModal** όταν έχει επιλεγεί `partner` (π.χ. σε `useEffect` που κάνει request με `partner.id` και ενημερώνει local state για τα προϊόντα αυτού του partner).

Συνοπτικά: **αρχείο** = `hooks/useDashboardData.ts` (και δευτερευόντως `mockData.ts` για την τρέχουσα πηγή), **συνάρτηση** = `useDashboardData` και το initial state που ορίζεται από `mockDashboardData.partners`. Αλλάζοντας εκεί το feed (partners με menu) να έρχεται από API, το μενού γίνεται από API παντού που χρησιμοποιείται `dashboardFeed.partners`.

---

## 4. Λειτουργία κάθε "σελίδας"

Η εφαρμογή χρησιμοποιεί **React Router**. Η "σελίδα" αλλάζει με **URL path** (π.χ. `/dashboard`, `/quests`, `/settings`). Κάθε `<Route>` στο `App.tsx` αντιστοιχεί σε μία λογική σελίδα.

**Paths:** `/`, `/dashboard`, `/scanner`, `/network`, `/quests`, `/profile`, `/settings`, `/security`. Το `/` κάνει redirect στο `/dashboard`. Άγνωστο path → redirect στο `/dashboard`. Αν ο χρήστης πληκτρολογήσει χειροκίνητα π.χ. `/settings` στο browser, φορτώνει η σωστή σελίδα.

| Path | Component | Τι κάνει |
|------------|-----------|----------|
| `/dashboard` | — (inline στο App) | Κεντρική οθόνη: hero (AnbitCafeDemoScene), XP προόδου, κάρτα "Master Legacy", RewardSection, προσφορές (OfferCarousel), Leaderboard, CTA για merchants. |
| `/scanner` | ShopScannerPage | Σκανάρισμα/εντοπισμός καταστημάτων (partners), άνοιγμα μενού συνεργάτη. |
| `/network` | NetworkPage ή StoreMenuPage | **NetworkPage:** λίστα partners, XP ανά κατάστημα, QR, είσοδος στο store menu. **StoreMenuPage:** πλήρες μενού του επιλεγμένου partner, καλάθι, τοποθέτηση παραγγελίας, XP από order. |
| `/quests` | QuestsPage | Προκλήσεις / quests (πόντους, εξέλιξη, λήξη). |
| `/profile` | ProfilePage | Προφίλ χρήστη και σχέση με partners. |
| `/settings` | SettingsPage | Ρυθμίσεις εφαρμογής. |
| `/security` | SecurityPage | Ρυθμίσεις ασφαλείας. |

**Modals (όχι tabs):** UserQRModal (QR χρήστη), PartnerMenuModal (γρήγορο μενού partner), RedemptionActiveModal (επιβράβευση), CheckInModal, AddressManagerModal, ProductDetailModal (λεπτομέρειες προϊόντος).

---

## 5. Σύντομη ροή δεδομένων (Data Flow)

```
index.tsx
  → ThemeProvider / AuthProvider / LanguageProvider
    → App
      → useAuth()           → token, user, login, logout (AuthContext)
      → useDashboardData()  → partners, quests, rewards, activities, leaderboard (αρχικά mock)
      → location.pathname   → ποιο view να εμφανιστεί (Routes/Route)

Αν μη authenticated → LoginPage (μόνο).
Αν authenticated:
  → userData = user (από Auth)
  → <Routes> / <Route> ανά pathname
  → Header / FooterTaped για πλοήγηση
  → Modals ανοίγουν με local state (isQRModalOpen, isPartnerMenuOpen, κ.λπ.)
```

- **Login:** `LoginPage` → `useAuth().login(email, password)` → `api.login()` → AuthContext ενημερώνει `user` & `token` και localStorage.
- **Menu:** `mockData.mockDashboardData.partners[].menu` (ή wallet-data.json) → `useDashboardData().partners` → `StoreMenuPage` / `PartnerMenuModal` διαβάζουν `partner.menu`.

---

*Τελευταία ενημέρωση: σύντοφος οδηγός για anbit_Wallet data flow και σελίδες.*
