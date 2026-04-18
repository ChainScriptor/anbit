import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageSquare,
  Play,
  Search,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────
type FaqItem = { q: string; a: string };
type FaqSection = { category: string; icon: React.FC<{ className?: string }>; items: FaqItem[] };

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_SECTIONS: FaqSection[] = [
  {
    category: 'Παραγγελίες',
    icon: ShieldCheck,
    items: [
      {
        q: 'Πώς δέχομαι μια νέα παραγγελία;',
        a: 'Στη σελίδα "Orders Line" εμφανίζονται αυτόματα οι νέες παραγγελίες στη στήλη "Incoming". Πάτησε "Αποδοχή" για να τις μετακινήσεις στο "In Progress".',
      },
      {
        q: 'Μπορώ να απορρίψω μια παραγγελία;',
        a: 'Ναι. Στην κάρτα της παραγγελίας υπάρχει κουμπί "Απόρριψη". Η παραγγελία μετακινείται αυτόματα και ο πελάτης ενημερώνεται.',
      },
      {
        q: 'Πώς λειτουργεί το κουδούνι ήχου για νέες παραγγελίες;',
        a: 'Στη σελίδα Orders Line υπάρχει κουμπί με το εικονίδιο κουδουνιού επάνω δεξιά. Κάνε κλικ για ενεργοποίηση/απενεργοποίηση. Ο ήχος παίζεται μόνο μετά από κάποια αλληλεπίδραση με τη σελίδα λόγω περιορισμών του browser.',
      },
      {
        q: 'Τι γίνεται με παραγγελίες τραπεζιού που έχουν πολλές ξεχωριστές παραγγελίες;',
        a: 'Οι παραγγελίες ίδιου τραπεζιού συγχωνεύονται αυτόματα στη στήλη "In Progress" με έναν ενιαίο counter. Η ολοκλήρωση ολοκληρώνει όλες τις παραγγελίες του τραπεζιού μαζί.',
      },
    ],
  },
  {
    category: 'Προϊόντα & Menu',
    icon: BookOpen,
    items: [
      {
        q: 'Πώς προσθέτω νέο προϊόν στο menu;',
        a: 'Πήγαινε στο "Manage Dish" → κουμπί "Add Product" επάνω δεξιά. Συμπλήρωσε όνομα, κατηγορία, τιμή, XP reward και ανέβασε εικόνα. Το προϊόν αποθηκεύεται στον server.',
      },
      {
        q: 'Πώς φτιάχνω επιλογές (π.χ. ζάχαρη καφέ, αφαίρεση υλικών);',
        a: 'Στο "Manage Dish" → tab "Options". Δημιούργησε ομάδα τύπου Radio (μία επιλογή, π.χ. ζάχαρη) ή Extras/Αφαίρεση (πολλαπλές επιλογές). Ανάθεσε την ομάδα σε προϊόντα ή κατηγορίες.',
      },
      {
        q: 'Μπορώ να μετονομάσω μια κατηγορία;',
        a: 'Ναι. Στο "Manage Dish" → tab "Κατηγορίες" → κουμπί "Μετονομασία" δίπλα στην κατηγορία. Η μετονομασία ενημερώνει αυτόματα όλα τα προϊόντα που ανήκουν σε αυτή.',
      },
    ],
  },
  {
    category: 'Offers & Προσφορές',
    icon: Zap,
    items: [
      {
        q: 'Πώς φτιάχνω μια προσφορά με έκπτωση;',
        a: 'Πήγαινε στο "Offers" → tab "Offers" → φόρμα "Νέα Προσφορά". Συμπλήρωσε τίτλο, τιμή πριν/μετά, XP και άνοιξε την ενότητα "Εφαρμογή % Έκπτωσης" για να επιλέξεις προϊόντα ή κατηγορίες.',
      },
      {
        q: 'Τι είναι τα Day Streaks;',
        a: 'Τα Day Streaks είναι προσφορές που ενθαρρύνουν τους πελάτες να παραγγέλνουν ένα συγκεκριμένο προϊόν για Ν συνεχόμενες μέρες και να κερδίζουν XP. Μπορείς να τα δημιουργήσεις στο "Offers" → tab "Day Streaks".',
      },
      {
        q: 'Πώς λειτουργεί το χρονικό όριο προσφοράς;',
        a: 'Κατά τη δημιουργία προσφοράς, ενεργοποίησε την επιλογή "Χρονικό Όριο" και ορίσε ημερομηνία/ώρα λήξης. Η προσφορά απενεργοποιείται αυτόματα στη λήξη.',
      },
    ],
  },
];

