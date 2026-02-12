/**
 * Battle Pass System — "Game Night Rewards"
 * 500 Levels with repeating major rewards every 50 levels
 * ~10 cosmetic unlocks per 50-level block
 *
 * XP formula: 80 + level × 8 (gentle curve for 500 levels)
 */

const BP_KEY = 'gamejar_battlepass';
const COSMETIC_KEY = 'gamejar_cosmetics';
const MAX_LEVEL = 500;

// ── Major Rewards (repeat every 50 levels) ─────────────────
const MAJOR_OFFSETS = [
  { offset: 5,  icon: '🎲', title: 'Game Night Date', reward: 'Husband Plays Board Game with You', redeemLabel: 'Redeem Game Date' },
  { offset: 15, icon: '🍽', title: 'Chef\'s Kiss', reward: 'Husband Cooks Dinner', redeemLabel: 'Redeem Dinner' },
  { offset: 25, icon: '🛍', title: 'Shopping Spree', reward: 'New Board Game Purchase!', redeemLabel: 'Redeem New Game' },
  { offset: 35, icon: '🎬', title: 'Movie Night', reward: 'Movie Night — She Picks!', redeemLabel: 'Redeem Movie Night' },
  { offset: 45, icon: '💆', title: 'Sparkling Clean', reward: 'Husband Cleans the House (or Pays Someone)', redeemLabel: 'Redeem Clean House' },
  { offset: 50, icon: '🎁', title: 'Mystery Gift', reward: 'Mystery Surprise Gift!', redeemLabel: 'Redeem Surprise' },
];

// ── Cosmetic Definitions ────────────────────────────────────
// Each category has a pool of items that cycle through the 10 blocks
export const COSMETIC_CATEGORIES = {
  jarTheme: { label: 'Jar Style', icon: '🫙' },
  lidTheme: { label: 'Jar Lid', icon: '🔶' },
  paperTheme: { label: 'Paper Slips', icon: '📝' },
  sparkleStyle: { label: 'Draw Effects', icon: '✨' },
  bgTheme: { label: 'Background', icon: '🎨' },
  heartColor: { label: 'Floating Hearts', icon: '💕' },
  meepleAccessory: { label: 'Meeple-Cat Look', icon: '🐱' },
  jarDecor: { label: 'Jar Decoration', icon: '🎀' },
  titleBadge: { label: 'Title Badge', icon: '🏷' },
  navStyle: { label: 'Nav Theme', icon: '📱' },
};

