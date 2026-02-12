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
    const avgRating = ratingEl?.querySelector('average')?.getAttribute('value') || '0';

    const statsEl = item.querySelector('stats');
    const minPlayers = statsEl?.getAttribute('minplayers') || '';
    const maxPlayers = statsEl?.getAttribute('maxplayers') || '';
    const playingTime = statsEl?.getAttribute('playingtime') || '';

    games.push({
      id,
      name,
      yearPublished,
      image,
      thumbnail,
      numPlays,
      userRating: userRating === 'N/A' ? null : parseFloat(userRating),
      avgRating: parseFloat(avgRating),
      minPlayers: parseInt(minPlayers) || null,
      maxPlayers: parseInt(maxPlayers) || null,
      playingTime: parseInt(playingTime) || null,
      categories: [],
      mechanics: [],
    });
  });

  return games;
}

// Parse BGG thing XML to extract categories and mechanics
export function parseThingXML(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const items = doc.querySelectorAll('item');
  const details = {};

  items.forEach(item => {
    const id = item.getAttribute('id');
    const links = item.querySelectorAll('link');
    const categories = [];
    const mechanics = [];

    links.forEach(link => {
      const type = link.getAttribute('type');
      const value = link.getAttribute('value');
      if (type === 'boardgamecategory') categories.push(value);
      if (type === 'boardgamemechanic') mechanics.push(value);
    });

    details[id] = { categories, mechanics };
  });

  return details;
}

// Get unique categories from the collection
export function getUniqueCategories(games) {
  const cats = new Set();
  games.forEach(g => g.categories?.forEach(c => cats.add(c)));
  return [...cats].sort();
}

// Get unique mechanics from the collection
export function getUniqueMechanics(games) {
  const mechs = new Set();
  games.forEach(g => g.mechanics?.forEach(m => mechs.add(m)));
  return [...mechs].sort();
}

// Filter games by criteria
export function filterGames(games, filters, favorites) {
  return games.filter(game => {
    if (filters.neverPlayed && game.numPlays > 0) return false;
    if (filters.favorites && !favorites.has(game.id)) return false;
    if (filters.category && !game.categories?.includes(filters.category)) return false;
    if (filters.mechanic && !game.mechanics?.includes(filters.mechanic)) return false;
    if (filters.playerCount) {
      const count = parseInt(filters.playerCount);
      if (game.minPlayers && game.maxPlayers) {
        if (count < game.minPlayers || count > game.maxPlayers) return false;
      }
    }
    if (filters.maxTime) {
      if (game.playingTime && game.playingTime > parseInt(filters.maxTime)) return false;
    }
    return true;
  });
}
