'use client';

import { useState, useEffect } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
import BottomNav from '@/components/BottomNav';
import {
  getCollection,
  saveCollection,
  getFavorites,
  toggleFavorite,
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

  useEffect(() => {
    const collection = getCollection();
    const favs = getFavorites();
    setGames(collection);
    setFavorites(favs);
  }, []);

  const fetchCollection = async () => {
    if (!username.trim()) return;

    setLoading(true);
    setError('');
    setProgress(0);
    setLoadingStatus('Reaching out to BoardGameGeek...');

    try {
      // Step 1: Fetch collection
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
        throw new Error('No games found for this username. Make sure the collection is public!');
      }

      setProgress(50);
      setLoadingStatus(`Found ${parsedGames.length} games! Loading details...`);

      // Step 2: Fetch thing details in batches of 20 for categories
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
                return {
                  ...game,
                  categories: details[game.id].categories,
                  mechanics: details[game.id].mechanics,
                };
              }
              return game;
            });
          }
        } catch {
          // Continue even if a batch fails
        }

        setProgress(50 + ((i + 1) / totalBatches) * 45);
        setLoadingStatus(`Loading details... (${Math.min((i + 1) * batchSize, parsedGames.length)}/${parsedGames.length})`);

        // Small delay between batches to be nice to BGG
        if (i < totalBatches - 1) {
          await new Promise(r => setTimeout(r, 800));
        }
      }

      // Sort by name
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
      setProgress(0);
      setLoadingStatus('');
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

  return (
    <>
      <FloatingHearts />
      <div className="main-content page-enter" style={{ overflow: 'auto' }}>
        <div className="import-container">
          <div className="app-title" style={{ paddingTop: '8px' }}>
            <h1>📚 Game Library</h1>
          </div>

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
            >
              {loading ? '...' : 'Import'}
            </button>
          </div>

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

          {error && (
            <div style={{
              background: '#FFF0F0',
              padding: '12px 16px',
              borderRadius: '12px',
              color: '#C44',
              fontSize: '0.9rem',
              marginBottom: '12px',
            }}>
              {error}
            </div>
          )}

          {games.length > 0 && !loading && (
            <>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {games.length} games · tap ♥ to mark favorites
                </span>
                <button className="btn-secondary" onClick={clearCollection} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Clear
                </button>
              </div>
              <div className="game-list">
                {games.map(game => (
                  <div key={game.id} className="game-list-item">
                    {game.thumbnail ? (
                      <img src={game.thumbnail} alt="" />
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
                        {game.yearPublished && `${game.yearPublished}`}
                        {game.numPlays > 0 ? ` · ${game.numPlays} plays` : ' · Never played'}
                        {game.categories?.length > 0 && ` · ${game.categories[0]}`}
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
              </div>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </>
  );
}