// Pool of cosmetics per category — cycled across blocks
const COSMETIC_POOLS = {
  jarTheme: [
    { id: 'jar_rose', name: 'Rose Glass', icon: '🌹', desc: 'Soft pink-tinted jar', css: { '--jar-tint': 'rgba(232,160,191,0.2)', '--jar-edge': 'rgba(232,160,191,0.4)' } },
    { id: 'jar_ocean', name: 'Ocean Glass', icon: '🌊', desc: 'Cool blue-tinted jar', css: { '--jar-tint': 'rgba(120,180,220,0.25)', '--jar-edge': 'rgba(120,180,220,0.45)' } },
    { id: 'jar_sunset', name: 'Sunset Glass', icon: '🌅', desc: 'Warm amber-tinted jar', css: { '--jar-tint': 'rgba(240,180,100,0.2)', '--jar-edge': 'rgba(240,180,100,0.4)' } },
    { id: 'jar_mint', name: 'Mint Glass', icon: '🍃', desc: 'Fresh mint-tinted jar', css: { '--jar-tint': 'rgba(140,210,170,0.2)', '--jar-edge': 'rgba(140,210,170,0.4)' } },
    { id: 'jar_lavender', name: 'Lavender Glass', icon: '💜', desc: 'Gentle purple-tinted jar', css: { '--jar-tint': 'rgba(180,150,220,0.2)', '--jar-edge': 'rgba(180,150,220,0.4)' } },
    { id: 'jar_crystal', name: 'Crystal Glass', icon: '💎', desc: 'Sparkling clear jar', css: { '--jar-tint': 'rgba(200,230,255,0.3)', '--jar-edge': 'rgba(200,230,255,0.5)' } },
    { id: 'jar_cherry', name: 'Cherry Glass', icon: '🍒', desc: 'Deep cherry red tint', css: { '--jar-tint': 'rgba(200,80,100,0.15)', '--jar-edge': 'rgba(200,80,100,0.35)' } },
    { id: 'jar_honey', name: 'Honey Glass', icon: '🍯', desc: 'Warm honey gold tint', css: { '--jar-tint': 'rgba(230,190,80,0.2)', '--jar-edge': 'rgba(230,190,80,0.4)' } },
    { id: 'jar_aurora', name: 'Aurora Glass', icon: '🌌', desc: 'Northern lights shimmer', css: { '--jar-tint': 'rgba(100,200,180,0.2)', '--jar-edge': 'rgba(150,100,200,0.35)' } },
    { id: 'jar_pearl', name: 'Pearl Glass', icon: '🦪', desc: 'Iridescent pearl finish', css: { '--jar-tint': 'rgba(240,230,245,0.3)', '--jar-edge': 'rgba(220,200,240,0.4)' } },
  ],
  lidTheme: [
    { id: 'lid_rosegold', name: 'Rose Gold Lid', icon: '🌸', desc: 'Elegant rose gold', css: { '--lid-color': '#B76E79', '--lid-highlight': '#D4A0A8' } },
    { id: 'lid_silver', name: 'Silver Lid', icon: '🪨', desc: 'Polished silver', css: { '--lid-color': '#A8B0B8', '--lid-highlight': '#D0D8E0' } },
    { id: 'lid_copper', name: 'Copper Lid', icon: '🧡', desc: 'Warm copper tone', css: { '--lid-color': '#B87333', '--lid-highlight': '#DAA06D' } },
    { id: 'lid_platinum', name: 'Platinum Lid', icon: '⬜', desc: 'Cool platinum shine', css: { '--lid-color': '#C8D0D8', '--lid-highlight': '#E8EDF0' } },
    { id: 'lid_ruby', name: 'Ruby Lid', icon: '❤️', desc: 'Deep ruby red', css: { '--lid-color': '#9B111E', '--lid-highlight': '#C41E3A' } },
    { id: 'lid_emerald', name: 'Emerald Lid', icon: '💚', desc: 'Rich emerald green', css: { '--lid-color': '#50A060', '--lid-highlight': '#80C090' } },
    { id: 'lid_sapphire', name: 'Sapphire Lid', icon: '💙', desc: 'Royal sapphire blue', css: { '--lid-color': '#4060A0', '--lid-highlight': '#7090D0' } },
    { id: 'lid_amethyst', name: 'Amethyst Lid', icon: '💜', desc: 'Mystical amethyst', css: { '--lid-color': '#7B4FA0', '--lid-highlight': '#A080C0' } },
    { id: 'lid_obsidian', name: 'Obsidian Lid', icon: '🖤', desc: 'Dark obsidian glass', css: { '--lid-color': '#2A2A2A', '--lid-highlight': '#4A4A4A' } },
    { id: 'lid_rainbow', name: 'Rainbow Lid', icon: '🌈', desc: 'Prismatic rainbow finish', css: { '--lid-color': '#D4728C', '--lid-highlight': '#E8C87B' } },
  ],
  paperTheme: [
    { id: 'paper_sakura', name: 'Sakura Petals', icon: '🌸', desc: 'Soft cherry blossom pinks', css: { '--p1': '#FFE4EC', '--p2': '#FFD0DC', '--p3': '#FFEEF2', '--p4': '#FFB8CC', '--p5': '#FFE8F0' } },
    { id: 'paper_ocean', name: 'Ocean Waves', icon: '🐚', desc: 'Cool blues and teals', css: { '--p1': '#D0E8F0', '--p2': '#B8D8E8', '--p3': '#E0F0F8', '--p4': '#A0D0E0', '--p5': '#C8E8F0' } },
    { id: 'paper_forest', name: 'Forest Floor', icon: '🌿', desc: 'Natural greens and browns', css: { '--p1': '#D8E8D0', '--p2': '#E8DCC8', '--p3': '#C8E0C0', '--p4': '#E0D8C0', '--p5': '#D0E0C8' } },
    { id: 'paper_sunset', name: 'Sunset Glow', icon: '🌇', desc: 'Warm oranges and pinks', css: { '--p1': '#FFE0C8', '--p2': '#FFD0B0', '--p3': '#FFE8D8', '--p4': '#FFC8A0', '--p5': '#FFD8C0' } },
    { id: 'paper_galaxy', name: 'Galaxy Dust', icon: '🌌', desc: 'Deep purples and blues', css: { '--p1': '#E0D0F0', '--p2': '#D0C0E8', '--p3': '#D8D0F0', '--p4': '#C8B8E0', '--p5': '#E8E0F8' } },
    { id: 'paper_rainbow', name: 'Rainbow Notes', icon: '🌈', desc: 'Every color of the rainbow', css: { '--p1': '#FFD0D0', '--p2': '#FFE8C0', '--p3': '#D0FFD0', '--p4': '#D0E8FF', '--p5': '#F0D0FF' } },
    { id: 'paper_autumn', name: 'Autumn Leaves', icon: '🍂', desc: 'Warm fall colors', css: { '--p1': '#F0D8B0', '--p2': '#E8C8A0', '--p3': '#F0E0C0', '--p4': '#D8B090', '--p5': '#F0D0A0' } },
    { id: 'paper_candy', name: 'Candy Shop', icon: '🍬', desc: 'Bright candy colors', css: { '--p1': '#FFD0E8', '--p2': '#D0F0FF', '--p3': '#FFF0C0', '--p4': '#D0FFE0', '--p5': '#F0D0FF' } },
    { id: 'paper_midnight', name: 'Midnight Notes', icon: '🌙', desc: 'Dark moody tones', css: { '--p1': '#C8C8D8', '--p2': '#D0D0E0', '--p3': '#B8B8D0', '--p4': '#D8D0E0', '--p5': '#C0C0D8' } },
    { id: 'paper_gold', name: 'Golden Tickets', icon: '🎫', desc: 'Luxurious gold tones', css: { '--p1': '#F8E8C8', '--p2': '#F0D8A0', '--p3': '#F8F0D0', '--p4': '#E8D090', '--p5': '#F0E0B8' } },
  ],
  sparkleStyle: [
    { id: 'spark_hearts', name: 'Heart Burst', icon: '💖', desc: 'Hearts fly out on draw', emojis: ['💖', '💗', '💕', '💝', '💘', '❤️'] },
    { id: 'spark_stars', name: 'Starfall', icon: '⭐', desc: 'Stars cascade on draw', emojis: ['⭐', '🌟', '✨', '💫', '🌠', '⭐'] },
    { id: 'spark_flowers', name: 'Flower Shower', icon: '🌸', desc: 'Petals float down', emojis: ['🌸', '🌺', '🌷', '🌹', '💐', '🌻'] },
    { id: 'spark_magic', name: 'Magic Dust', icon: '🔮', desc: 'Mystical particles', emojis: ['🔮', '✨', '💫', '⚡', '🌙', '💜'] },
    { id: 'spark_confetti', name: 'Confetti Pop', icon: '🎊', desc: 'Party confetti explosion', emojis: ['🎊', '🎉', '🥳', '🎈', '🎀', '✨'] },
    { id: 'spark_snow', name: 'Snowfall', icon: '❄️', desc: 'Gentle snowflakes', emojis: ['❄️', '🌨', '⛄', '❄️', '🤍', '💎'] },
    { id: 'spark_butterflies', name: 'Butterflies', icon: '🦋', desc: 'Butterflies take flight', emojis: ['🦋', '🦋', '🌸', '✨', '🌺', '🦋'] },
    { id: 'spark_gems', name: 'Gem Shower', icon: '💎', desc: 'Precious gems scatter', emojis: ['💎', '💍', '👑', '✨', '🌟', '💫'] },
    { id: 'spark_fire', name: 'Fire Burst', icon: '🔥', desc: 'Flames erupt', emojis: ['🔥', '⚡', '💥', '✨', '🌟', '🔥'] },
    { id: 'spark_cats', name: 'Cat Party', icon: '🐱', desc: 'Tiny cats everywhere!', emojis: ['🐱', '😺', '😸', '🐾', '✨', '💕'] },
  ],
  bgTheme: [
    { id: 'bg_blush', name: 'Rose Blush', icon: '🌹', desc: 'Warm pink gradient', css: { '--bg-from': '#FFF8F0', '--bg-to': '#FFE4E1' } },
    { id: 'bg_ocean', name: 'Deep Ocean', icon: '🌊', desc: 'Cool blue gradient', css: { '--bg-from': '#F0F4FA', '--bg-to': '#D8E8F0' } },
    { id: 'bg_forest', name: 'Enchanted Forest', icon: '🌲', desc: 'Mossy green tones', css: { '--bg-from': '#F0F8F0', '--bg-to': '#D8ECD8' } },
    { id: 'bg_sunset', name: 'Golden Hour', icon: '🌇', desc: 'Warm sunset glow', css: { '--bg-from': '#FFF8E8', '--bg-to': '#FFE8D0' } },
    { id: 'bg_lavender', name: 'Lavender Dream', icon: '💜', desc: 'Soft purple haze', css: { '--bg-from': '#F8F0FA', '--bg-to': '#E8D8F0' } },
    { id: 'bg_midnight', name: 'Midnight Sky', icon: '🌙', desc: 'Deep twilight tones', css: { '--bg-from': '#E8E0F0', '--bg-to': '#D0C0E0' } },
    { id: 'bg_cherry', name: 'Cherry Blossom', icon: '🌸', desc: 'Japanese spring', css: { '--bg-from': '#FFF0F2', '--bg-to': '#FFD8E0' } },
    { id: 'bg_arctic', name: 'Arctic Frost', icon: '🧊', desc: 'Icy cool whites', css: { '--bg-from': '#F0F8FF', '--bg-to': '#D8E8F8' } },
    { id: 'bg_autumn', name: 'Autumn Warmth', icon: '🍂', desc: 'Cozy fall palette', css: { '--bg-from': '#FFF8F0', '--bg-to': '#F0DCC8' } },
    { id: 'bg_galaxy', name: 'Cosmic Nebula', icon: '🌌', desc: 'Dreamy space gradient', css: { '--bg-from': '#F0E8F8', '--bg-to': '#D8D0E8' } },
  ],
  heartColor: [
    { id: 'heart_pink', name: 'Classic Pink', icon: '💗', desc: 'Default pink hearts', css: { '--heart-color': '#D4728C' } },
    { id: 'heart_red', name: 'True Red', icon: '❤️', desc: 'Bold red hearts', css: { '--heart-color': '#CC3344' } },
    { id: 'heart_purple', name: 'Royal Purple', icon: '💜', desc: 'Purple hearts', css: { '--heart-color': '#9B59B6' } },
    { id: 'heart_blue', name: 'Blue Dream', icon: '💙', desc: 'Cool blue hearts', css: { '--heart-color': '#5B9BD5' } },
    { id: 'heart_gold', name: 'Golden Love', icon: '💛', desc: 'Warm gold hearts', css: { '--heart-color': '#D4A030' } },
    { id: 'heart_green', name: 'Nature Love', icon: '💚', desc: 'Fresh green hearts', css: { '--heart-color': '#5AA060' } },
    { id: 'heart_orange', name: 'Sunset Hearts', icon: '🧡', desc: 'Warm orange hearts', css: { '--heart-color': '#E08040' } },
    { id: 'heart_white', name: 'Pure White', icon: '🤍', desc: 'Delicate white hearts', css: { '--heart-color': '#C0B0B0' } },
    { id: 'heart_rainbow', name: 'Rainbow Hearts', icon: '🌈', desc: 'Multi-color hearts', css: { '--heart-color': '#D4728C' } },
    { id: 'heart_sparkle', name: 'Sparkle Hearts', icon: '✨', desc: 'Twinkling heart particles', css: { '--heart-color': '#C9A96E' } },
  ],
  meepleAccessory: [
    { id: 'meeple_crown', name: 'Tiny Crown', icon: '👑', desc: 'A little golden crown' },
    { id: 'meeple_witch', name: 'Witch Hat', icon: '🧙‍♀️', desc: 'Spooky witch hat' },
    { id: 'meeple_flower', name: 'Flower Crown', icon: '🌺', desc: 'Pretty flower headband' },
    { id: 'meeple_santa', name: 'Santa Hat', icon: '🎅', desc: 'Festive red hat' },
    { id: 'meeple_wizard', name: 'Wizard Hat', icon: '🧙', desc: 'Mystical wizard hat' },
    { id: 'meeple_bunny', name: 'Bunny Ears', icon: '🐰', desc: 'Cute bunny ears' },
    { id: 'meeple_pirate', name: 'Pirate Hat', icon: '🏴‍☠️', desc: 'Arr, a pirate hat!' },
    { id: 'meeple_chef', name: 'Chef Hat', icon: '👨‍🍳', desc: 'Fancy chef toque' },
    { id: 'meeple_party', name: 'Party Hat', icon: '🥳', desc: 'Party time!' },
    { id: 'meeple_detective', name: 'Detective Hat', icon: '🕵️', desc: 'Mystery-solving fedora' },
  ],
  jarDecor: [
    { id: 'decor_ribbon', name: 'Pink Ribbon', icon: '🎀', desc: 'Cute ribbon on the jar' },
    { id: 'decor_sticker_star', name: 'Star Sticker', icon: '⭐', desc: 'Gold star sticker' },
    { id: 'decor_sticker_heart', name: 'Heart Sticker', icon: '❤️', desc: 'Heart sticker decal' },
    { id: 'decor_flower', name: 'Flower Chain', icon: '🌼', desc: 'Daisy chain around jar' },
    { id: 'decor_gem', name: 'Gem Accent', icon: '💎', desc: 'Sparkling gem on jar' },
    { id: 'decor_bow', name: 'Big Bow', icon: '🎀', desc: 'Oversized cute bow' },
    { id: 'decor_fairy_lights', name: 'Fairy Lights', icon: '💡', desc: 'Tiny twinkling lights' },
    { id: 'decor_lace', name: 'Lace Wrap', icon: '🧵', desc: 'Delicate lace trim' },
    { id: 'decor_charm', name: 'Lucky Charm', icon: '🍀', desc: 'Four-leaf clover charm' },
    { id: 'decor_butterfly', name: 'Butterfly Pin', icon: '🦋', desc: 'Butterfly clip on lid' },
  ],
  titleBadge: [
    { id: 'title_rookie', name: 'Dice Hatchling', icon: '🐣', desc: 'Just getting started' },
    { id: 'title_explorer', name: 'Game Explorer', icon: '🗺', desc: 'Always trying new things' },
    { id: 'title_strategist', name: 'Strategist', icon: '🧠', desc: 'Master of tactics' },
    { id: 'title_collector', name: 'Collector', icon: '📚', desc: 'Lover of all games' },
    { id: 'title_champion', name: 'Champion', icon: '🏆', desc: 'Proven winner' },
    { id: 'title_legend', name: 'Living Legend', icon: '🌟', desc: 'A true board game legend' },
    { id: 'title_queen', name: 'Board Game Queen', icon: '👑', desc: 'Bow to the queen' },
    { id: 'title_wizard', name: 'Game Wizard', icon: '🧙‍♀️', desc: 'Magic at the table' },
    { id: 'title_phoenix', name: 'Phoenix Player', icon: '🔥', desc: 'Always rising to the top' },
    { id: 'title_cosmic', name: 'Cosmic Gamer', icon: '🌌', desc: 'Out of this world' },
  ],
  navStyle: [
    { id: 'nav_rose', name: 'Rose Nav', icon: '🌹', desc: 'Rosy pink nav bar', css: { '--nav-bg': 'rgba(255,240,238,0.95)', '--nav-border': '#FFD0D0' } },
    { id: 'nav_ocean', name: 'Ocean Nav', icon: '🌊', desc: 'Cool blue nav bar', css: { '--nav-bg': 'rgba(240,248,255,0.95)', '--nav-border': '#C0D8E8' } },
    { id: 'nav_forest', name: 'Forest Nav', icon: '🌿', desc: 'Earthy green nav bar', css: { '--nav-bg': 'rgba(240,250,240,0.95)', '--nav-border': '#C0D8C0' } },
    { id: 'nav_sunset', name: 'Sunset Nav', icon: '🌅', desc: 'Warm amber nav bar', css: { '--nav-bg': 'rgba(255,250,240,0.95)', '--nav-border': '#E8D0A0' } },
    { id: 'nav_lavender', name: 'Lavender Nav', icon: '💜', desc: 'Soft purple nav bar', css: { '--nav-bg': 'rgba(248,240,252,0.95)', '--nav-border': '#D0C0E0' } },
    { id: 'nav_midnight', name: 'Midnight Nav', icon: '🌙', desc: 'Deep dark nav bar', css: { '--nav-bg': 'rgba(240,235,245,0.95)', '--nav-border': '#C0B8D0' } },
    { id: 'nav_cherry', name: 'Cherry Nav', icon: '🍒', desc: 'Cherry accent nav', css: { '--nav-bg': 'rgba(255,245,245,0.95)', '--nav-border': '#E8A0A0' } },
    { id: 'nav_gold', name: 'Gold Nav', icon: '✨', desc: 'Luxurious gold nav', css: { '--nav-bg': 'rgba(255,250,235,0.95)', '--nav-border': '#D4B060' } },
    { id: 'nav_arctic', name: 'Arctic Nav', icon: '🧊', desc: 'Frosty ice nav', css: { '--nav-bg': 'rgba(240,250,255,0.95)', '--nav-border': '#B0D0E0' } },
    { id: 'nav_galaxy', name: 'Galaxy Nav', icon: '🌌', desc: 'Space-themed nav', css: { '--nav-bg': 'rgba(244,238,250,0.95)', '--nav-border': '#C8B0E0' } },
  ],
};

