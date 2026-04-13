import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useTheme } from "../../context/ThemeContext";

export interface Offer {
  id: string | number;
  imageSrc: string;
  imageAlt: string;
  tag: string;
  title: string;
  description: string;
  brandLogoSrc?: string;
  brandName?: string;
  promoCode?: string;
  href: string;
}

interface OfferCardProps {
  offer: Offer;
  mutedTextClassName?: string;
  /** Shell + κάτω πάνελ (προεπιλογή: bg-anbit-card) */
  cardClassName?: string;
  /** /quests deals: light → λευκό κέλυφος + σκούρο κείμενο, CTA #0a0a0a */
  questsDealSurface?: boolean;
}

const OfferCard = React.forwardRef<HTMLDivElement, OfferCardProps>(function OfferCard(
  { offer, mutedTextClassName = "text-anbit-muted", cardClassName = "bg-anbit-card", questsDealSurface = false },
  ref,
) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const lightDeals = questsDealSurface && theme === "light";
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative flex h-[360px] w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border group sm:h-[380px] sm:w-[300px]",
        lightDeals ? "border-zinc-200" : "border-anbit-border",
        cardClassName,
      )}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ perspective: "1000px" }}
    >
      <div className="relative h-1/2 w-full shrink-0 overflow-hidden">
        <img
          src={offer.imageSrc}
          alt={offer.imageAlt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div
        className={cn(
          "flex h-1/2 min-h-0 flex-col border-t p-5",
          lightDeals ? "border-zinc-200" : "border-anbit-border",
          cardClassName,
        )}
      >
        <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
          <div
            className={cn(
              "flex items-center text-xs",
              lightDeals ? "text-neutral-600" : mutedTextClassName,
            )}
          >
            <Tag className={cn("mr-2 h-4 w-4 shrink-0", lightDeals ? "text-[#0a0a0a]" : "text-anbit-yellow")} />
            <span>{offer.tag}</span>
          </div>
          <h3
            className={cn(
              "text-lg font-semibold leading-tight sm:text-xl",
              lightDeals ? "text-neutral-900" : "text-anbit-text",
            )}
          >
            {offer.title}
          </h3>
          <p className={cn("line-clamp-2 text-sm", lightDeals ? "text-neutral-600" : mutedTextClassName)}>
            {offer.description}
          </p>
          {offer.promoCode ? (
            <p className={cn("truncate font-mono text-xs", lightDeals ? "text-neutral-500" : mutedTextClassName)}>
              {offer.promoCode}
            </p>
          ) : null}
        </div>
        <a
          href={offer.href}
          className={cn(
            "mt-4 flex w-full shrink-0 items-center justify-center rounded-lg py-2.5 text-sm font-semibold transition-colors",
            lightDeals
              ? "bg-[#0a0a0a] text-white hover:bg-[#171717]"
              : "bg-anbit-brand text-anbit-brand-foreground hover:bg-anbit-brand-hover",
          )}
        >
          {t("claimOffer")}
        </a>
      </div>
    </motion.div>
  );
});
OfferCard.displayName = "OfferCard";

export interface OfferCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  offers: Offer[];
  /** Small secondary text (default: text-anbit-muted / #71717a) */
  mutedTextClassName?: string;
  /** Πέρασμα σε κάθε OfferCard (π.χ. bg-[#131313] στο /quests) */
  cardClassName?: string;
  questsDealSurface?: boolean;
}

/** Κοινό κέλυφος με το carousel «Προσφορές της ημέρας» — parent χρειάζεται `group`. Κρυφά κάτω από `sm` (mobile = μόνο swipe). */
export const offerCarouselNavButtonClass =
  "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-anbit-border bg-anbit-card/80 text-anbit-text opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:border-anbit-brand/30 hover:bg-anbit-brand/[0.08] sm:flex";

const questsDealNavLight =
  "border-zinc-200 bg-white/95 text-neutral-900 hover:border-[#0a0a0a]/25 hover:bg-[#0a0a0a]/[0.06]";

const OfferCarousel = React.forwardRef<HTMLDivElement, OfferCarouselProps>(
  (
    { offers, className, mutedTextClassName = "text-anbit-muted", cardClassName, questsDealSurface, ...props },
    ref,
  ) => {
    const { theme } = useTheme();
    const navLight = questsDealSurface && theme === "light";
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const { current } = scrollContainerRef;
        const scrollAmount = current.clientWidth * 0.8;
        current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    };

    return (
      <div ref={ref} className={cn("group relative w-full", className)} {...props}>
        <button
          type="button"
          onClick={() => scroll("left")}
          className={cn(offerCarouselNavButtonClass, navLight && questsDealNavLight, "left-0")}
          aria-label="Προηγούμενη"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              mutedTextClassName={mutedTextClassName}
              cardClassName={cardClassName}
              questsDealSurface={questsDealSurface}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scroll("right")}
          className={cn(offerCarouselNavButtonClass, navLight && questsDealNavLight, "right-0")}
          aria-label="Επόμενη"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    );
  }
);
OfferCarousel.displayName = "OfferCarousel";

export { OfferCarousel, OfferCard };
