/**
 * Battle Pass — 500 Levels
 * XP: (playingTime / 60) × 10 (min 2). Level cost: 40 + level × 5
 */
const BP_KEY = 'gamejar_battlepass';
const COSMETIC_KEY = 'gamejar_cosmetics';
const MAX_LEVEL = 500;

// ── Animals — cat free at 0, rest every 50, unicorn at 500 ──
export const ANIMAL_UNLOCKS = [
  { level: 0,   id: 'cat',      name: 'Cat',       icon: '🐱', desc: 'A curious kitty who stops to groom' },
  { level: 50,  id: 'bunny',    name: 'Bunny',     icon: '🐰', desc: 'An excited bunny who does binkies!' },
  { level: 100, id: 'dog',      name: 'Dog',       icon: '🐕', desc: 'A happy pup who stops to wag' },
  { level: 150, id: 'turtle',   name: 'Turtle',    icon: '🐢', desc: 'A steady friend who hides in their shell' },
  { level: 200, id: 'fox',      name: 'Fox',       icon: '🦊', desc: 'A sly fox who pounces at nothing' },
  { level: 250, id: 'owl',      name: 'Owl',       icon: '🦉', desc: 'A wise owl who spins their head' },
  { level: 300, id: 'penguin',  name: 'Penguin',   icon: '🐧', desc: 'An adorable waddle-and-slide expert' },
  { level: 350, id: 'redpanda', name: 'Red Panda', icon: '🐾', desc: 'A curious red panda who stands up to look around' },
  { level: 400, id: 'hedgehog', name: 'Hedgehog',  icon: '🦔', desc: 'A tiny friend who curls into a ball' },
  { level: 450, id: 'dragon',   name: 'Dragon',    icon: '🐉', desc: 'A magical dragon who breathes hearts!' },
  { level: 500, id: 'unicorn',  name: 'Unicorn',   icon: '🦄', desc: 'A majestic unicorn with a sparkle trail' },
];

// ── Redeemables (repeat every 50 levels) ─────────────────
const MAJOR_OFFSETS = [
  { offset: 5,  icon: '🎲', title: 'Game Night Date', reward: 'Husband Plays Board Game with You', redeemLabel: 'Redeem Game Date' },
  { offset: 15, icon: '🍽', title: 'Chef\'s Kiss', reward: 'Husband Cooks Dinner', redeemLabel: 'Redeem Dinner' },
  { offset: 25, icon: '🛍', title: 'Shopping Spree', reward: 'New Board Game Purchase!', redeemLabel: 'Redeem New Game' },
  { offset: 35, icon: '🎬', title: 'Movie Night', reward: 'Movie Night — She Picks!', redeemLabel: 'Redeem Movie Night' },
  { offset: 45, icon: '💆', title: 'Sparkling Clean', reward: 'Husband Cleans the House (or Pays Someone)', redeemLabel: 'Redeem Clean House' },
];

// ── Cosmetic Definitions ────────────────────────────────────
export const COSMETIC_CATEGORIES = {
  jarTheme:        { label: 'Jar Style',       icon: '🫙', page: 'jar' },
  lidTheme:        { label: 'Jar Lid',         icon: '🔶', page: 'jar' },
  paperTheme:      { label: 'Paper Slips',     icon: '📝', page: 'jar' },
  sparkleStyle:    { label: 'Draw Effects',    icon: '✨', page: 'jar' },
  jarDecor:        { label: 'Jar Decoration',  icon: '🎀', page: 'jar' },
  bgTheme:         { label: 'Background',      icon: '🎨', page: 'both' },
  heartColor:      { label: 'Floating Hearts', icon: '💕', page: 'both' },
  meepleAccessory: { label: 'Animal Hats',     icon: '👒', page: 'games' },
  navStyle:        { label: 'Nav Theme',        icon: '📱', page: 'games' },
  titleBadge:      { label: 'Title Badge',     icon: '🏷', page: 'rewards' },
};