// Categories cycle order for assigning to cosmetic slots
const CATEGORY_CYCLE = [
  'jarTheme', 'sparkleStyle', 'paperTheme', 'meepleAccessory', 'bgTheme',
  'heartColor', 'lidTheme', 'jarDecor', 'titleBadge', 'navStyle',
];

// Cosmetic slot offsets within each 50-level block (avoiding major reward levels)
const COSMETIC_OFFSETS = [1, 3, 8, 10, 18, 20, 28, 30, 38, 40];

// ── Generate All Rewards ────────────────────────────────────
function generateAllRewards() {
  const rewards = [];

  for (let block = 0; block < 10; block++) {
    const baseLevel = block * 50;

    // Add cosmetic rewards
    COSMETIC_OFFSETS.forEach((offset, slotIdx) => {
      const level = baseLevel + offset;
      if (level < 1 || level > MAX_LEVEL) return;

      const categoryKey = CATEGORY_CYCLE[slotIdx];
      const pool = COSMETIC_POOLS[categoryKey];
      const item = pool[block % pool.length];

      rewards.push({
        level,
        type: 'cosmetic',
        cosmeticCategory: categoryKey,
        cosmeticId: `${item.id}_b${block}`,
        cosmeticRef: item.id,
        icon: item.icon,
        title: item.name,
        reward: item.desc,
        categoryLabel: COSMETIC_CATEGORIES[categoryKey].label,
      });
    });

    // Add major rewards
    MAJOR_OFFSETS.forEach(major => {
      const level = baseLevel + major.offset;
      if (level < 1 || level > MAX_LEVEL) return;

      // Add tier numbering
      const tier = block + 1;
      rewards.push({
        level,
        type: 'redeemable',
        icon: major.icon,
        title: `${major.title} ${tier > 1 ? `(×${tier})` : ''}`,
        reward: major.reward,
        redeemLabel: major.redeemLabel,
      });
    });
  }

  rewards.sort((a, b) => a.level - b.level);
  return rewards;
}

