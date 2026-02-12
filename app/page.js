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
  'var(--paper-cream)', 'var(--paper-pink)', 'var(--paper-lavender)',
  'var(--paper-mint)', 'var(--paper-yellow)',
];

// Quick-access tags shown as horizontal pills
const QUICK_TAGS = [
  '✨ Never Played',
  '🔥 Most Played',
  '♥ Favorites',
  '🤝 Co-op',
  '🧸 Cozy',
  '👫 2P',
  '⚡ Quick',
];

// Map display labels to actual tag names
const TAG_DISPLAY_MAP = {
  '✨ Never Played': 'Never Played',
  '🔥 Most Played': 'Most Played',
  '♥ Favorites': '♥ Favorites',
  '🤝 Co-op': 'Cooperative',
  '🧸 Cozy': 'Cozy',
  '👫 2P': '2 Player Friendly',
  '⚡ Quick': 'Quick Game',
  '⏱ Short (≤30min)': '__short',
  '⏱ Medium (≤90min)': '__medium',
  '⏱ Long (90min+)': '__long',
};

// Categorize drawer tags
const TAG_CATEGORIES = {
  'Game Length': ['⏱ Short (≤30min)', '⏱ Medium (≤90min)', '⏱ Long (90min+)'],
  'Play Style': ['Cooperative', 'Solo-able', 'Solo', '2 Player Only', '2 Player Friendly', 'Party Size'],
  'Theme': ['Fantasy', 'Horror', 'Nature', 'Sci-Fi', 'Disney', 'Superhero', 'Pirate'],
  'Vibe': ['Cozy', 'Family Friendly', 'Heavy', 'Thematic'],
  'Mechanics': ['Worker Placement', 'Deck Building', 'Engine Building', 'Card Game', 'Dice',
    'Tile Placement', 'Push Your Luck', 'Trick-Taking', 'Set Collection', 'Area Control',
    'Auction', 'Deduction', 'Bluffing', 'Pattern Building', 'Card Drafting', 'Puzzle'],
  'Other': ['Campaign', 'Adventure', 'Narrative', 'Euro', 'Economic', 'Abstract',
    'Survival', 'Traitor', 'Strategy'],
};

// Sparkle positions for burst effect
const SPARKLE_POSITIONS = [
  { x: -25, y: -20, char: '✨' },
  { x: 25, y: -25, char: '💫' },
  { x: -40, y: 5, char: '⭐' },
  { x: 40, y: 0, char: '✨' },
  { x: -15, y: -35, char: '💖' },
  { x: 15, y: -40, char: '✨' },
];

