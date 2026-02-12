'use client';

import { useMemo } from 'react';

const heartChars = ['♥', '♡', '❤', '💕'];

export default function FloatingHearts() {
  const hearts = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      char: heartChars[i % heartChars.length],
      left: `${(i * 7.3 + 3) % 100}%`,
      duration: `${15 + (i * 3.7) % 20}s`,
      delay: `${(i * 2.1) % 12}s`,
      fontSize: `${0.8 + (i % 4) * 0.3}rem`,
    }));
  }, []);

  return (
    <div className="hearts-bg" aria-hidden="true">
      {hearts.map(h => (
        <span
          key={h.id}
          className="heart"
          style={{
            left: h.left,
            animationDuration: h.duration,
            animationDelay: h.delay,
            fontSize: h.fontSize,
          }}
        >
          {h.char}
        </span>
      ))}
    </div>
  );
}