export const ALL_REWARDS = generateAllRewards();

// Get rewards for a specific block (50-level range)
export function getRewardsForBlock(blockIndex) {
  const start = blockIndex * 50 + 1;
  const end = (blockIndex + 1) * 50;
  return ALL_REWARDS.filter(r => r.level >= start && r.level <= end);
}

export function getBlockForLevel(level) {
  return Math.floor((level - 1) / 50);
}

// ── XP System ───────────────────────────────────────────────
export function xpForLevel(level) {
  return 80 + level * 8;
}

export function getLevelFromXP(totalXP) {
  let level = 0;
  let xpUsed = 0;
  while (level < MAX_LEVEL) {
    const needed = xpForLevel(level + 1);
    if (xpUsed + needed > totalXP) break;
    xpUsed += needed;
    level++;
  }
  const xpInto = totalXP - xpUsed;
  const xpNeeded = level < MAX_LEVEL ? xpForLevel(level + 1) : 1;
  return {
    level: Math.min(level, MAX_LEVEL),
    xpIntoCurrentLevel: xpInto,
    xpNeededForNext: xpNeeded,
    totalXP,
    progressPercent: level >= MAX_LEVEL ? 100 : Math.min(100, (xpInto / xpNeeded) * 100),
    isMaxLevel: level >= MAX_LEVEL,
  };
}

