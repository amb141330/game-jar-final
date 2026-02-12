'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FloatingHearts from '@/components/FloatingHearts';
import BottomNav from '@/components/BottomNav';
import {
  getCollection,
  getFavorites,
  getUniqueTags,
  filterGames,
} from '@/lib/gameStore';

const paperColors = [
  'var(--paper-cream)',
  'var(--paper-pink)',
  'var(--paper-lavender)',
  'var(--paper-mint)',
  'var(--paper-yellow)',
];

// Tags that should appear as quick-access pills (in order)
const PINNED_TAGS = [
  'Never Played',
  'Most Played',
  '♥ Favorites',
  'Cooperative',
  'Cozy',
  '2 Player Friendly',
  'Quick Game',
  'Solo-able',
  'Family Friendly',
  'Heavy',
];

export default function JarPage() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [allTags, setAllTags] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [drawnGame, setDrawnGame] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [showMoreTags, setShowMoreTags] = useState(false);
  const jarRef = useRef(null);

  useEffect(() => {
    const collection = getCollection();
    const favs = getFavorites();
    setGames(collection);
    setFavorites(favs);
    setAllTags(getUniqueTags(collection));
  }, []);

  useEffect(() => {
    setFilteredGames(filterGames(games, activeTags, favorites));
  }, [games, activeTags, favorites]);

  const drawGame = useCallback(() => {
    if (filteredGames.length === 0) return;

    setShaking(true);
    setTimeout(() => setShaking(false), 500);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredGames.length);
      setDrawnGame(filteredGames[randomIndex]);
    }, 400);
  }, [filteredGames]);

  const toggleTag = (tag) => {
    setActiveTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Split tags into pinned (shown as pills) and overflow (in dropdown)
  const pinnedAvailable = PINNED_TAGS.filter(tag =>
    tag === '♥ Favorites' || allTags.some(t => t.tag === tag)
  );
  const overflowTags = allTags
    .filter(t => !PINNED_TAGS.includes(t.tag))
    .map(t => t.tag);

  if (games.length === 0) {
    return (
      <>
        <FloatingHearts />
        <div className="main-content page-enter">
          <div className="app-title" style={{ paddingTop: '60px' }}>
            <h1>Game Night Jar</h1>
            <p className="subtitle">💕 for my favorite player 2 💕</p>
          </div>
          <div className="empty-state">
            <div className="empty-jar">🫙</div>
            <p>The jar is empty! Let&apos;s fill it with your games.</p>
            <button className="btn-primary" onClick={() => router.push('/import')}>
              Import Games
            </button>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <FloatingHearts />
      <div className="main-content page-enter">
        <div className="app-title">
          <h1>Game Night Jar</h1>
          <p className="subtitle">💕 for my favorite player 2 💕</p>
        </div>

        {/* Tag filters */}
        <div className="filter-bar">
          {pinnedAvailable.map(tag => (
            <button
              key={tag}
              className={`filter-pill ${activeTags.includes(tag) ? 'active' : ''}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </button>
          ))}
          {overflowTags.length > 0 && (
            <button
              className={`filter-pill ${showMoreTags ? 'active' : ''}`}
              onClick={() => setShowMoreTags(!showMoreTags)}
              style={{ minWidth: 'auto' }}
            >
              + More
            </button>
          )}
        </div>

        {/* Expanded tag cloud */}
        {showMoreTags && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            padding: '4px 16px 8px',
          }}>
            {overflowTags.map(tag => (
              <button
                key={tag}
                className={`filter-pill ${activeTags.includes(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
                style={{ fontSize: '0.72rem', padding: '4px 10px' }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Active tag summary */}
        {activeTags.length > 0 && (
          <div style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            padding: '0 16px',
          }}>
            <span
              onClick={() => setActiveTags([])}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear all filters
            </span>
          </div>
        )}

        <div className="game-count-badge">
          {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} in jar
        </div>

        {/* The Jar */}
        <div className="jar-section">
          <div
            ref={jarRef}
            className={`jar-container ${shaking ? 'jar-shake' : ''}`}
            onClick={drawGame}
            role="button"
            tabIndex={0}
            aria-label="Tap to draw a game"
            onKeyDown={e => e.key === 'Enter' && drawGame()}
          >
            <div className="jar-lid" />
            <div className="jar-neck" />
            <div className="jar-body">
              <div className="jar-shine" />
              <div className="jar-papers">
                {filteredGames.slice(0, 30).map((game, i) => (
                  <div
                    key={game.id}
                    className="jar-paper-slip"
                    style={{
                      backgroundColor: paperColors[i % paperColors.length],
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="tap-hint">
            {filteredGames.length > 0 ? 'tap the jar to draw a game ♡' : 'no games match these filters'}
          </p>
        </div>
      </div>

      {/* Drawn game overlay */}
      {drawnGame && (
        <div className="drawn-paper-overlay" onClick={() => setDrawnGame(null)}>
          <div className="drawn-paper" onClick={e => e.stopPropagation()}>
            {drawnGame.thumbnail && (
              <img
                src={drawnGame.thumbnail}
                alt={drawnGame.name}
                className="game-image"
              />
            )}
            <h2>{drawnGame.name}</h2>
            <div className="game-meta">
              {drawnGame.year && <span>📅 {drawnGame.year}</span>}
              {drawnGame.minPlayers && drawnGame.maxPlayers && (
                <span>
                  👥 {drawnGame.minPlayers === drawnGame.maxPlayers
                    ? drawnGame.minPlayers
                    : `${drawnGame.minPlayers}–${drawnGame.maxPlayers}`}
                </span>
              )}
              {drawnGame.playingTime && <span>⏱ {drawnGame.playingTime}min</span>}
              {drawnGame.numPlays > 0 && <span>🎲 Played {drawnGame.numPlays}×</span>}
              {drawnGame.numPlays === 0 && <span>✨ Never played!</span>}
            </div>
            {drawnGame.tags?.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                justifyContent: 'center',
                marginTop: '12px',
              }}>
                {drawnGame.tags.filter(t => t !== 'Never Played' && t !== 'Most Played').slice(0, 5).map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: 'var(--blush)',
                      color: 'var(--berry)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="close-hint">tap outside to close</p>
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}
