/**
 * Play History — tracks draw accepts/rejects, weighted random, stats.
 * 
 * Draw events: { id, gameId, gameName, date, action: 'accept'|'reject', tags, playingTime }
 * Play sessions: managed by battlePass.js (logPlay), referenced here for stats.
 * 
 * BGG merge: local plays have bggLinked/bggPlayId fields. When BGG data arrives,
 * mergeBGGPlays matches closest-timestamp same-game records within 24h window.
 */

const DRAW_HISTORY_KEY = 'gamejar_draw_history';

// ── Draw History ────────────────────────────────────────────
export function getDrawHistory() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(DRAW_HISTORY_KEY) || '[]'); } catch { return []; }
}

function saveDrawHistory(h) {
  if (typeof window !== 'undefined') localStorage.setItem(DRAW_HISTORY_KEY, JSON.stringify(h));
}

export function logDrawEvent(game, action) {
  const history = getDrawHistory();
  history.push({
    id: `draw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    gameId: game.id,
    gameName: game.name,
    date: new Date().toISOString(),
    action, // 'accept' or 'reject'
    tags: [...(game.tags || [])],
    playingTime: game.playingTime || null,
  });
  saveDrawHistory(history);
  return history;
}

// ── Weighted Random Draw ────────────────────────────────────
/**
 * Weight formula:
 * - Base: 1.0
 * - Each accept: +0.15 (capped at +1.0 total bonus)
 * - Each reject: -0.3 (decays: only rejections within last 14 days count)
 * - Minimum weight: 0.1 (never fully exclude a game)
 * 
 * @param {Array} games - filtered game list
 * @param {string|null} excludeId - game to exclude (e.g. just rejected)
 * @returns {Object} selected game
 */
export function weightedRandomDraw(games, excludeId = null) {
  if (!games.length) return null;
  const eligible = excludeId ? games.filter(g => g.id !== excludeId) : games;
  if (!eligible.length) return games[Math.floor(Math.random() * games.length)];

  const history = getDrawHistory();
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;

  const weights = eligible.map(game => {
    let weight = 1.0;

    // Accept bonus: +0.15 per accept, cap +1.0
    const accepts = history.filter(h => h.gameId === game.id && h.action === 'accept').length;
    weight += Math.min(1.0, accepts * 0.15);

    // Reject penalty: -0.3 per recent reject (last 14 days only)
    const recentRejects = history.filter(
      h => h.gameId === game.id && h.action === 'reject' && new Date(h.date).getTime() > twoWeeksAgo
    ).length;
    weight -= recentRejects * 0.3;

    return { game, weight: Math.max(0.1, weight) };
  });

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const w of weights) {
    roll -= w.weight;
    if (roll <= 0) return w.game;
  }
  return weights[weights.length - 1].game;
}

// ── Stats Computation ───────────────────────────────────────
/**
 * Computes all history stats from plays array + draw history.
 * All computation happens at render time — no stored state.
 */
export function computeStats(plays, drawHistory) {
  if (!plays.length) return null;

  // Most played games
  const playCounts = {};
  plays.forEach(p => {
    if (!playCounts[p.gameId]) playCounts[p.gameId] = { name: p.gameName, count: 0, lastPlayed: p.date };
    playCounts[p.gameId].count++;
    if (p.date > playCounts[p.gameId].lastPlayed) playCounts[p.gameId].lastPlayed = p.date;
  });
  const mostPlayed = Object.entries(playCounts)
    .map(([id, data]) => ({ gameId: id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Unique games played
  const uniqueGames = new Set(plays.map(p => p.gameId)).size;

  // Total play sessions
  const totalSessions = plays.length;

  // Total XP earned
  const totalXP = plays.reduce((sum, p) => sum + (p.xpEarned || 0), 0);

  // Longest streak (consecutive days with at least one play)
  const daySet = new Set();
  plays.forEach(p => {
    const d = new Date(p.date);
    daySet.add(`${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  });
  const sortedDays = [...daySet].sort();
  let longestStreak = 0, currentStreak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1] + 'T00:00:00');
    const curr = new Date(sortedDays[i] + 'T00:00:00');
    const diff = (curr - prev) / (24 * 60 * 60 * 1000);
    if (diff === 1) { currentStreak++; }
    else { longestStreak = Math.max(longestStreak, currentStreak); currentStreak = 1; }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  // Current streak
  let currentActiveStreak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (daySet.has(key)) currentActiveStreak++;
    else break;
  }

  // Monthly play counts (last 6 months)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const count = plays.filter(p => {
      const pd = new Date(p.date);
      return `${pd.getFullYear()}-${String(pd.getMonth()).padStart(2,'0')}` === key;
    }).length;
    months.push({ label, count });
  }

  // Most rejected (from draw history)
  const rejectCounts = {};
  (drawHistory || []).filter(h => h.action === 'reject').forEach(h => {
    rejectCounts[h.gameId] = rejectCounts[h.gameId] || { name: h.gameName, count: 0 };
    rejectCounts[h.gameId].count++;
  });
  const mostRejected = Object.entries(rejectCounts)
    .map(([id, data]) => ({ gameId: id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Day-of-week preferences (from accepts)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayOfWeekPlays = Array(7).fill(0);
  plays.forEach(p => { dayOfWeekPlays[new Date(p.date).getDay()]++; });

  // Recent activity (last 20)
  const recent = plays.slice().reverse().slice(0, 20);

  // Games not played in 30+ days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const dusty = Object.entries(playCounts)
    .filter(([_, d]) => new Date(d.lastPlayed).getTime() < thirtyDaysAgo)
    .map(([id, d]) => ({ gameId: id, ...d, daysSince: Math.floor((Date.now() - new Date(d.lastPlayed).getTime()) / (24*60*60*1000)) }))
    .sort((a, b) => b.daysSince - a.daysSince)
    .slice(0, 5);

  return {
    mostPlayed, uniqueGames, totalSessions, totalXP,
    longestStreak, currentActiveStreak, months, mostRejected,
    dayOfWeekPlays, dayNames, recent, dusty,
  };
}

// ── BGG Merge (for future use) ──────────────────────────────
/**
 * Merges BGG plays into local play history.
 * For each BGG play:
 * - Find local play with same gameId within 24h window
 * - If found, link the CLOSEST timestamp match, mark bggLinked + bggPlayId
 * - If no match, import as origin:'bgg' entry
 * 
 * @param {Array} bggPlays - [{ bggPlayId, gameId, gameName, date, ... }]
 * @param {Array} localPlays - current plays array from battle pass state
 * @returns {Array} merged plays array
 */
export function mergeBGGPlays(bggPlays, localPlays) {
  const merged = [...localPlays];
  const usedLocalIds = new Set();

  for (const bggPlay of bggPlays) {
    const bggDate = new Date(bggPlay.date).getTime();
    const DAY_MS = 24 * 60 * 60 * 1000;

    // Find closest unlinked local play for same game within 24h
    let bestMatch = null, bestDiff = Infinity;
    for (const local of merged) {
      if (local.bggLinked || usedLocalIds.has(local.id)) continue;
      if (local.gameId !== bggPlay.gameId) continue;
      const diff = Math.abs(new Date(local.date).getTime() - bggDate);
      if (diff < DAY_MS && diff < bestDiff) {
        bestMatch = local;
        bestDiff = diff;
      }
    }

    if (bestMatch) {
      // Link to existing local play
      bestMatch.bggLinked = true;
      bestMatch.bggPlayId = bggPlay.bggPlayId;
      usedLocalIds.add(bestMatch.id);
    } else {
      // Import as new BGG-origin play (no XP — avoid double-counting)
      merged.push({
        id: `bgg_${bggPlay.bggPlayId || Date.now()}`,
        gameId: bggPlay.gameId,
        gameName: bggPlay.gameName,
        date: bggPlay.date,
        origin: 'bgg',
        accepted: true,
        xpEarned: 0,
        bonuses: [],
        tags: bggPlay.tags || [],
        playingTime: bggPlay.playingTime || null,
        bggLinked: true,
        bggPlayId: bggPlay.bggPlayId,
      });
    }
  }

  return merged;
}
