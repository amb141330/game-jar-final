'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FloatingHearts from '@/components/FloatingHearts';

const fingerEmojis = ['🩷', '💜', '💙', '🩵', '💚', '💛', '🧡', '❤️'];

export default function FirstPlayerPage() {
  const router = useRouter();
  const [fingers, setFingers] = useState({});
  const [phase, setPhase] = useState('waiting');
  const [countdown, setCountdown] = useState(3);
  const [winnerId, setWinnerId] = useState(null);
  const countdownTimer = useRef(null);
  const stabilityTimer = useRef(null);
  const colorCounter = useRef(0);

  const clearTimers = useCallback(() => {
    if (countdownTimer.current) { clearInterval(countdownTimer.current); countdownTimer.current = null; }
    if (stabilityTimer.current) { clearTimeout(stabilityTimer.current); stabilityTimer.current = null; }
  }, []);

  const startStabilityTimer = useCallback((fingerCount) => {
    if (stabilityTimer.current) clearTimeout(stabilityTimer.current);
    if (fingerCount < 2) {
      setPhase('waiting'); setCountdown(3); clearTimers(); return;
    }
    stabilityTimer.current = setTimeout(() => {
      setPhase('countdown'); setCountdown(3);
      let count = 3;
      countdownTimer.current = setInterval(() => {
        count--;
        setCountdown(count);
        if (count <= 0) { clearInterval(countdownTimer.current); countdownTimer.current = null; setPhase('picking'); }
      }, 1000);
    }, 3000);
  }, [clearTimers]);

  useEffect(() => {
    if (phase === 'picking') {
      setFingers(prev => {
        const ids = Object.keys(prev);
        if (ids.length === 0) return prev;
        setWinnerId(ids[Math.floor(Math.random() * ids.length)]);
        setPhase('done');
        return prev;
      });
    }
  }, [phase]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    if (phase === 'done') {
      setPhase('waiting'); setWinnerId(null); setFingers({}); setCountdown(3);
      colorCounter.current = 0; clearTimers(); return;
    }
    const newFingers = {};
    for (const touch of e.changedTouches) {
      newFingers[touch.identifier] = { x: touch.clientX, y: touch.clientY, colorIndex: colorCounter.current++ % fingerEmojis.length };
    }
    setFingers(prev => {
      const updated = { ...prev, ...newFingers };
      if (phase === 'countdown') { clearTimers(); setPhase('waiting'); setCountdown(3); }
      startStabilityTimer(Object.keys(updated).length);
      return updated;
    });
  }, [phase, clearTimers, startStabilityTimer]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (phase === 'done') return;
    setFingers(prev => {
      const updated = { ...prev };
      for (const touch of e.changedTouches) {
        if (updated[touch.identifier]) updated[touch.identifier] = { ...updated[touch.identifier], x: touch.clientX, y: touch.clientY };
      }
      return updated;
    });
  }, [phase]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    if (phase === 'done') return;
    setFingers(prev => {
      const updated = { ...prev };
      for (const touch of e.changedTouches) delete updated[touch.identifier];
      if (phase === 'countdown') { clearTimers(); setPhase('waiting'); setCountdown(3); }
      startStabilityTimer(Object.keys(updated).length);
      return updated;
    });
  }, [phase, clearTimers, startStabilityTimer]);

  useEffect(() => { return () => clearTimers(); }, [clearTimers]);

  const fingerCount = Object.keys(fingers).length;
  const getInstruction = () => {
    if (phase === 'done') return 'Tap anywhere to play again!';
    if (phase === 'countdown') return 'Hold still...';
    if (fingerCount === 0) return 'Everyone place a finger on the screen!';
    if (fingerCount === 1) return 'Need at least 2 fingers!';
    return `${fingerCount} players ready! Hold still...`;
  };

  const goBack = () => {
    router.push('/');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'linear-gradient(180deg, #FFF8F0, #FFE4E1)' }}>
      <FloatingHearts />

      {/* Touch arena fills the screen */}
      <div
        className="touch-arena"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className="instruction">{getInstruction()}</div>

        {phase === 'countdown' && (
          <div className="countdown" key={countdown}>{countdown}</div>
        )}

        {Object.entries(fingers).map(([id, finger]) => {
          const isWinner = phase === 'done' && id === winnerId;
          const isLoser = phase === 'done' && id !== winnerId;
          return (
            <div key={id}
              className={`finger-dot ${isWinner ? 'winner' : isLoser ? 'loser' : 'waiting'}`}
              style={{ left: finger.x, top: finger.y }}>
              {isWinner ? '👑' : fingerEmojis[finger.colorIndex]}
            </div>
          );
        })}
      </div>

      {/* Back button is OUTSIDE the touch arena - rendered on top with its own z-index */}
      <button
        className="touch-back-btn"
        onPointerDown={(e) => { e.stopPropagation(); }}
        onClick={(e) => { e.stopPropagation(); goBack(); }}
        onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); goBack(); }}
      >
        ← Back to Jar
      </button>
    </div>
  );
}