// ── Play XP Calculator ──────────────────────────────────────
export function calculatePlayXP(game, allPlays) {
  const bonuses = [];
  let total = 50;
  bonuses.push({ label: 'Played a game', xp: 50 });

  const prev = allPlays.filter(p => p.gameId === game.id);
  if (prev.length === 0) {
    total += 100;
    bonuses.push({ label: 'First time playing!', xp: 100 });
  }

  if (game.playingTime && game.playingTime > 90) {
    total += 40;
    bonuses.push({ label: 'Long game bonus', xp: 40 });
  }

  if (game.tags?.some(t => t.toLowerCase().includes('cooperative') || t.toLowerCase().includes('co-op'))) {
    total += 25;
    bonuses.push({ label: 'Co-op game bonus', xp: 25 });
  }

  const day = new Date().getDay();
  if (day === 0 || day === 5 || day === 6) {
    total += 20;
    bonuses.push({ label: 'Weekend play!', xp: 20 });
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const withCurrent = [...allPlays, { gameId: game.id, date: new Date().toISOString() }];
  const uniqueWeek = new Set(withCurrent.filter(p => new Date(p.date) >= weekStart).map(p => p.gameId));
  if (uniqueWeek.size === 3) {
    total += 150;
    bonuses.push({ label: '3 unique games this week!', xp: 150 });
  }

  const recentDays = new Set();
  [...allPlays, { date: new Date().toISOString() }].forEach(p => {
    const d = new Date(p.date);
    recentDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });
  let streak = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    if (recentDays.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)) streak++;
    else break;
  }
  if (streak >= 7) {
    total += 300;
    bonuses.push({ label: '7-day play streak! 🔥', xp: 300 });
  }

  if (prev.length === 9) {
    total += 200;
    bonuses.push({ label: 'Game Mastery: 10 plays!', xp: 200 });
  }

  return { total, bonuses };
}