// ─── Guide steps ──────────────────────────────────────────────────────────────
const QUICK_START = [
  { step: 1, title: 'Πρόσθεσε τα προϊόντα σου', desc: 'Manage Dish → Add Product', color: 'bg-blue-100 text-blue-700' },
  { step: 2, title: 'Δημιούργησε κατηγορίες', desc: 'Manage Dish → Κατηγορίες', color: 'bg-purple-100 text-purple-700' },
  { step: 3, title: 'Ρύθμισε options', desc: 'Manage Dish → Options', color: 'bg-amber-100 text-amber-700' },
  { step: 4, title: 'Δημοσίευσε προσφορές', desc: 'Offers → Νέα Προσφορά', color: 'bg-emerald-100 text-emerald-700' },
  { step: 5, title: 'Ξεκίνα να δέχεσαι παραγγελίες', desc: 'Orders Line → Live Feed', color: 'bg-red-100 text-red-700' },
];

// ─── Accordion item ───────────────────────────────────────────────────────────
function AccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-800">{item.q}</span>
        <ChevronDown className={cn('mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm leading-relaxed text-slate-600">
          {item.a}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const Help: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? FAQ_SECTIONS.map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (item) =>
            item.q.toLowerCase().includes(search.toLowerCase()) ||
            item.a.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter((sec) => sec.items.length > 0)
    : FAQ_SECTIONS;

  return (
    <div className="mx-auto max-w-4xl space-y-8 text-slate-900">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-8 md:px-10 md:py-10"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)' }}
      >
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
            <HelpCircle className="h-3.5 w-3.5" />
            Help Center
          </div>
          <h1 className="font-anbit-display text-2xl font-bold text-white md:text-3xl">
            Πώς μπορούμε να βοηθήσουμε;
          </h1>
          <p className="mt-2 max-w-lg text-sm text-white/70">
            Βρες γρήγορα απαντήσεις, οδηγούς χρήσης και υποστήριξη για το Anbit Merchant Dashboard.
          </p>

          {/* Search */}
          <div className="relative mt-5 max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Αναζήτηση σε FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border-0 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-12 right-24 h-32 w-32 rounded-full bg-white/5" />
      </div>

      {/* Quick Start Guide */}
      {!search && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <Play className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Quick Start Guide</h2>
              <p className="text-xs text-slate-400">5 βήματα για να ξεκινήσεις</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-px bg-slate-100 sm:grid-cols-5">
            {QUICK_START.map((s) => (
              <div key={s.step} className="flex flex-col gap-2 bg-white p-4 sm:items-center sm:text-center">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold', s.color)}>
                  {s.step}
                </div>
                <p className="text-xs font-semibold text-slate-800">{s.title}</p>
                <p className="text-[11px] text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Sections */}
      <div className="space-y-5">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <HelpCircle className="mb-3 h-10 w-10 text-slate-200" />
            <p className="font-semibold text-slate-400">Δεν βρέθηκαν αποτελέσματα</p>
            <p className="mt-1 text-xs text-slate-300">Δοκίμασε διαφορετικές λέξεις</p>
          </div>
        )}
        {filtered.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.category} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
                <h3 className="font-semibold text-slate-900">{section.category}</h3>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {section.items.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {section.items.map((item) => (
                  <React.Fragment key={item.q}>
                    <AccordionItem item={item} />
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Support cards */}
      {!search && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: MessageSquare,
              title: 'Live Chat',
              desc: 'Μίλησε με την ομάδα μας άμεσα',
              action: 'Έναρξη Chat',
              color: 'bg-blue-50 text-blue-700',
              btnColor: 'bg-blue-600 hover:bg-blue-700',
            },
            {
              icon: Mail,
              title: 'Email Support',
              desc: 'support@anbit.gr · Απάντηση εντός 24ω',
              action: 'Αποστολή email',
              color: 'bg-emerald-50 text-emerald-700',
              btnColor: 'bg-emerald-600 hover:bg-emerald-700',
            },
            {
              icon: LifeBuoy,
              title: 'Documentation',
              desc: 'Πλήρης τεκμηρίωση API και οδηγοί',
              action: 'Προβολή docs',
              color: 'bg-purple-50 text-purple-700',
              btnColor: 'bg-purple-600 hover:bg-purple-700',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl', card.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-900">{card.title}</h4>
                <p className="mt-1 flex-1 text-xs text-slate-500">{card.desc}</p>
                <button
                  type="button"
                  className={cn('mt-4 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-white transition', card.btnColor)}
                >
                  {card.action}
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Help;
