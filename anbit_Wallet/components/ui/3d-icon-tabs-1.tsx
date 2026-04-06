"use client";

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
        {items.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={cn(
              "relative shrink-0 px-2 pb-3 tracking-[0.01em] cursor-pointer focus-visible:outline-1 focus-visible:ring-1 focus-visible:outline-none flex items-center",
              activeId === tab.id
                ? "text-anbit-text"
                : "text-anbit-muted"
            )}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {activeId === tab.id && (
              <span className="absolute bottom-0 w-full left-0 z-10 bg-black dark:bg-white rounded-full h-[2px]" />
            )}
            <div className="relative">
              <span
                className="text-base sm:text-lg font-semibold whitespace-nowrap"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {tab.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { IconTabs3D };