// ── Storage ─────────────────────────────────────────────────
function getDefault() {
  return { totalXP: 0, plays: [], redeemedRewards: [], lastLevelSeen: 0 };
}

export function getBattlePassState() {
  if (typeof window === 'undefined') return getDefault();
  try {
    const raw = localStorage.getItem(BP_KEY);
    return raw ? JSON.parse(raw) : getDefault();
  } catch { return getDefault(); }
}

export function saveBattlePassState(state) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BP_KEY, JSON.stringify(state));
}

export function logPlay(game, collection) {
  const state = getBattlePassState();
  const { total, bonuses } = calculatePlayXP(game, state.plays);
  state.plays.push({
    gameId: game.id, gameName: game.name,
    date: new Date().toISOString(), xpEarned: total, bonuses,
  });
  state.totalXP += total;
  saveBattlePassState(state);
  return { play: state.plays[state.plays.length - 1], levelInfo: getLevelFromXP(state.totalXP), state };
}

export function redeemReward(level) {
  const state = getBattlePassState();
  if (!state.redeemedRewards.includes(level)) {
    state.redeemedRewards.push(level);
    saveBattlePassState(state);
  }
  return state;
}

export function initializeFromCollection(collection) {
  const state = getBattlePassState();
  if (state.plays.length > 0) return state;
  let seedXP = 0;
  collection.forEach(g => { if (g.numPlays > 0) seedXP += g.numPlays * 30; });
  if (seedXP > 0) {
    state.totalXP = seedXP;
    state.plays.push({
      gameId: 'seed', gameName: 'Retroactive XP from past plays',
      date: new Date().toISOString(), xpEarned: seedXP,
      bonuses: [{ label: `${collection.reduce((s, g) => s + g.numPlays, 0)} total past plays`, xp: seedXP }],
    });
    saveBattlePassState(state);
  }
  return state;
}