export default function JarPage() {
  const router = useRouter();
  const [games, setGames] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [allTags, setAllTags] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [drawnGame, setDrawnGame] = useState(null);
  const [jarAnim, setJarAnim] = useState(''); // 'shake' | 'idle' | ''
  const [lidPop, setLidPop] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const idleTimer = useRef(null);

  useEffect(() => {
    const collection = getCollection();
    const favs = getFavorites();
    setGames(collection);
    setFavorites(favs);
    setAllTags(getUniqueTags(collection));
  }, []);

  // Apply filters including time-based ones
  useEffect(() => {
    let result = filterGames(games, activeTags.filter(t => !t.startsWith('__')), favorites);

    // Apply time filters
    if (activeTags.includes('__short')) {
      result = result.filter(g => g.playingTime && g.playingTime <= 30);
    }
    if (activeTags.includes('__medium')) {
      result = result.filter(g => g.playingTime && g.playingTime > 30 && g.playingTime <= 90);
    }
    if (activeTags.includes('__long')) {
      result = result.filter(g => g.playingTime && g.playingTime > 90);
    }

    setFilteredGames(result);
  }, [games, activeTags, favorites]);

  // Idle wobble timer
  useEffect(() => {
    if (games.length === 0) return;

    const scheduleWobble = () => {
      const delay = 5000 + Math.random() * 8000; // 5-13 seconds
      idleTimer.current = setTimeout(() => {
        if (!drawnGame) {
          setJarAnim('idle');
          setTimeout(() => setJarAnim(''), 700);
        }
        scheduleWobble();
      }, delay);
    };

    scheduleWobble();
    return () => clearTimeout(idleTimer.current);
  }, [games.length, drawnGame]);

  const drawGame = useCallback(() => {
    if (filteredGames.length === 0) return;

    // Shake + lid pop
    setJarAnim('shake');
    setLidPop(true);
    setShowSparkles(true);

    setTimeout(() => setJarAnim(''), 500);
    setTimeout(() => setLidPop(false), 900);
    setTimeout(() => setShowSparkles(false), 900);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * filteredGames.length);
      setDrawnGame(filteredGames[randomIndex]);
    }, 500);
  }, [filteredGames]);

  const toggleTag = (displayLabel) => {
    const actual = TAG_DISPLAY_MAP[displayLabel] || displayLabel;
    setActiveTags(prev =>
      prev.includes(actual)
        ? prev.filter(t => t !== actual)
        : [...prev, actual]
    );
  };

  const isTagActive = (displayLabel) => {
    const actual = TAG_DISPLAY_MAP[displayLabel] || displayLabel;
    return activeTags.includes(actual);
  };

  // Check which drawer tags actually exist in the collection
  const existingTags = new Set(allTags.map(t => t.tag));

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

        {/* Quick filter pills */}
        <div className="filter-section">
          <div className="filter-bar">
            {QUICK_TAGS.map(tag => (
              <button
                key={tag}
                className={`filter-pill ${isTagActive(tag) ? 'active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
            <button
              className={`filter-pill ${showDrawer ? 'active' : ''}`}
              onClick={() => setShowDrawer(true)}
              style={{ background: showDrawer ? undefined : 'var(--blush-soft)' }}
            >
              🎛 More
            </button>
          </div>
        </div>

        {/* Active filters count + clear */}
        {activeTags.length > 0 && (
          <div className="game-count-badge">
            {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} match
            <span
              onClick={() => setActiveTags([])}
              style={{
                marginLeft: '8px',
                color: 'var(--deep-rose)',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontWeight: 700,
              }}
            >
              clear
            </span>
          </div>
        )}
        {activeTags.length === 0 && (
          <div className="game-count-badge">
            {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} in jar
          </div>
        )}

        {/* The Jar */}
        <div className="jar-section">
          <div
            className={`jar-container ${jarAnim === 'shake' ? 'jar-shake' : jarAnim === 'idle' ? 'jar-idle-wobble' : ''}`}
            onClick={drawGame}
            role="button"
            tabIndex={0}
            aria-label="Tap to draw a game"
            onKeyDown={e => e.key === 'Enter' && drawGame()}
          >
            {/* Sparkle burst */}
            {showSparkles && (
              <div className="sparkle-burst">
                {SPARKLE_POSITIONS.map((s, i) => (
                  <span
                    key={i}
                    className="sparkle"
                    style={{
                      left: s.x,
                      top: s.y,
                    }}
                  >
                    {s.char}
                  </span>
                ))}
              </div>
            )}

            <div className={`jar-lid-wrapper ${lidPop ? 'lid-popping' : ''}`}>
              <div className="jar-lid" />
            </div>
            <div className="jar-neck" />
            <div className="jar-body">
              <div className="jar-shine" />
              <div className="jar-shine-2" />
              <div className="jar-papers">
                {filteredGames.slice(0, 28).map((game, i) => (
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
            {filteredGames.length > 0 ? 'tap the jar ♡' : 'no games match these filters'}
          </p>
        </div>
      </div>

      {/* Filter drawer */}
      {showDrawer && (
        <>
          <div className="filter-drawer-overlay" onClick={() => setShowDrawer(false)} />
          <div className="filter-drawer">
            <div className="drawer-handle" />
            <h3>🎛 Filter Games</h3>

            {Object.entries(TAG_CATEGORIES).map(([category, tags]) => {
              // Filter to only show tags that exist (except time-based ones which are always available)
              const available = tags.filter(tag => {
                if (tag.startsWith('⏱')) return true;
                return existingTags.has(tag);
              });
              if (available.length === 0) return null;

              return (
                <div key={category} className="tag-section">
                  <div className="tag-section-title">{category}</div>
                  <div className="tag-grid">
                    {available.map(tag => {
                      const displayLabel = tag.startsWith('⏱') ? tag : tag;
                      return (
                        <button
                          key={tag}
                          className={`filter-pill ${isTagActive(displayLabel) ? 'active' : ''}`}
                          onClick={() => toggleTag(displayLabel)}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {activeTags.length > 0 && (
              <button
                className="filter-clear-btn"
                onClick={() => { setActiveTags([]); setShowDrawer(false); }}
              >
                Clear All Filters
              </button>
            )}

            <button
              className="btn-primary"
              onClick={() => setShowDrawer(false)}
              style={{ width: '100%', marginTop: '12px' }}
            >
              Done ({filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''})
            </button>
          </div>
        </>
      )}

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
              {drawnGame.numPlays > 0 && <span>🎲 {drawnGame.numPlays}×</span>}
              {drawnGame.numPlays === 0 && <span>✨ New!</span>}
            </div>
            {drawnGame.tags?.length > 0 && (
              <div className="tag-chips">
                {drawnGame.tags
                  .filter(t => t !== 'Never Played' && t !== 'Most Played')
                  .slice(0, 5)
                  .map(tag => (
                    <span key={tag} className="tag-chip">{tag}</span>
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
