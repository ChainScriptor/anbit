import React from 'react';

export type AnbitWordmarkProps = {
  /** Μέγεθος / χρώμα (π.χ. `text-white text-2xl`) */
  className?: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p';
};

/** Omnes Bold Italic (AnbitFont) — ίδιο στυλ για wordmark και σχετικά labels (π.χ. Checkout) */
export const ANBIT_DISPLAY_FONT =
  'font-anbit font-normal not-italic normal-case tracking-tight leading-none [font-synthesis:none]';

const base = ANBIT_DISPLAY_FONT;

/**
 * Λέξη-λογότυπο «Anbit» με Omnes Bold Italic (@font-face AnbitFont).
 * Χωρίς faux bold/italic από το browser.
 */
export const AnbitWordmark: React.FC<AnbitWordmarkProps> = ({
  className = '',
  as: Component = 'span',
}) => (
  <Component className={[base, 'anbit-wordmark', className].filter(Boolean).join(' ')}>Anbit</Component>
);

export default AnbitWordmark;
