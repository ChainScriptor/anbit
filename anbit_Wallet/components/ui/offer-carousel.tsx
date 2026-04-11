import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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
}

const OfferCard = React.forwardRef<HTMLDivElement, OfferCardProps>(function OfferCard(
  { offer, mutedTextClassName = "text-anbit-muted" },
  ref,
) {
  const { t } = useTranslation();
  return (
    <motion.div
      ref={ref}
      className="relative flex h-[360px] w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-anbit-border bg-anbit-card group sm:h-[380px] sm:w-[300px]"
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ perspective: "1000px" }}
    >
      <div className="relative h-1/2 w-full shrink-0 overflow-hidden">
        <img
          src={offer.imageSrc}
          alt={offer.imageAlt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex h-1/2 min-h-0 flex-col border-t border-anbit-border bg-anbit-card p-5">
        <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
          <div className={cn("flex items-center text-xs", mutedTextClassName)}>
            <Tag className="mr-2 h-4 w-4 shrink-0 text-anbit-yellow" />
            <span>{offer.tag}</span>
          </div>
          <h3 className="text-lg font-bold leading-tight text-anbit-text sm:text-xl">{offer.title}</h3>
          <p className={cn("line-clamp-2 text-sm", mutedTextClassName)}>{offer.description}</p>
          {offer.promoCode ? (
            <p className={cn("truncate font-mono text-xs", mutedTextClassName)}>{offer.promoCode}</p>
          ) : null}
        </div>
        <a
          href={offer.href}
          className="mt-4 flex w-full shrink-0 items-center justify-center rounded-lg bg-[#e63533] py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#cf2f2d]"
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
}

/** Κοινό κέλυφος με το carousel «Προσφορές της ημέρας» — parent χρειάζεται `group`. Κρυφά κάτω από `sm` (mobile = μόνο swipe). */
export const offerCarouselNavButtonClass =
  "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-anbit-border bg-anbit-card/80 text-anbit-text opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 hover:border-anbit-yellow hover:bg-anbit-yellow hover:text-anbit-yellow-content sm:flex";

const OfferCarousel = React.forwardRef<HTMLDivElement, OfferCarouselProps>(
  ({ offers, className, mutedTextClassName = "text-anbit-muted", ...props }, ref) => {
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
          className={cn(offerCarouselNavButtonClass, "left-0")}
          aria-label="Προηγούμενη"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
        >
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} mutedTextClassName={mutedTextClassName} />
          ))}
        </div>
        <button
          type="button"
          onClick={() => scroll("right")}
          className={cn(offerCarouselNavButtonClass, "right-0")}
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