export const COSMETIC_POOLS = {
  jarTheme: [
    { id:'jar_rose',name:'Rose Glass',icon:'🌹',css:{jarTint:'rgba(232,160,191,0.2)',jarEdge:'rgba(232,160,191,0.4)'}},
    { id:'jar_ocean',name:'Ocean Glass',icon:'🌊',css:{jarTint:'rgba(120,180,220,0.25)',jarEdge:'rgba(120,180,220,0.45)'}},
    { id:'jar_sunset',name:'Sunset Glass',icon:'🌅',css:{jarTint:'rgba(240,180,100,0.2)',jarEdge:'rgba(240,180,100,0.4)'}},
    { id:'jar_mint',name:'Mint Glass',icon:'🍃',css:{jarTint:'rgba(140,210,170,0.2)',jarEdge:'rgba(140,210,170,0.4)'}},
    { id:'jar_lavender',name:'Lavender Glass',icon:'💜',css:{jarTint:'rgba(180,150,220,0.2)',jarEdge:'rgba(180,150,220,0.4)'}},
    { id:'jar_crystal',name:'Crystal Glass',icon:'💎',css:{jarTint:'rgba(200,230,255,0.3)',jarEdge:'rgba(200,230,255,0.5)'}},
    { id:'jar_cherry',name:'Cherry Glass',icon:'🍒',css:{jarTint:'rgba(200,80,100,0.15)',jarEdge:'rgba(200,80,100,0.35)'}},
    { id:'jar_honey',name:'Honey Glass',icon:'🍯',css:{jarTint:'rgba(230,190,80,0.2)',jarEdge:'rgba(230,190,80,0.4)'}},
    { id:'jar_aurora',name:'Aurora Glass',icon:'🌌',css:{jarTint:'rgba(100,200,180,0.2)',jarEdge:'rgba(150,100,200,0.35)'}},
    { id:'jar_pearl',name:'Pearl Glass',icon:'🦪',css:{jarTint:'rgba(240,230,245,0.3)',jarEdge:'rgba(220,200,240,0.4)'}},
  ],
  lidTheme: [
    { id:'lid_rosegold',name:'Rose Gold',icon:'🌸',css:{lidFrom:'#D4A0A8',lidTo:'#B76E79'}},
    { id:'lid_silver',name:'Silver',icon:'🪨',css:{lidFrom:'#D0D8E0',lidTo:'#A8B0B8'}},
    { id:'lid_copper',name:'Copper',icon:'🧡',css:{lidFrom:'#DAA06D',lidTo:'#B87333'}},
    { id:'lid_platinum',name:'Platinum',icon:'⬜',css:{lidFrom:'#E8EDF0',lidTo:'#C8D0D8'}},
    { id:'lid_ruby',name:'Ruby',icon:'❤️',css:{lidFrom:'#C41E3A',lidTo:'#9B111E'}},
    { id:'lid_emerald',name:'Emerald',icon:'💚',css:{lidFrom:'#80C090',lidTo:'#50A060'}},
    { id:'lid_sapphire',name:'Sapphire',icon:'💙',css:{lidFrom:'#7090D0',lidTo:'#4060A0'}},
    { id:'lid_amethyst',name:'Amethyst',icon:'💜',css:{lidFrom:'#A080C0',lidTo:'#7B4FA0'}},
    { id:'lid_obsidian',name:'Obsidian',icon:'🖤',css:{lidFrom:'#4A4A4A',lidTo:'#2A2A2A'}},
    { id:'lid_rainbow',name:'Rainbow',icon:'🌈',css:{lidFrom:'#E8C87B',lidTo:'#D4728C'}},
  ],
  paperTheme: [
    { id:'paper_sakura',name:'Sakura Petals',icon:'🌸',colors:['#FFE4EC','#FFD0DC','#FFEEF2','#FFB8CC','#FFE8F0']},
    { id:'paper_ocean',name:'Ocean Waves',icon:'🐚',colors:['#D0E8F0','#B8D8E8','#E0F0F8','#A0D0E0','#C8E8F0']},
    { id:'paper_forest',name:'Forest Floor',icon:'🌿',colors:['#D8E8D0','#E8DCC8','#C8E0C0','#E0D8C0','#D0E0C8']},
    { id:'paper_sunset',name:'Sunset Glow',icon:'🌇',colors:['#FFE0C8','#FFD0B0','#FFE8D8','#FFC8A0','#FFD8C0']},
    { id:'paper_galaxy',name:'Galaxy Dust',icon:'🌌',colors:['#E0D0F0','#D0C0E8','#D8D0F0','#C8B8E0','#E8E0F8']},
    { id:'paper_rainbow',name:'Rainbow Notes',icon:'🌈',colors:['#FFD0D0','#FFE8C0','#D0FFD0','#D0E8FF','#F0D0FF']},
    { id:'paper_autumn',name:'Autumn Leaves',icon:'🍂',colors:['#F0D8B0','#E8C8A0','#F0E0C0','#D8B090','#F0D0A0']},
    { id:'paper_candy',name:'Candy Shop',icon:'🍬',colors:['#FFD0E8','#D0F0FF','#FFF0C0','#D0FFE0','#F0D0FF']},
    { id:'paper_midnight',name:'Midnight Notes',icon:'🌙',colors:['#C8C8D8','#D0D0E0','#B8B8D0','#D8D0E0','#C0C0D8']},
    { id:'paper_gold',name:'Golden Tickets',icon:'🎫',colors:['#F8E8C8','#F0D8A0','#F8F0D0','#E8D090','#F0E0B8']},
  ],
  sparkleStyle: [
    { id:'spark_hearts',name:'Heart Burst',icon:'💖',emojis:['💖','💗','💕','💝','💘','❤️']},
    { id:'spark_stars',name:'Starfall',icon:'⭐',emojis:['⭐','🌟','✨','💫','🌠','⭐']},
    { id:'spark_flowers',name:'Flower Shower',icon:'🌸',emojis:['🌸','🌺','🌷','🌹','💐','🌻']},
    { id:'spark_magic',name:'Magic Dust',icon:'🔮',emojis:['🔮','✨','💫','⚡','🌙','💜']},
    { id:'spark_confetti',name:'Confetti Pop',icon:'🎊',emojis:['🎊','🎉','🥳','🎈','🎀','✨']},
    { id:'spark_snow',name:'Snowfall',icon:'❄️',emojis:['❄️','🌨','⛄','❄️','🤍','💎']},
    { id:'spark_butterflies',name:'Butterflies',icon:'🦋',emojis:['🦋','🦋','🌸','✨','🌺','🦋']},
    { id:'spark_gems',name:'Gem Shower',icon:'💎',emojis:['💎','💍','👑','✨','🌟','💫']},
    { id:'spark_fire',name:'Fire Burst',icon:'🔥',emojis:['🔥','⚡','💥','✨','🌟','🔥']},
    { id:'spark_cats',name:'Cat Party',icon:'🐱',emojis:['🐱','😺','😸','🐾','✨','💕']},
  ],
  bgTheme: [
    { id:'bg_blush',name:'Rose Blush',icon:'🌹',css:{bgFrom:'#FFF8F0',bgTo:'#FFE4E1'}},
    { id:'bg_ocean',name:'Deep Ocean',icon:'🌊',css:{bgFrom:'#F0F4FA',bgTo:'#D8E8F0'}},
    { id:'bg_forest',name:'Enchanted Forest',icon:'🌲',css:{bgFrom:'#F0F8F0',bgTo:'#D8ECD8'}},
    { id:'bg_sunset',name:'Golden Hour',icon:'🌇',css:{bgFrom:'#FFF8E8',bgTo:'#FFE8D0'}},
    { id:'bg_lavender',name:'Lavender Dream',icon:'💜',css:{bgFrom:'#F8F0FA',bgTo:'#E8D8F0'}},
    { id:'bg_midnight',name:'Midnight Sky',icon:'🌙',css:{bgFrom:'#E8E0F0',bgTo:'#D0C0E0'}},
    { id:'bg_cherry',name:'Cherry Blossom',icon:'🌸',css:{bgFrom:'#FFF0F2',bgTo:'#FFD8E0'}},
    { id:'bg_arctic',name:'Arctic Frost',icon:'🧊',css:{bgFrom:'#F0F8FF',bgTo:'#D8E8F8'}},
    { id:'bg_autumn',name:'Autumn Warmth',icon:'🍂',css:{bgFrom:'#FFF8F0',bgTo:'#F0DCC8'}},
    { id:'bg_galaxy',name:'Cosmic Nebula',icon:'🌌',css:{bgFrom:'#F0E8F8',bgTo:'#D8D0E8'}},
  ],
  heartColor: [
    { id:'heart_pink',name:'Classic Pink',icon:'💗',color:'#D4728C'},
    { id:'heart_red',name:'True Red',icon:'❤️',color:'#CC3344'},
    { id:'heart_purple',name:'Royal Purple',icon:'💜',color:'#9B59B6'},
    { id:'heart_blue',name:'Blue Dream',icon:'💙',color:'#5B9BD5'},
    { id:'heart_gold',name:'Golden Love',icon:'💛',color:'#D4A030'},
    { id:'heart_green',name:'Nature Love',icon:'💚',color:'#5AA060'},
    { id:'heart_orange',name:'Sunset Hearts',icon:'🧡',color:'#E08040'},
    { id:'heart_white',name:'Pure White',icon:'🤍',color:'#C0B0B0'},
    { id:'heart_rainbow',name:'Rainbow',icon:'🌈',color:'#D4728C'},
    { id:'heart_sparkle',name:'Sparkle',icon:'✨',color:'#C9A96E'},
  ],
  meepleAccessory: [
    { id:'meeple_crown',name:'Tiny Crown',icon:'👑',accessory:'crown'},
    { id:'meeple_witch',name:'Witch Hat',icon:'🧙‍♀️',accessory:'witch'},
    { id:'meeple_flower',name:'Flower Crown',icon:'🌺',accessory:'flower'},
    { id:'meeple_santa',name:'Santa Hat',icon:'🎅',accessory:'santa'},
    { id:'meeple_wizard',name:'Wizard Hat',icon:'🧙',accessory:'wizard'},
    { id:'meeple_bunny',name:'Bunny Ears',icon:'🐰',accessory:'bunny'},
    { id:'meeple_pirate',name:'Pirate Hat',icon:'🏴‍☠️',accessory:'pirate'},
    { id:'meeple_chef',name:'Chef Hat',icon:'👨‍🍳',accessory:'chef'},
    { id:'meeple_party',name:'Party Hat',icon:'🥳',accessory:'party'},
    { id:'meeple_detective',name:'Detective Hat',icon:'🕵️',accessory:'detective'},
  ],
  jarDecor: [
    { id:'decor_ribbon',name:'Pink Ribbon',icon:'🎀',decor:'ribbon'},
    { id:'decor_star',name:'Star Sticker',icon:'⭐',decor:'star'},
    { id:'decor_heart',name:'Heart Sticker',icon:'❤️',decor:'heart'},
    { id:'decor_flower',name:'Flower Chain',icon:'🌼',decor:'flower'},
    { id:'decor_gem',name:'Gem Accent',icon:'💎',decor:'gem'},
    { id:'decor_bow',name:'Big Bow',icon:'🎀',decor:'bow'},
    { id:'decor_lights',name:'Fairy Lights',icon:'💡',decor:'lights'},
    { id:'decor_lace',name:'Lace Wrap',icon:'🧵',decor:'lace'},
    { id:'decor_clover',name:'Lucky Charm',icon:'🍀',decor:'clover'},
    { id:'decor_butterfly',name:'Butterfly Pin',icon:'🦋',decor:'butterfly'},
  ],
  titleBadge: [
    { id:'title_rookie',name:'Dice Hatchling',icon:'🐣'},
    { id:'title_explorer',name:'Game Explorer',icon:'🗺'},
    { id:'title_strategist',name:'Strategist',icon:'🧠'},
    { id:'title_collector',name:'Collector',icon:'📚'},
    { id:'title_champion',name:'Champion',icon:'🏆'},
    { id:'title_legend',name:'Living Legend',icon:'🌟'},
    { id:'title_queen',name:'Board Game Queen',icon:'👑'},
    { id:'title_wizard',name:'Game Wizard',icon:'🧙‍♀️'},
    { id:'title_phoenix',name:'Phoenix Player',icon:'🔥'},
    { id:'title_cosmic',name:'Cosmic Gamer',icon:'🌌'},
  ],
  navStyle: [
    { id:'nav_rose',name:'Rose Nav',icon:'🌹',css:{navBg:'rgba(255,240,238,0.95)',navBorder:'#FFD0D0'}},
    { id:'nav_ocean',name:'Ocean Nav',icon:'🌊',css:{navBg:'rgba(240,248,255,0.95)',navBorder:'#C0D8E8'}},
    { id:'nav_forest',name:'Forest Nav',icon:'🌿',css:{navBg:'rgba(240,250,240,0.95)',navBorder:'#C0D8C0'}},
    { id:'nav_sunset',name:'Sunset Nav',icon:'🌅',css:{navBg:'rgba(255,250,240,0.95)',navBorder:'#E8D0A0'}},
    { id:'nav_lavender',name:'Lavender Nav',icon:'💜',css:{navBg:'rgba(248,240,252,0.95)',navBorder:'#D0C0E0'}},
    { id:'nav_midnight',name:'Midnight Nav',icon:'🌙',css:{navBg:'rgba(240,235,245,0.95)',navBorder:'#C0B8D0'}},
    { id:'nav_cherry',name:'Cherry Nav',icon:'🍒',css:{navBg:'rgba(255,245,245,0.95)',navBorder:'#E8A0A0'}},
    { id:'nav_gold',name:'Gold Nav',icon:'✨',css:{navBg:'rgba(255,250,235,0.95)',navBorder:'#D4B060'}},
    { id:'nav_arctic',name:'Arctic Nav',icon:'🧊',css:{navBg:'rgba(240,250,255,0.95)',navBorder:'#B0D0E0'}},
    { id:'nav_galaxy',name:'Galaxy Nav',icon:'🌌',css:{navBg:'rgba(244,238,250,0.95)',navBorder:'#C8B0E0'}},
  ],
};

