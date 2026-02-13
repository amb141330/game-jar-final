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
 * 200 books/row × ~15px avg = ~3000px per set, doubled = ~6000px.
 * Covers any screen up to 3000px wide (ultra-wide monitors).
 */
export default function ShelfBackground({ tintFrom, tintTo }) {
  const shelves = useMemo(() => [
    genBooks(200), genBooks(200), genBooks(200), genBooks(200),
  ], []);

  return (
    <div className="shelf-bg" aria-hidden="true">
      {tintFrom && <div className="shelf-tint" style={{
        background: `linear-gradient(180deg, ${tintFrom}, ${tintTo})`,
      }}/>}
      {shelves.map((books, ri) => (
        <div key={ri} className={`shelf-row shelf-row-${ri + 1}`}>
          {[...books, ...books].map((b, bi) => (
            <div key={bi} className="shelf-book" style={{
              backgroundColor: b.color, height: b.h, width: b.w, opacity: 0.5,
            }}/>
          ))}
        </div>
      ))}
    </div>
  );
}
