/** URL της εφαρμογής Anbit Dashboard (διαχείριση καταστήματος). Ορίζεται με VITE_DASHBOARD_URL στο .env */
export const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3001';

/**
 * Φόρμα συνεργασίας merchant (`frontend/merchant/index.html`).
 * Τοπικά: `npm run dev` στο φάκελο merchant → συνήθως http://localhost:5175/
 */
export const MERCHANT_APPLY_URL =
  import.meta.env.VITE_MERCHANT_PORTAL_URL || 'http://localhost:5175/';

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

export const tapScale = {
  scale: 0.95,
};