const CATEGORY_CYCLE = ['jarTheme','sparkleStyle','paperTheme','meepleAccessory','bgTheme','heartColor','lidTheme','jarDecor','titleBadge','navStyle'];
const COSMETIC_OFFSETS = [1,3,8,10,18,20,28,30,38,40];

function generateAllRewards() {
  const rewards = [];
  for (let block = 0; block < 10; block++) {
    const base = block * 50;
    COSMETIC_OFFSETS.forEach((offset, slotIdx) => {
      const level = base + offset;
      if (level < 1 || level > MAX_LEVEL) return;
      const catKey = CATEGORY_CYCLE[slotIdx];
      const pool = COSMETIC_POOLS[catKey];
      const item = pool[block % pool.length];
      rewards.push({ level, type:'cosmetic', cosmeticCategory:catKey, cosmeticId:`${item.id}_b${block}`, cosmeticRef:item.id, icon:item.icon, title:item.name, reward:item.desc||'', categoryLabel:COSMETIC_CATEGORIES[catKey].label });
    });
    MAJOR_OFFSETS.forEach(major => {
      const level = base + major.offset;
      if (level < 1 || level > MAX_LEVEL) return;
      const tier = block + 1;
      rewards.push({ level, type:'redeemable', icon:major.icon, title:`${major.title}${tier>1?` (×${tier})`:''}`, reward:major.reward, redeemLabel:major.redeemLabel });
    });
    // Animal at 50-offset (cat is 0 = free, not a reward)
    const animalLevel = base + 50;
    const animal = ANIMAL_UNLOCKS.find(a => a.level === animalLevel);
    if (animal) rewards.push({ level:animalLevel, type:'animal', icon:animal.icon, title:`New Friend: ${animal.name}`, reward:animal.desc, animalId:animal.id });
  }
  rewards.sort((a, b) => a.level - b.level);
  return rewards;
}

