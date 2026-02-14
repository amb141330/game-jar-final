// lib/gameStore.js
// Helpers for managing the game collection in localStorage

const STORAGE_KEY = 'gamejar_collection';
const FAVORITES_KEY = 'gamejar_favorites';

export function getCollection() {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCollection(games) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export function getFavorites() {
  if (typeof window === 'undefined') return new Set();
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveFavorites(favoriteSet) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favoriteSet]));
}

export function toggleFavorite(gameId) {
  const favs = getFavorites();
  if (favs.has(gameId)) {
    favs.delete(gameId);
  } else {
    favs.add(gameId);
  }
  saveFavorites(favs);
  return favs;
}

// Get all unique tags from the collection, sorted by frequency
export function getUniqueTags(games) {
  const tagCounts = {};
  games.forEach(g => {
    (g.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }));
}

// Filter games by active tags (AND logic — game must have ALL active tags)
export function filterGames(games, activeTags, favorites) {
  if (activeTags.length === 0 && !activeTags.includes('♥ Favorites')) {
    return games;
  }

  return games.filter(game => {
    const gameTags = game.tags || [];

    for (const tag of activeTags) {
      if (tag === '♥ Favorites') {
        if (!favorites.has(game.id)) return false;
      } else {
        if (!gameTags.includes(tag)) return false;
      }
    }

    return true;
  });
}

// Parse BGG collection XML into our game format
export function parseCollectionXML(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const items = doc.querySelectorAll('item');
  const games = [];

  items.forEach(item => {
    const id = item.getAttribute('objectid');
    const name = item.querySelector('name')?.textContent || 'Unknown';
    const yearPublished = item.querySelector('yearpublished')?.textContent || '';
    const image = item.querySelector('image')?.textContent || '';
    const thumbnail = item.querySelector('thumbnail')?.textContent || '';
    const numPlays = parseInt(item.querySelector('numplays')?.textContent || '0', 10);
    const ratingEl = item.querySelector('rating');
    const userRating = ratingEl?.getAttribute('value') || 'N/A';

    const statsEl = item.querySelector('stats');
    const minPlayers = statsEl?.getAttribute('minplayers') || '';
    const maxPlayers = statsEl?.getAttribute('maxplayers') || '';
    const playingTime = statsEl?.getAttribute('playingtime') || '';

    games.push({
      id,
      name,
      year: yearPublished ? parseInt(yearPublished) : null,
      image,
      thumbnail,
      numPlays,
      userRating: userRating === 'N/A' ? null : parseFloat(userRating),
      minPlayers: parseInt(minPlayers) || null,
      maxPlayers: parseInt(maxPlayers) || null,
      playingTime: parseInt(playingTime) || null,
      tags: [],
    });
  });

  return games;
}

// Parse BGG thing XML to extract categories and mechanics as tags
export function parseThingXML(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const items = doc.querySelectorAll('item');
  const details = {};

  items.forEach(item => {
    const id = item.getAttribute('id');
    const links = item.querySelectorAll('link');
    const tags = [];

    links.forEach(link => {
      const type = link.getAttribute('type');
      const value = link.getAttribute('value');
      if (type === 'boardgamecategory') tags.push(value);
      if (type === 'boardgamemechanic') tags.push(value);
    });

    details[id] = { tags };
  });

  return details;
}

// Import from a JSON file or object (our format)
export function importFromJSON(jsonData) {
  let games;

  if (typeof jsonData === 'string') {
    games = JSON.parse(jsonData);
  } else {
    games = jsonData;
  }

  // Validate basic structure
  if (!Array.isArray(games)) {
    throw new Error('JSON must be an array of games');
  }

  // Ensure each game has required fields
  games = games.map(g => ({
    id: g.id || String(Math.random()).slice(2, 10),
    name: g.name || 'Unknown Game',
    year: g.year || g.yearPublished || null,
    numPlays: g.numPlays || 0,
    minPlayers: g.minPlayers || null,
    maxPlayers: g.maxPlayers || null,
    playingTime: g.playingTime || null,
    thumbnail: g.thumbnail || '',
    image: g.image || '',
    tags: g.tags || [],
    userRating: g.userRating || null,
  }));

  // Sort by name
  games.sort((a, b) => a.name.localeCompare(b.name));

  saveCollection(games);
  return games;
}
