"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

export type ProfileTabItem = {
  id: string;
  label: string;
};

type IconTabs3DProps = {
  className?: string;
  items: ProfileTabItem[];
  activeId: string;
  onSelect: (id: string) => void;
};

function IconTabs3D({ className, items, activeId, onSelect }: IconTabs3DProps) {
  return (
    <div className="w-full overflow-x-auto pt-1 pb-0 anbit-tabs-scrollbar">
      <div className={cn("inline-flex min-w-max items-center gap-6 sm:gap-8 rounded-full", className)}>
        {items.map((tab, index) => (
          <motion.button
            key={tab.id}
            whileTap={"tapped"}
            whileHover={"hovered"}
            onClick={() => onSelect(tab.id)}
            className={cn(
              "relative shrink-0 px-2 pb-3 tracking-[0.01em] cursor-pointer transition focus-visible:outline-1 focus-visible:ring-1 focus-visible:outline-none flex items-center",
              activeId === tab.id
                ? "text-anbit-text"
                : "text-anbit-muted hover:text-anbit-text"
            )}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {activeId === tab.id && (
              <motion.span
                layoutId="bubble"
                className="absolute bottom-0 w-full left-0 z-10 bg-black dark:bg-white rounded-full h-[2px]"
                transition={{ type: "spring", bounce: 0.19, duration: 0.4 }}
              />
            )}
            <motion.div
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                transition: {
                  type: "spring",
                  bounce: 0.2,
                  damping: 7,
                  duration: 0.4,
                  delay: index * 0.1,
                },
              }}
              variants={{
                default: { scale: 1 },
                ...(activeId !== tab.id && { hovered: { scale: 1.1 } }),
                ...(activeId !== tab.id && {
                  tapped: {
                    scale: 0.8,
                    transition: {
                      type: "spring",
                      bounce: 0.2,
                      damping: 7,
                      duration: 0.4,
                    },
                  },
                }),
              }}
              className="relative"
              transition={{ type: "spring" }}
            >
              <span className="font-anbit text-base sm:text-lg font-extrabold italic whitespace-nowrap">
                {tab.label}
              </span>
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export { IconTabs3D };