// ── Cosmetic Equipment ──────────────────────────────────────
function getDefaultCosmetics() {
  return {
    jarTheme: null,
    lidTheme: null,
    paperTheme: null,
    sparkleStyle: null,
    bgTheme: null,
    heartColor: null,
    meepleAccessory: null,
    jarDecor: null,
    titleBadge: null,
    navStyle: null,
  };
}

export function getEquippedCosmetics() {
  if (typeof window === 'undefined') return getDefaultCosmetics();
  try {
    const raw = localStorage.getItem(COSMETIC_KEY);
    return raw ? { ...getDefaultCosmetics(), ...JSON.parse(raw) } : getDefaultCosmetics();
  } catch { return getDefaultCosmetics(); }
}

export function equipCosmetic(category, cosmeticId) {
  const equipped = getEquippedCosmetics();
  equipped[category] = cosmeticId;
  localStorage.setItem(COSMETIC_KEY, JSON.stringify(equipped));
  return equipped;
}

export function unequipCosmetic(category) {
  const equipped = getEquippedCosmetics();
  equipped[category] = null;
  localStorage.setItem(COSMETIC_KEY, JSON.stringify(equipped));
  return equipped;
}

// Get all unlocked cosmetics for a given level
export function getUnlockedCosmetics(level) {
  return ALL_REWARDS
    .filter(r => r.type === 'cosmetic' && r.level <= level)
    .map(r => ({
      ...r,
      pool: COSMETIC_POOLS[r.cosmeticCategory]?.find(p => p.id === r.cosmeticRef),
    }));
}

