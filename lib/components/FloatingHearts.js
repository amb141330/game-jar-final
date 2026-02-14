'use client';

import { useMemo } from 'react';

export default function FloatingHearts({ color }) {
  const hearts = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${1.2 + Math.random() * 1.5}rem`,
      delay: `${Math.random() * 15}s`,
      duration: `${12 + Math.random() * 10}s`,
    })), []);

  return (
    <div className="hearts-bg" aria-hidden="true">
      {hearts.map(h => (
        <span
          key={h.id}
          className="heart"
          style={{
            left: h.left,
            fontSize: h.size,
            animationDelay: h.delay,
            animationDuration: h.duration,
            color: color || undefined,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}