export const ALL_REWARDS = generateAllRewards();
export function getRewardsForBlock(blockIndex) { const s=blockIndex*50+1,e=(blockIndex+1)*50; return ALL_REWARDS.filter(r=>r.level>=s&&r.level<=e); }
export function getBlockForLevel(level) { return Math.floor(Math.max(0,level-1)/50); }

// ── XP ──────────────────────────────────────────────────────
export function xpForLevel(level) { return 40 + level * 5; }
export function getLevelFromXP(totalXP) {
  let level=0,xpUsed=0;
  while(level<MAX_LEVEL){const n=xpForLevel(level+1);if(xpUsed+n>totalXP)break;xpUsed+=n;level++;}
  const xpInto=totalXP-xpUsed,xpNeeded=level<MAX_LEVEL?xpForLevel(level+1):1;
  return { level:Math.min(level,MAX_LEVEL), xpIntoCurrentLevel:xpInto, xpNeededForNext:xpNeeded, totalXP, progressPercent:level>=MAX_LEVEL?100:Math.min(100,(xpInto/xpNeeded)*100), isMaxLevel:level>=MAX_LEVEL };
}

export function calculatePlayXP(game, allPlays) {
  const bonuses=[]; const hours=(game.playingTime||30)/60; const baseXP=Math.max(2,Math.round(hours*10)); let total=baseXP;
  bonuses.push({label:`${game.playingTime||30}min game`,xp:baseXP});
  if(!allPlays.filter(p=>p.gameId===game.id).length){total+=15;bonuses.push({label:'First time playing!',xp:15});}
  if(game.tags?.some(t=>t.toLowerCase().includes('cooperative')||t.toLowerCase().includes('co-op'))){total+=3;bonuses.push({label:'Co-op bonus',xp:3});}
  const day=new Date().getDay();if(day===0||day===5||day===6){total+=2;bonuses.push({label:'Weekend play!',xp:2});}
  const ws=new Date();ws.setDate(ws.getDate()-ws.getDay());ws.setHours(0,0,0,0);
  const wc=[...allPlays,{gameId:game.id,date:new Date().toISOString()}];
  if(new Set(wc.filter(p=>new Date(p.date)>=ws).map(p=>p.gameId)).size===3){total+=25;bonuses.push({label:'3 unique games this week!',xp:25});}
  const rd=new Set();[...allPlays,{date:new Date().toISOString()}].forEach(p=>{const d=new Date(p.date);rd.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);});
  let streak=0;for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);if(rd.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`))streak++;else break;}
  if(streak>=7){total+=50;bonuses.push({label:'7-day streak! 🔥',xp:50});}
  if(allPlays.filter(p=>p.gameId===game.id).length===9){total+=30;bonuses.push({label:'Mastery: 10 plays!',xp:30});}
  return {total,bonuses};
}

// ── Storage ─────────────────────────────────────────────────
function getDefault(){return{totalXP:0,plays:[],redeemedRewards:[]};}
export function getBattlePassState(){if(typeof window==='undefined')return getDefault();try{const r=localStorage.getItem(BP_KEY);return r?JSON.parse(r):getDefault();}catch{return getDefault();}}
export function saveBattlePassState(s){if(typeof window!=='undefined')localStorage.setItem(BP_KEY,JSON.stringify(s));}

export function logPlay(game){
  const state=getBattlePassState();
  const{total,bonuses}=calculatePlayXP(game,state.plays);
  const play={id:`play_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,gameId:game.id,gameName:game.name,date:new Date().toISOString(),origin:'jar-draw',accepted:true,xpEarned:total,bonuses,tags:[...(game.tags||[])],playingTime:game.playingTime||null,bggLinked:false,bggPlayId:null};
  state.plays.push(play);state.totalXP+=total;saveBattlePassState(state);
  return{play,levelInfo:getLevelFromXP(state.totalXP),state};
}
export function redeemReward(level){const s=getBattlePassState();if(!s.redeemedRewards.includes(level)){s.redeemedRewards.push(level);saveBattlePassState(s);}return s;}
export function initializeFromCollection(){return getBattlePassState();}

