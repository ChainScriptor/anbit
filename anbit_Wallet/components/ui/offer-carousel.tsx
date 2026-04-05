import * as React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Offer {
  id: string | number;
  imageSrc: string;
  imageAlt: string;
  tag: string;
  title: string;
  description: string;
  brandLogoSrc: string;
  brandName: string;
  promoCode?: string;
  href: string;
}

interface OfferCardProps {
  offer: Offer;
  mutedTextClassName?: string;
}

const OfferCard = React.forwardRef<HTMLAnchorElement, OfferCardProps>(
  ({ offer, mutedTextClassName = "text-anbit-muted" }, ref) => (
  <motion.a
    ref={ref}
    href={offer.href}
    className="relative flex-shrink-0 w-[280px] sm:w-[300px] h-[360px] sm:h-[380px] rounded-2xl overflow-hidden group snap-start border border-anbit-border bg-anbit-card"
    whileHover={{ y: -8 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    style={{ perspective: "1000px" }}
  >
    <img
      src={offer.imageSrc}
      alt={offer.imageAlt}
      className="absolute top-0 left-0 right-0 h-1/2 w-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-anbit-card p-5 flex flex-col justify-between border-t border-anbit-border">
      <div className="space-y-2">
        <div className={cn("flex items-center text-xs", mutedTextClassName)}>
          <Tag className="w-4 h-4 mr-2 text-anbit-yellow" />
          <span>{offer.tag}</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-anbit-text leading-tight">{offer.title}</h3>
        <p className={cn("text-sm line-clamp-2", mutedTextClassName)}>{offer.description}</p>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-anbit-border">
        <div className="flex items-center gap-3 min-w-0">
          <img src={offer.brandLogoSrc} alt="" className="w-8 h-8 rounded-full bg-anbit-bg object-cover shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-anbit-text truncate">{offer.brandName}</p>
            {offer.promoCode && (
              <p className={cn("text-xs truncate", mutedTextClassName)}>{offer.promoCode}</p>
            )}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-anbit-border flex items-center justify-center text-anbit-text shrink-0 transform transition-transform duration-300 group-hover:rotate-[-45deg] group-hover:bg-anbit-yellow group-hover:text-anbit-yellow-content">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  </motion.a>
  )
);
OfferCard.displayName = "OfferCard";

export interface OfferCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  offers: Offer[];
  /** Small secondary text (default: text-anbit-muted / #71717a) */
  mutedTextClassName?: string;
}

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
      <div ref={ref} className={cn("relative w-full group", className)} {...props}>
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute top-1/2 -translate-y-1/2 left-0 z-10 w-10 h-10 rounded-full bg-anbit-card/80 backdrop-blur-sm border border-anbit-border flex items-center justify-center text-anbit-text opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-anbit-yellow hover:text-anbit-yellow-content hover:border-anbit-yellow"
          aria-label="Προηγούμενη"
        >
          <ChevronLeft className="w-6 h-6" />
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
          className="absolute top-1/2 -translate-y-1/2 right-0 z-10 w-10 h-10 rounded-full bg-anbit-card/80 backdrop-blur-sm border border-anbit-border flex items-center justify-center text-anbit-text opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-anbit-yellow hover:text-anbit-yellow-content hover:border-anbit-yellow"
          aria-label="Επόμενη"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    );
  }
);
OfferCarousel.displayName = "OfferCarousel";

export { OfferCarousel, OfferCard };