// Get all cosmetics for a category (for settings display)
export function getAllCosmeticsForCategory(category) {
  return ALL_REWARDS
    .filter(r => r.type === 'cosmetic' && r.cosmeticCategory === category)
    .map(r => ({
      ...r,
      pool: COSMETIC_POOLS[r.cosmeticCategory]?.find(p => p.id === r.cosmeticRef),
    }));
}

// Get the next reward at or above current level
export function getNextReward(level) {
  return ALL_REWARDS.find(r => r.level > level) || null;
}

// Get current title based on equipped or highest unlocked
export function getCurrentTitle(level) {
  const equipped = getEquippedCosmetics();
  if (equipped.titleBadge) {
    const reward = ALL_REWARDS.find(r => r.type === 'cosmetic' && r.cosmeticId === equipped.titleBadge);
    if (reward && reward.level <= level) return reward.title;
  }
  // Fall back to level-based title
  if (level >= 400) return '🌌 Cosmic Gamer';
  if (level >= 300) return '🔥 Phoenix Player';
  if (level >= 200) return '👑 Board Game Queen';
  if (level >= 100) return '🏆 Champion';
  if (level >= 50) return '📚 Collector';
  if (level >= 20) return '🧠 Strategist';
  if (level >= 10) return '🗺 Game Explorer';
  return '🐣 Dice Hatchling';
}
