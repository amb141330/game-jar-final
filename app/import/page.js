'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
import BottomNav from '@/components/BottomNav';
import {
  getCollection,
  saveCollection,
  getFavorites,
  toggleFavorite,
  importFromJSON,
  parseCollectionXML,
  parseThingXML,
} from '@/lib/gameStore';

const bookColors = [
  '#E8A0BF', '#D4728C', '#9B4D6E', '#C9A96E', '#7BAACC',
  '#A5C8A1', '#D4A0D9', '#E8C87B', '#8BBDD9', '#C49898',
  '#B8D4A8', '#D9B0C4', '#A8C4D4', '#E8B898', '#98B8D4',
  '#C8A8D8', '#D8C898', '#A8D8C8', '#D89898', '#98D8A8',
];

function generateShelfBooks(count) {
  const books = [];
  for (let i = 0; i < count; i++) {
    books.push({
      color: bookColors[i % bookColors.length],
      height: 30 + Math.random() * 30,
      width: 12 + Math.random() * 8,
    });
  }
  return books;
}

/*
 * Meeple-Cat: classic board game meeple silhouette, but white with cat ears + pink bow.
 * Inspired by reference image — minimal kawaii face (dot eyes, gold nose, whiskers, blush).
 */
function MeepleCharacter() {
  return (
    <div className="meeple-character">
      <div className="meeple-inner">
        <svg className="meeple-svg" viewBox="0 0 70 82" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cat ears - sit on top of meeple head */}
          <path d="M20 22 L14 6 L28 18 Z" fill="#FFFBF0" stroke="#3A3030" strokeWidth="2" strokeLinejoin="round"/>
          <path d="M50 22 L56 6 L42 18 Z" fill="#FFFBF0" stroke="#3A3030" strokeWidth="2" strokeLinejoin="round"/>
          {/* Inner ear pink */}
          <path d="M20 21 L16 10 L27 18 Z" fill="#FFB6C1" opacity="0.6"/>
          <path d="M50 21 L54 10 L43 18 Z" fill="#FFB6C1" opacity="0.6"/>

          {/* Meeple body - classic shape: round head, arms out, base */}
          <path d="
            M35 14
            C27 14 22 19 22 26
            C22 31 24 34 26 36
            L10 46
            C7 48 7 52 10 54
            L14 56
            L14 74
            C14 77 17 79 20 79
            L50 79
            C53 79 56 77 56 74
            L56 56
            L60 54
            C63 52 63 48 60 46
            L44 36
            C46 34 48 31 48 26
            C48 19 43 14 35 14 Z
          " fill="#FFFBF0" stroke="#3A3030" strokeWidth="2.5" strokeLinejoin="round"/>

          {/* Eyes - small ovals like reference */}
          <ellipse cx="29" cy="27" rx="2.5" ry="3" fill="#3A3030"/>
          <ellipse cx="41" cy="27" rx="2.5" ry="3" fill="#3A3030"/>
          {/* Eye highlights */}
          <circle cx="30" cy="26" r="0.9" fill="white"/>
          <circle cx="42" cy="26" r="0.9" fill="white"/>

          {/* Nose - tiny gold oval like reference */}
          <ellipse cx="35" cy="32" rx="2" ry="1.5" fill="#E8B84A"/>

          {/* Whiskers */}
          <line x1="10" y1="30" x2="24" y2="31" stroke="#3A3030" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="10" y1="34" x2="24" y2="33" stroke="#3A3030" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="10" y1="26" x2="24" y2="29" stroke="#3A3030" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="46" y1="31" x2="60" y2="30" stroke="#3A3030" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="46" y1="33" x2="60" y2="34" stroke="#3A3030" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="46" y1="29" x2="60" y2="26" stroke="#3A3030" strokeWidth="1.2" strokeLinecap="round"/>

          {/* Blush */}
          <ellipse cx="23" cy="34" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.3"/>
          <ellipse cx="47" cy="34" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.3"/>

          {/* Bow - polka dot pink, on right ear */}
          <ellipse cx="51" cy="13" rx="6" ry="4" fill="#FF6B8A" transform="rotate(-10 51 13)"/>
          <ellipse cx="59" cy="11" rx="6" ry="4" fill="#FF6B8A" transform="rotate(10 59 11)"/>
          <circle cx="55" cy="12" r="3" fill="#E8405A"/>
          {/* Polka dots on bow */}
          <circle cx="49" cy="12" r="1" fill="white" opacity="0.65"/>
          <circle cx="52" cy="15" r="0.8" fill="white" opacity="0.65"/>
          <circle cx="58" cy="10" r="1" fill="white" opacity="0.65"/>
          <circle cx="61" cy="13" r="0.8" fill="white" opacity="0.65"/>
        </svg>
        <div className="meeple-shadow" />
      </div>
    </div>
  );
}

