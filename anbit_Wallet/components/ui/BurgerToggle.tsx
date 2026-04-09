import React from "react";

import { Button } from "@/components/ui/button";

export interface BurgerToggleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

// Burger icon that animates between "menu" and "close" using aria-expanded.
export function BurgerToggle({ open, onOpenChange, className }: BurgerToggleProps) {
  return (
    <Button
      className={[
        "group",
        // Overrides so it works with the anbit_Wallet Tailwind theme (uses anbit-* colors).
        "bg-white/[0.03] border border-anbit-border text-white hover:text-white hover:bg-anbit-border/40",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      variant="outline"
      size="icon"
      onClick={() => onOpenChange(!open)}
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
    >
      <svg
        className="pointer-events-none"
        width={16}
        height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 12L20 12"
          className="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
        />
        <path
          d="M4 12H20"
          className="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
        />
        <path
          d="M4 12H20"
          className="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
        />
      </svg>
    </Button>
  );
}

