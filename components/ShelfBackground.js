'use client';

import { useMemo } from 'react';

const bookColors = [
  '#E8A0BF','#D4728C','#9B4D6E','#C9A96E','#7BAACC','#A5C8A1','#D4A0D9','#E8C87B',
  '#8BBDD9','#C49898','#B8D4A8','#D9B0C4','#A8C4D4','#E8B898','#98B8D4','#C8A8D8',
  '#D8C898','#A8D8C8','#D89898','#98D8A8',
];

function genBooks(n) {
  return Array.from({ length: n }, (_, i) => ({
    color: bookColors[i % bookColors.length],
    h: 28 + Math.random() * 32,
    w: 10 + Math.random() * 10,
  }));
}

/**
 * Infinite scrolling bookshelf background.
 *
 * Each row renders 120 books (~1800px), doubled in the DOM for seamless looping
 * (~3600px total). The animation scrolls exactly 50% — the width of one set —
 * so the loop is invisible. Works on any viewport up to ~1800px wide.
 *
 * @param tintFrom - optional top color for background gradient tint
 * @param tintTo   - optional bottom color for background gradient tint
 * The tint renders BEHIND the book rows, so shelves are always visible.
 */
export default function ShelfBackground({ tintFrom, tintTo }) {
  const shelves = useMemo(() => [
    genBooks(120), genBooks(120), genBooks(120), genBooks(120),
  ], []);

  return (
    <div className="shelf-bg" aria-hidden="true">
      {/* Color tint layer — sits behind books at z-index 0 */}
      {tintFrom && (
        <div className="shelf-tint" style={{
          background: `linear-gradient(180deg, ${tintFrom}, ${tintTo})`,
        }}/>
      )}
      {shelves.map((books, ri) => (
        <div key={ri} className={`shelf-row shelf-row-${ri + 1}`}>
          {[...books, ...books].map((b, bi) => (
            <div key={bi} className="shelf-book" style={{
              backgroundColor: b.color,
              height: b.h,
              width: b.w,
              opacity: 0.5,
            }}/>
          ))}
        </div>
      ))}
    </div>
  );
}