function ShelfBackground() {
  const shelves = useMemo(() => [
    generateShelfBooks(40), generateShelfBooks(40),
    generateShelfBooks(40), generateShelfBooks(40),
  ], []);

  return (
    <div className="shelf-bg" aria-hidden="true">
      {shelves.map((books, rowIdx) => (
        <div key={rowIdx} className={`shelf-row shelf-row-${rowIdx + 1}`}>
          {[...books, ...books].map((book, bookIdx) => (
            <div key={bookIdx} className="shelf-book"
              style={{ backgroundColor: book.color, height: `${book.height}px`, width: `${book.width}px`, opacity: 0.5 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function ImportPage() {
  const [username, setUsername] = useState('');
  const [games, setGames] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setGames(getCollection());
    setFavorites(getFavorites());
  }, []);

  const fetchCollection = async () => {
    if (!username.trim()) return;
    setLoading(true); setError(''); setProgress(0);
    setLoadingStatus('Reaching out to BoardGameGeek...');
    try {
      const collRes = await fetch(`/api/bgg/collection?username=${encodeURIComponent(username.trim())}`);
      if (!collRes.ok) { const err = await collRes.json(); throw new Error(err.error || 'Failed'); }
      setProgress(30); setLoadingStatus('Parsing your games...');
      const xmlText = await collRes.text();
      let parsedGames = parseCollectionXML(xmlText);
      if (parsedGames.length === 0) throw new Error('No games found. Is the collection public?');
      setProgress(50); setLoadingStatus(`Found ${parsedGames.length} games! Loading details...`);
      const batchSize = 20;
      const totalBatches = Math.ceil(parsedGames.length / batchSize);
      for (let i = 0; i < totalBatches; i++) {
        const batch = parsedGames.slice(i * batchSize, (i + 1) * batchSize);
        const ids = batch.map(g => g.id).join(',');
        try {
          const thingRes = await fetch(`/api/bgg/things?ids=${ids}`);
          if (thingRes.ok) {
            const thingXml = await thingRes.text();
            const details = parseThingXML(thingXml);
            parsedGames = parsedGames.map(g => details[g.id] ? { ...g, tags: details[g.id].tags } : g);
          }
        } catch {}
        setProgress(50 + ((i + 1) / totalBatches) * 45);
        setLoadingStatus(`Loading details... (${Math.min((i + 1) * batchSize, parsedGames.length)}/${parsedGames.length})`);
        if (i < totalBatches - 1) await new Promise(r => setTimeout(r, 800));
      }
      parsedGames.forEach(g => { if (g.numPlays === 0) g.tags.push('Never Played'); });
      const sorted = [...parsedGames].filter(g => g.numPlays > 0).sort((a, b) => b.numPlays - a.numPlays);
      const top10 = new Set(sorted.slice(0, 10).map(g => g.id));
      parsedGames.forEach(g => { if (top10.has(g.id)) g.tags.push('Most Played'); });
      parsedGames.sort((a, b) => a.name.localeCompare(b.name));
      saveCollection(parsedGames);
      setGames(parsedGames);
      setProgress(100); setLoadingStatus('All done! 🎉');
      setTimeout(() => { setLoading(false); setProgress(0); setLoadingStatus(''); }, 1000);
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const handleJSONImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true); setError(''); setLoadingStatus('Reading JSON file...'); setProgress(50);
    try {
      const text = await file.text();
      const imported = importFromJSON(text);
      setGames(imported);
      setProgress(100); setLoadingStatus(`Imported ${imported.length} games! 🎉`);
      setTimeout(() => { setLoading(false); setProgress(0); setLoadingStatus(''); }, 1000);
    } catch (err) { setError(`Failed: ${err.message}`); setLoading(false); }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadBundledCollection = async () => {
    setLoading(true); setError(''); setLoadingStatus('Loading our collection...'); setProgress(30);
    try {
      const res = await fetch('/collection.json');
      if (!res.ok) throw new Error('Could not find collection.json');
      const data = await res.json();
      const imported = importFromJSON(data);
      setGames(imported); setProgress(100); setLoadingStatus(`Loaded ${imported.length} games! 🎉`);
      setTimeout(() => { setLoading(false); setProgress(0); setLoadingStatus(''); }, 1000);
    } catch (err) { setError(`Failed: ${err.message}`); setLoading(false); }
  };

  const handleToggleFavorite = (gameId) => { setFavorites(new Set(toggleFavorite(gameId))); };
  const clearCollection = () => { if (confirm('Remove all games from the jar?')) { saveCollection([]); setGames([]); } };

  const exportCollection = () => {
    const blob = new Blob([JSON.stringify(games, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'game-collection.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const displayedGames = searchQuery.trim()
    ? games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : games;

  return (
    <>
      <ShelfBackground />
      <MeepleCharacter />
      <div className="main-content page-enter" style={{ overflow: 'auto' }}>
        <div className="import-container">
          <div className="app-title" style={{ paddingTop: '6px' }}>
            <h1>📚 Game Library</h1>
          </div>

          {games.length === 0 && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <button className="btn-primary" onClick={loadBundledCollection} style={{ width: '100%' }}>
                🫙 Load Our Collection
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleJSONImport} style={{ display: 'none' }} />
              <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ width: '100%' }}>
                📄 Import from JSON
              </button>
              <div style={{ borderTop: '1px solid var(--blush)', paddingTop: '10px', marginTop: '4px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                  Or import from BGG (needs API token):
                </p>
                <div className="import-input-group">
                  <input className="import-input" type="text" placeholder="BGG username" value={username}
                    onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchCollection()} disabled={loading} />
                  <button className="btn-primary" onClick={fetchCollection} disabled={loading || !username.trim()}
                    style={{ padding: '12px 16px' }}>Go</button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div>
              <div className="progress-bar-container"><div className="progress-bar" style={{ width: `${progress}%` }} /></div>
              <div className="loader">
                <div className="loader-hearts"><span>💕</span><span>💕</span><span>💕</span></div>
                <span className="loader-text">{loadingStatus}</span>
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: '#FFF0F0', padding: '12px 14px', borderRadius: '14px', color: '#C44',
              fontSize: '0.85rem', marginBottom: '10px', marginTop: '10px', fontWeight: 600 }}>{error}</div>
          )}

          {games.length > 0 && !loading && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: '10px', marginBottom: '6px', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                  {games.length} games
                </span>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="btn-secondary" onClick={exportCollection} style={{ padding: '5px 10px', fontSize: '0.72rem' }}>Export</button>
                  <input ref={fileInputRef} type="file" accept=".json" onChange={handleJSONImport} style={{ display: 'none' }} />
                  <button className="btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ padding: '5px 10px', fontSize: '0.72rem' }}>Import</button>
                  <button className="btn-secondary" onClick={clearCollection} style={{ padding: '5px 10px', fontSize: '0.72rem' }}>Clear</button>
                </div>
              </div>

              <input className="import-input" type="text" placeholder="🔍 Search games..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ marginBottom: '6px', width: '100%' }} />

              <div className="game-list">
                {displayedGames.map(game => (
                  <div key={game.id} className="game-list-item">
                    {game.thumbnail ? (
                      <img src={game.thumbnail} alt="" loading="lazy" />
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--blush)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>🎲</div>
                    )}
                    <div className="game-info">
                      <div className="game-name">{game.name}</div>
                      <div className="game-detail">
                        {game.year && `${game.year}`}
                        {game.numPlays > 0 ? ` · ${game.numPlays} plays` : ' · Never played'}
                        {game.playingTime ? ` · ${game.playingTime}min` : ''}
                      </div>
                    </div>
                    <button className="fav-btn" onClick={() => handleToggleFavorite(game.id)}>
                      {favorites.has(game.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                ))}
                {displayedGames.length === 0 && searchQuery && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                    No games match &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