// ── Cosmetics ───────────────────────────────────────────────
function getDefaultCosmetics(){return{jarTheme:null,lidTheme:null,paperTheme:null,sparkleStyle:null,bgTheme:null,heartColor:null,jarDecor:null,titleBadge:null,navStyle:null,animalAccessories:{}};}
export function getEquippedCosmetics(){if(typeof window==='undefined')return getDefaultCosmetics();try{const r=localStorage.getItem(COSMETIC_KEY);return r?{...getDefaultCosmetics(),...JSON.parse(r)}:getDefaultCosmetics();}catch{return getDefaultCosmetics();}}
export function equipCosmetic(cat,id){const eq=getEquippedCosmetics();eq[cat]=id;localStorage.setItem(COSMETIC_KEY,JSON.stringify(eq));return eq;}
export function unequipCosmetic(cat){const eq=getEquippedCosmetics();eq[cat]=null;localStorage.setItem(COSMETIC_KEY,JSON.stringify(eq));return eq;}
export function setAnimalAccessory(animalId,accessoryId){const eq=getEquippedCosmetics();if(!eq.animalAccessories)eq.animalAccessories={};eq.animalAccessories[animalId]=accessoryId;localStorage.setItem(COSMETIC_KEY,JSON.stringify(eq));return eq;}
export function clearAnimalAccessory(animalId){const eq=getEquippedCosmetics();if(!eq.animalAccessories)eq.animalAccessories={};eq.animalAccessories[animalId]=null;localStorage.setItem(COSMETIC_KEY,JSON.stringify(eq));return eq;}
export function getAllCosmeticsForCategory(cat){return ALL_REWARDS.filter(r=>r.type==='cosmetic'&&r.cosmeticCategory===cat).map(r=>({...r,pool:COSMETIC_POOLS[r.cosmeticCategory]?.find(p=>p.id===r.cosmeticRef)}));}
export function getNextReward(level){return ALL_REWARDS.find(r=>r.level>level)||null;}
export function resolveCosmetic(cat,id){if(!id)return null;const r=ALL_REWARDS.find(r=>r.type==='cosmetic'&&r.cosmeticId===id);if(!r)return null;return COSMETIC_POOLS[cat]?.find(p=>p.id===r.cosmeticRef)||null;}
export function getCurrentTitle(level){
  const eq=getEquippedCosmetics();if(eq.titleBadge){const r=ALL_REWARDS.find(r=>r.cosmeticId===eq.titleBadge);if(r&&r.level<=level)return r.title;}
  if(level>=400)return'🌌 Cosmic Gamer';if(level>=300)return'🔥 Phoenix Player';if(level>=200)return'👑 Board Game Queen';if(level>=100)return'🏆 Champion';if(level>=50)return'📚 Collector';if(level>=20)return'🧠 Strategist';if(level>=10)return'🗺 Game Explorer';return'🐣 Dice Hatchling';
}
export function getUnlockedAnimals(level){return ANIMAL_UNLOCKS.filter(a=>a.level<=level);}
export function getCosmeticCategoriesForPage(page){return Object.entries(COSMETIC_CATEGORIES).filter(([_,c])=>c.page===page||c.page==='both').map(([key,c])=>({key,...c}));}
