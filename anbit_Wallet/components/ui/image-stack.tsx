'use client';

import { useRef, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';

interface Card {
  id: number;
  src: string;
  zIndex: number;
}

interface ImgStackProps {
  images: string[];
}

export default function ImgStack({ images }: ImgStackProps) {
  const [cards, setCards] = useState<Card[]>(
    images.map((src, index) => ({
      id: index,
      src,
      zIndex: 3 - index,
    }))
  );
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const minDragDistance = 50;

  const getCardStyles = (index: number) => {
    const baseRotation = 2;
    const rotationIncrement = 3;
    const offsetIncrement = -12;
    const verticalOffset = -8;

    return {
      x: index * offsetIncrement,
      y: index * verticalOffset,
      rotate: index === 0 ? 0 : -(baseRotation + index * rotationIncrement),
      scale: 1,
      transition: { duration: 0.5 },
    };
  };

  const handleDragStart = (_: unknown, info: PanInfo) => {
    dragStartPos.current = { x: info.point.x, y: info.point.y };
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const dragDistance = Math.sqrt(
      (info.point.x - dragStartPos.current.x) ** 2 +
        (info.point.y - dragStartPos.current.y) ** 2
    );

    if (isAnimating || dragDistance < minDragDistance) return;

    setIsAnimating(true);

    setCards((prevCards) => {
      const newCards = [...prevCards];
      const cardToMove = newCards.shift();
      if (!cardToMove) return prevCards;
      newCards.push(cardToMove);

      return newCards.map((card, index) => ({
        ...card,
        zIndex: 3 - index,
      }));
    });

    setTimeout(() => setIsAnimating(false), 300);
  };

  const closePreview = () => setActiveImage(null);
  const openTopCardPreview = () => {
    const topCard = cards[0];
    if (topCard) setActiveImage(topCard.src);
  };

  return (
    <div className="relative z-0 my-8 flex h-[22rem] w-full max-w-sm items-center justify-center sm:h-[26rem] sm:max-w-md">
      {cards.map((card, index) => {
        const isTopCard = index === 0;
        const cardStyles = getCardStyles(index);
        const canDrag = isTopCard && !isAnimating;

        return (
          <motion.div
            key={card.id}
            className="absolute w-64 origin-bottom overflow-hidden rounded-2xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] shadow-xl cursor-grab active:cursor-grabbing sm:w-72"
            style={{ zIndex: card.zIndex, aspectRatio: '5/7' }}
            animate={cardStyles}
            drag={canDrag}
            dragElastic={0.2}
            dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
            dragSnapToOrigin
            dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            whileHover={
              isTopCard
                ? {
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }
                : {}
            }
            whileDrag={{
              scale: 1.1,
              rotate: 0,
              zIndex: 4,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              transition: { duration: 0.1 },
            }}
          >
            <img
              src={card.src}
              alt={`Menu card ${card.id + 1}`}
              className="h-full w-full rounded-xl object-cover pointer-events-none"
              draggable={false}
            />
          </motion.div>
        );
      })}

      <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
        <button
          type="button"
          onClick={openTopCardPreview}
          className="rounded-xl border border-[color:var(--anbit-border)] bg-[color:var(--anbit-card)] px-4 py-2 text-xs font-semibold text-[color:var(--anbit-text)] shadow-sm transition hover:bg-[color:var(--anbit-input)]"
        >
          Προβολή μεγάλης εικόνας
        </button>
      </div>

      {activeImage && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closePreview}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-h-[92vh] w-full max-w-5xl rounded-2xl border border-white/20 bg-black/20 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closePreview}
              className="absolute right-3 top-3 z-10 rounded-lg bg-black/70 px-3 py-1 text-xs font-semibold text-white hover:bg-black"
            >
              Close
            </button>
            <img
              src={activeImage}
              alt="Menu preview"
              className="max-h-[86vh] w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
