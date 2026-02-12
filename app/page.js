'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FloatingHearts from '@/components/FloatingHearts';
import BottomNav from '@/components/BottomNav';
import {
  getCollection,
  getFavorites,
  getUniqueCategories,
  filterGames,
} from '@/lib/gameStore';

const paperColors = [
  'var(--paper-cream)',
  'var(--paper-pink)',
  'var(--paper-lavender)',
  'var(--paper-mint)',
  'var(--paper-yellow)',
];

export default function JarPage() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({});
  const [filteredGames, setFilteredGames] = useState([]);
  const [drawnGame, setDrawnGame] = useState(null);
  const [shaking, setShaking] = useState(false);
  const jarRef = useRef(null);

  useEffect(() => {
    const collection = getCollection();
    const favs = getFavorites();
    setGames(collection);
    setFavorites(favs);
    setCategories(getUniqueCategories(collection));
  }, []);

  useEffect(() => {
    setFilteredGames(filterGames(games, filters, favorites));
  }, [games, filters, favorites]);

  const drawGame = useCallback(() => {
    if (filteredGames.length === 0) return;

    setShaking(true);
    setTimeout(() => setShaking(false), 500);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredGames.length);
      setDrawnGame(filteredGames[randomIndex]);
    }, 400);
  }, [filteredGames]);

  const toggleFilter = (key, value) => {
    setFilters(prev => {
      const next = { ...prev };
      if (key === 'category') {
        next.category = prev.category === value ? undefined : value;
      } else {
        next[key] = !prev[key];
      }
      return next;
    });
  };

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

        {/* Filters */}
        <div className="filter-bar">
          <button
            className={`filter-pill ${filters.neverPlayed ? 'active' : ''}`}
            onClick={() => toggleFilter('neverPlayed')}
          >
            ✨ Never Played
          </button>
          <button
            className={`filter-pill ${filters.favorites ? 'active' : ''}`}
            onClick={() => toggleFilter('favorites')}
          >
            ♥ Favorites
          </button>
          {categories.length > 0 && (
            <select
              className={`filter-select ${filters.category ? 'active' : ''}`}
              value={filters.category || ''}
              onChange={e => toggleFilter('category', e.target.value || undefined)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

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
              {drawnGame.yearPublished && <span>📅 {drawnGame.yearPublished}</span>}
              {drawnGame.minPlayers && drawnGame.maxPlayers && (
                <span>👥 {drawnGame.minPlayers}–{drawnGame.maxPlayers}</span>
              )}
              {drawnGame.playingTime && <span>⏱ {drawnGame.playingTime}min</span>}
              {drawnGame.numPlays > 0 && <span>🎲 Played {drawnGame.numPlays}×</span>}
              {drawnGame.numPlays === 0 && <span>✨ Never played!</span>}
            </div>
            {drawnGame.categories?.length > 0 && (
              <div className="game-meta" style={{ fontSize: '0.75rem' }}>
                {drawnGame.categories.slice(0, 3).join(' · ')}
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
