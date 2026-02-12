'use client';

import { useState, useEffect, useRef } from 'react';
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
    const collection = getCollection();
    const favs = getFavorites();
    setGames(collection);
    setFavorites(favs);
  }, []);

  // ---- BGG Import (requires API token) ----
  const fetchCollection = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    setProgress(0);
    setLoadingStatus('Reaching out to BoardGameGeek...');

    try {
      const collRes = await fetch(`/api/bgg/collection?username=${encodeURIComponent(username.trim())}`);

      if (!collRes.ok) {
        const err = await collRes.json();
        throw new Error(err.error || 'Failed to load collection');
      }

      setProgress(30);
      setLoadingStatus('Parsing your games...');

      const xmlText = await collRes.text();
      let parsedGames = parseCollectionXML(xmlText);

      if (parsedGames.length === 0) {
        throw new Error('No games found. Make sure the collection is public!');
      }

      setProgress(50);
      setLoadingStatus(`Found ${parsedGames.length} games! Loading details...`);

      // Fetch thing details in batches of 20 for tags
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

            parsedGames = parsedGames.map(game => {
              if (details[game.id]) {
                return { ...game, tags: details[game.id].tags };
              }
              return game;
            });
          }
        } catch {
          // Continue even if a batch fails
        }

        setProgress(50 + ((i + 1) / totalBatches) * 45);
        setLoadingStatus(`Loading details... (${Math.min((i + 1) * batchSize, parsedGames.length)}/${parsedGames.length})`);

        if (i < totalBatches - 1) {
          await new Promise(r => setTimeout(r, 800));
        }
      }

      // Add computed tags
      parsedGames.forEach(g => {
        if (g.numPlays === 0) g.tags.push('Never Played');
      });

      // Top 10 most played
      const sorted = [...parsedGames].filter(g => g.numPlays > 0)
        .sort((a, b) => b.numPlays - a.numPlays);
      const top10 = new Set(sorted.slice(0, 10).map(g => g.id));
      parsedGames.forEach(g => {
        if (top10.has(g.id)) g.tags.push('Most Played');
      });

      parsedGames.sort((a, b) => a.name.localeCompare(b.name));
      saveCollection(parsedGames);
      setGames(parsedGames);
      setProgress(100);
      setLoadingStatus('All done! 🎉');

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setLoadingStatus('');
      }, 1000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ---- JSON File Import ----
  const handleJSONImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setLoadingStatus('Reading JSON file...');
    setProgress(50);

    try {
      const text = await file.text();
      const imported = importFromJSON(text);
      setGames(imported);
      setProgress(100);
      setLoadingStatus(`Imported ${imported.length} games! 🎉`);

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setLoadingStatus('');
      }, 1000);
    } catch (err) {
      setError(`Failed to import JSON: ${err.message}`);
      setLoading(false);
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---- Load bundled collection.json ----
  const loadBundledCollection = async () => {
    setLoading(true);
    setError('');
    setLoadingStatus('Loading bundled collection...');
    setProgress(30);

    try {
      const res = await fetch('/collection.json');
      if (!res.ok) throw new Error('Could not find collection.json');
      const data = await res.json();
      const imported = importFromJSON(data);
      setGames(imported);
      setProgress(100);
      setLoadingStatus(`Loaded ${imported.length} games! 🎉`);

      setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setLoadingStatus('');
      }, 1000);
    } catch (err) {
      setError(`Failed to load bundled collection: ${err.message}`);
      setLoading(false);
    }
  };

  const handleToggleFavorite = (gameId) => {
    const newFavs = toggleFavorite(gameId);
    setFavorites(new Set(newFavs));
  };

  const clearCollection = () => {
    if (confirm('Remove all games from the jar?')) {
      saveCollection([]);
      setGames([]);
    }
  };

  const exportCollection = () => {
    const blob = new Blob([JSON.stringify(games, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'game-collection.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter displayed games by search
  const displayedGames = searchQuery.trim()
    ? games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : games;

  return (
    <>
      <FloatingHearts />
      <div className="main-content page-enter" style={{ overflow: 'auto' }}>
        <div className="import-container">
          <div className="app-title" style={{ paddingTop: '8px' }}>
            <h1>📚 Game Library</h1>
          </div>

          {/* Import options when no games */}
          {games.length === 0 && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {/* Bundled collection (primary) */}
              <button className="btn-primary" onClick={loadBundledCollection} style={{ width: '100%' }}>
                🫙 Load Our Collection
              </button>

              {/* JSON file upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleJSONImport}
                style={{ display: 'none' }}
              />
              <button
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: '100%' }}
              >
                📄 Import from JSON File
              </button>

              {/* BGG import */}
              <div style={{
                borderTop: '1px solid var(--blush)',
                paddingTop: '12px',
                marginTop: '4px',
              }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Or import from BGG (requires API token):
                </p>
                <div className="import-input-group">
                  <input
                    className="import-input"
                    type="text"
                    placeholder="BGG username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchCollection()}
                    disabled={loading}
                  />
                  <button
                    className="btn-primary"
                    onClick={fetchCollection}
                    disabled={loading || !username.trim()}
                    style={{ padding: '12px 16px' }}
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <div className="loader">
                <div className="loader-hearts">
                  <span>💕</span>
                  <span>💕</span>
                  <span>💕</span>
                </div>
                <span className="loader-text">{loadingStatus}</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: '#FFF0F0',
              padding: '12px 16px',
              borderRadius: '12px',
              color: '#C44',
              fontSize: '0.9rem',
              marginBottom: '12px',
              marginTop: '12px',
            }}>
              {error}
            </div>
          )}

          {/* Game list when loaded */}
          {games.length > 0 && !loading && (
            <>
              {/* Actions bar */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
                marginBottom: '8px',
                gap: '8px',
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                  {games.length} games
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn-secondary" onClick={exportCollection}
                    style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                    Export
                  </button>
                  <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}
                    style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                    Import
                  </button>
                  <button className="btn-secondary" onClick={clearCollection}
                    style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                    Clear
                  </button>
                </div>
              </div>

              {/* Hidden file input for re-import */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleJSONImport}
                style={{ display: 'none' }}
              />

              {/* Search */}
              <input
                className="import-input"
                type="text"
                placeholder="🔍 Search games..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ marginBottom: '8px', width: '100%' }}
              />

              {/* Game list */}
              <div className="game-list">
                {displayedGames.map(game => (
                  <div key={game.id} className="game-list-item">
                    {game.thumbnail ? (
                      <img src={game.thumbnail} alt="" loading="lazy" />
                    ) : (
                      <div style={{
                        width: 40, height: 40, borderRadius: 8,
                        background: 'var(--blush)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.2rem', flexShrink: 0,
                      }}>
                        🎲
                      </div>
                    )}
                    <div className="game-info">
                      <div className="game-name">{game.name}</div>
                      <div className="game-detail">
                        {game.year && `${game.year}`}
                        {game.numPlays > 0 ? ` · ${game.numPlays} plays` : ' · Never played'}
                        {game.tags?.length > 0 && ` · ${game.tags.filter(t => t !== 'Never Played' && t !== 'Most Played')[0] || ''}`}
                      </div>
                    </div>
                    <button
                      className="fav-btn"
                      onClick={() => handleToggleFavorite(game.id)}
                      aria-label={favorites.has(game.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.has(game.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                ))}
                {displayedGames.length === 0 && searchQuery && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
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
