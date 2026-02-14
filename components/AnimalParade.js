'use client';
import { useState, useEffect } from 'react';
import { getUnlockedAnimals, getBattlePassState, getLevelFromXP, getEquippedCosmetics, COSMETIC_POOLS } from '@/lib/battlePass';

// ── Accessory overlay (hat) scaled per animal ───────────────
function AccessoryOverlay({ accessory, offset }) {
  if (!accessory) return null;
  const [dx, dy, sc] = offset || [0, 0, 1];
  const overlays = {
    crown: <g><polygon points="0,8 3,-1 6,5 9,-2 12,5 15,-1 18,8" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5"/><rect x="0" y="7" width="18" height="3" rx="1" fill="#FFD700"/><circle cx="3" cy="1" r="1" fill="#FF6B6B"/><circle cx="9" cy="0" r="1" fill="#87CEEB"/><circle cx="15" cy="1" r="1" fill="#90EE90"/></g>,
    witch: <g><polygon points="10,16 2,16 6,-2" fill="#4B2D73"/><ellipse cx="6" cy="15" rx="10" ry="2.5" fill="#4B2D73"/><circle cx="6" cy="-1" r="1.5" fill="#7CFC00"/></g>,
    flower: <g>{[[2,2,'#FF69B4'],[7,0,'#FFB347'],[12,0,'#87CEEB'],[17,2,'#DDA0DD']].map(([x,y,c],i)=><g key={i}><circle cx={x} cy={y} r="3" fill={c} opacity="0.8"/><circle cx={x} cy={y} r="1.2" fill="#FFD700"/></g>)}</g>,
    santa: <g><path d="M0 10 Q10 -2 20 7 L18 12 L0 12 Z" fill="#CC0000"/><ellipse cx="0" cy="11" rx="20" ry="2.5" fill="white"/><circle cx="18" cy="4" r="3" fill="white"/></g>,
    wizard: <g><polygon points="10,-2 0,16 20,16" fill="#2244AA"/><ellipse cx="10" cy="15" rx="12" ry="2.5" fill="#2244AA"/><text x="7" y="7" fontSize="3.5" fill="#FFD700">✦</text></g>,
    bunny: <g><ellipse cx="5" cy="2" rx="3.5" ry="9" fill="white" stroke="#3A3030" strokeWidth="0.7"/><ellipse cx="15" cy="2" rx="3.5" ry="9" fill="white" stroke="#3A3030" strokeWidth="0.7"/><ellipse cx="5" cy="2" rx="1.8" ry="6" fill="#FFB6C1"/><ellipse cx="15" cy="2" rx="1.8" ry="6" fill="#FFB6C1"/></g>,
    pirate: <g><path d="M0 8 Q10 0 20 8 Z" fill="#1A1A1A"/><ellipse cx="10" cy="8" rx="12" ry="2.5" fill="#1A1A1A"/><text x="6" y="6" fontSize="6">☠️</text></g>,
    chef: <g><circle cx="10" cy="2" r="5" fill="white" stroke="#DDD" strokeWidth="0.4"/><circle cx="5" cy="4" r="4" fill="white"/><circle cx="15" cy="4" r="4" fill="white"/><rect x="1" y="7" width="18" height="4" rx="2" fill="white" stroke="#DDD" strokeWidth="0.4"/></g>,
    party: <g><polygon points="8,-2 0,14 16,14" fill="#FF69B4" stroke="#DD4488" strokeWidth="0.3"/><circle cx="8" cy="-2" r="1.8" fill="#FFD700"/><circle cx="5" cy="5" r="1" fill="#87CEEB"/><circle cx="10" cy="8" r="0.8" fill="#90EE90"/></g>,
    detective: <g><ellipse cx="12" cy="6" rx="14" ry="4" fill="#8B6914"/><path d="M2 6 Q12 -2 22 5 L22 6 L2 6 Z" fill="#8B6914"/><rect x="7" y="2" width="10" height="4" rx="1" fill="#6B4F10"/></g>,
  };
  return <g transform={`translate(${dx}, ${dy}) scale(${sc})`}>{overlays[accessory] || null}</g>;
}

// ── Animal SVGs ─────────────────────────────────────────────
function CatSVG({acc,ao}){return(<svg viewBox="0 0 40 36" fill="none" className="animal-svg"><AccessoryOverlay accessory={acc} offset={ao}/><polygon points="8,12 5,2 14,10" fill="#FFE4C9" stroke="#5C4033" strokeWidth="1.2" strokeLinejoin="round"/><polygon points="32,12 35,2 26,10" fill="#FFE4C9" stroke="#5C4033" strokeWidth="1.2" strokeLinejoin="round"/><polygon points="8.5,11 7,5 13,10" fill="#FFB6C1" opacity="0.5"/><polygon points="31.5,11 33,5 27,10" fill="#FFB6C1" opacity="0.5"/><ellipse cx="20" cy="22" rx="14" ry="12" fill="#FFE4C9" stroke="#5C4033" strokeWidth="1.4"/><path d="M34 22 Q42 14 38 8" stroke="#5C4033" strokeWidth="2" fill="none" strokeLinecap="round"/><ellipse cx="15" cy="20" rx="2" ry="2.5" fill="#5C4033"/><ellipse cx="25" cy="20" rx="2" ry="2.5" fill="#5C4033"/><circle cx="15.8" cy="19.2" r="0.8" fill="white"/><circle cx="25.8" cy="19.2" r="0.8" fill="white"/><ellipse cx="20" cy="24" rx="1.5" ry="1" fill="#FFB0A0"/><path d="M18.5 26 Q20 28 21.5 26" stroke="#5C4033" strokeWidth="0.8" fill="none" strokeLinecap="round"/><line x1="2" y1="22" x2="14" y2="23" stroke="#5C4033" strokeWidth="0.6" opacity="0.4"/><line x1="2" y1="25" x2="14" y2="24.5" stroke="#5C4033" strokeWidth="0.6" opacity="0.4"/><line x1="26" y1="23" x2="38" y2="22" stroke="#5C4033" strokeWidth="0.6" opacity="0.4"/><line x1="26" y1="24.5" x2="38" y2="25" stroke="#5C4033" strokeWidth="0.6" opacity="0.4"/><ellipse cx="11" cy="25" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.25"/><ellipse cx="29" cy="25" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.25"/></svg>);}
function BunnySVG({acc,ao}){return(<svg viewBox="0 0 40 40" fill="none" className="animal-svg"><AccessoryOverlay accessory={acc} offset={ao}/><ellipse cx="14" cy="6" rx="4" ry="12" fill="white" stroke="#8B7355" strokeWidth="1.2"/><ellipse cx="26" cy="6" rx="4" ry="12" fill="white" stroke="#8B7355" strokeWidth="1.2"/><ellipse cx="14" cy="5" rx="2" ry="8" fill="#FFB6C1" opacity="0.5"/><ellipse cx="26" cy="5" rx="2" ry="8" fill="#FFB6C1" opacity="0.5"/><ellipse cx="20" cy="26" rx="13" ry="12" fill="white" stroke="#8B7355" strokeWidth="1.3"/><circle cx="15" cy="23" r="2" fill="#5C4033"/><circle cx="25" cy="23" r="2" fill="#5C4033"/><circle cx="15.7" cy="22.3" r="0.7" fill="white"/><circle cx="25.7" cy="22.3" r="0.7" fill="white"/><ellipse cx="20" cy="27" rx="2" ry="1.5" fill="#FFB0A0"/><path d="M18 29 Q20 31 22 29" stroke="#8B7355" strokeWidth="0.7" fill="none"/><ellipse cx="12" cy="27" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.3"/><ellipse cx="28" cy="27" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.3"/><circle cx="33" cy="30" r="4" fill="white" stroke="#8B7355" strokeWidth="0.8"/></svg>);}
function DogSVG({acc,ao}){return(<svg viewBox="0 0 44 36" fill="none" className="animal-svg"><AccessoryOverlay accessory={acc} offset={ao}/><ellipse cx="10" cy="16" rx="6" ry="10" fill="#C49A6C" stroke="#7A5C3D" strokeWidth="1.2" transform="rotate(-15 10 16)"/><ellipse cx="34" cy="16" rx="6" ry="10" fill="#C49A6C" stroke="#7A5C3D" strokeWidth="1.2" transform="rotate(15 34 16)"/><ellipse cx="22" cy="22" rx="14" ry="12" fill="#E8CFA0" stroke="#7A5C3D" strokeWidth="1.3"/><path d="M36 20 Q44 12 40 6" stroke="#7A5C3D" strokeWidth="2.5" fill="none" strokeLinecap="round"/><circle cx="17" cy="20" r="2.2" fill="#5C4033"/><circle cx="27" cy="20" r="2.2" fill="#5C4033"/><circle cx="17.7" cy="19.3" r="0.8" fill="white"/><circle cx="27.7" cy="19.3" r="0.8" fill="white"/><ellipse cx="22" cy="24.5" rx="2.5" ry="2" fill="#4A3030"/><path d="M20 27 Q22 29 24 27" stroke="#7A5C3D" strokeWidth="0.8" fill="none"/><ellipse cx="22" cy="29" rx="2" ry="2.5" fill="#FF8888" opacity="0.7"/></svg>);}
function TurtleSVG({acc,ao}){return(<svg viewBox="0 0 48 32" fill="none" className="animal-svg"><AccessoryOverlay accessory={acc} offset={ao}/><ellipse cx="24" cy="18" rx="16" ry="13" fill="#6B8E5A" stroke="#4A6B3A" strokeWidth="1.4"/><path d="M24 6 L18 18 L24 28 L30 18 Z" fill="#5A7D4A" opacity="0.4"/><ellipse cx="42" cy="20" rx="6" ry="5" fill="#90B878" stroke="#5A7D4A" strokeWidth="1"/><circle cx="44" cy="18" r="1.5" fill="#4A3030"/><circle cx="44.5" cy="17.5" r="0.5" fill="white"/><path d="M42 22 Q44 23.5 46 22" stroke="#5A7D4A" strokeWidth="0.6" fill="none"/><ellipse cx="14" cy="28" rx="4" ry="3" fill="#90B878" stroke="#5A7D4A" strokeWidth="0.6"/><ellipse cx="34" cy="28" rx="4" ry="3" fill="#90B878" stroke="#5A7D4A" strokeWidth="0.6"/></svg>);}
function FoxSVG({acc,ao}){return(<svg viewBox="0 0 44 36" fill="none" className="animal-svg"><AccessoryOverlay accessory={acc} offset={ao}/><polygon points="10,14 4,1 18,10" fill="#E87830" stroke="#A05020" strokeWidth="1.2" strokeLinejoin="round"/><polygon points="34,14 40,1 26,10" fill="#E87830" stroke="#A05020" strokeWidth="1.2" strokeLinejoin="round"/><polygon points="10,13 7,5 16,10" fill="#2A2A2A"/><polygon points="34,13 37,5 28,10" fill="#2A2A2A"/><ellipse cx="22" cy="22" rx="14" ry="12" fill="#E87830" stroke="#A05020" strokeWidth="1.3"/><ellipse cx="22" cy="25" rx="8" ry="7" fill="white" opacity="0.9"/><path d="M36 22 Q46 16 44 8" stroke="#E87830" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M44 8 L44 12" stroke="white" strokeWidth="2" strokeLinecap="round"/><ellipse cx="17" cy="20" rx="2" ry="1.8" fill="#3A2020"/><ellipse cx="27" cy="20" rx="2" ry="1.8" fill="#3A2020"/><circle cx="17.6" cy="19.5" r="0.7" fill="white"/><circle cx="27.6" cy="19.5" r="0.7" fill="white"/><ellipse cx="22" cy="24" rx="1.8" ry="1.3" fill="#3A2020"/></svg>);}
function OwlSVG({acc,ao}){return(<svg viewBox="0 0 40 38" fill="none" className="animal-svg"><AccessoryOverlay accessory={acc} offset={ao}/><polygon points="10,10 4,0 16,8" fill="#8B6F4E" stroke="#6B5030" strokeWidth="1"/><polygon points="30,10 36,0 24,8" fill="#8B6F4E" stroke="#6B5030" strokeWidth="1"/><ellipse cx="20" cy="22" rx="14" ry="14" fill="#C4A56E" stroke="#8B6F4E" strokeWidth="1.3"/><ellipse cx="20" cy="20" rx="10" ry="9" fill="#E8D8B8"/><circle cx="15" cy="18" r="4.5" fill="white" stroke="#8B6F4E" strokeWidth="0.8"/><circle cx="25" cy="18" r="4.5" fill="white" stroke="#8B6F4E" strokeWidth="0.8"/><circle cx="15" cy="18" r="3" fill="#4A3020"/><circle cx="25" cy="18" r="3" fill="#4A3020"/><circle cx="16" cy="17" r="1.2" fill="white"/><circle cx="26" cy="17" r="1.2" fill="white"/><polygon points="20,22 18,25 22,25" fill="#E8A040"/><path d="M6 22 Q2 30 8 34" stroke="#8B6F4E" strokeWidth="1.5" fill="#B0905A"/><path d="M34 22 Q38 30 32 34" stroke="#8B6F4E" strokeWidth="1.5" fill="#B0905A"/></svg>);}
function PenguinSVG({acc,ao}){return(<svg viewBox="0 0 36 38" fill="none" className="animal-svg"><AccessoryOverlay accessory={acc} offset={ao}/><ellipse cx="18" cy="22" rx="13" ry="14" fill="#2A2A3A" stroke="#1A1A2A" strokeWidth="1.2"/><ellipse cx="18" cy="24" rx="8" ry="10" fill="white"/><circle cx="14" cy="18" r="2.5" fill="white"/><circle cx="22" cy="18" r="2.5" fill="white"/><circle cx="14" cy="18" r="1.5" fill="#2A2A3A"/><circle cx="22" cy="18" r="1.5" fill="#2A2A3A"/><polygon points="18,20 15,23 21,23" fill="#E8A040"/><ellipse cx="5" cy="24" rx="4" ry="8" fill="#2A2A3A" transform="rotate(-10 5 24)"/><ellipse cx="31" cy="24" rx="4" ry="8" fill="#2A2A3A" transform="rotate(10 31 24)"/><ellipse cx="14" cy="35" rx="4" ry="2" fill="#E8A040"/><ellipse cx="22" cy="35" rx="4" ry="2" fill="#E8A040"/></svg>);}
function RedPandaSVG({acc,ao}){return(<svg viewBox="0 0 44 38" fill="none" className="animal-svg"><AccessoryOverlay accessory={acc} offset={ao}/><circle cx="10" cy="8" r="5" fill="#C04020" stroke="#8B3015" strokeWidth="1"/><circle cx="34" cy="8" r="5" fill="#C04020" stroke="#8B3015" strokeWidth="1"/><circle cx="10" cy="8" r="3" fill="#E8D0B0"/><circle cx="34" cy="8" r="3" fill="#E8D0B0"/><ellipse cx="22" cy="22" rx="14" ry="13" fill="#C04020" stroke="#8B3015" strokeWidth="1.3"/><ellipse cx="22" cy="20" rx="9" ry="8" fill="#E8D0B0"/><ellipse cx="16" cy="18" rx="4" ry="3" fill="#8B3015" opacity="0.6"/><ellipse cx="28" cy="18" rx="4" ry="3" fill="#8B3015" opacity="0.6"/><circle cx="16" cy="18" r="2" fill="#3A2020"/><circle cx="28" cy="18" r="2" fill="#3A2020"/><ellipse cx="22" cy="22.5" rx="2" ry="1.5" fill="#3A2020"/><rect x="36" y="16" width="6" height="14" rx="3" fill="#C04020" stroke="#8B3015" strokeWidth="0.8"/><rect x="36" y="18" width="6" height="2" fill="#8B3015" opacity="0.4"/><rect x="36" y="22" width="6" height="2" fill="#8B3015" opacity="0.4"/></svg>);}
function HedgehogSVG({acc,ao}){return(<svg viewBox="0 0 42 32" fill="none" className="animal-svg"><AccessoryOverlay accessory={acc} offset={ao}/>{[[-3,10],[0,5],[4,2],[9,0],[14,-1],[19,0],[24,1],[28,3],[31,6],[33,10]].map(([x,y],i)=><polygon key={i} points={`${x+10},${y+10} ${x+8},${y+4} ${x+12},${y+4}`} fill="#8B7355" opacity="0.8"/>)}<ellipse cx="22" cy="20" rx="15" ry="10" fill="#C4A56E" stroke="#8B7355" strokeWidth="1.3"/><ellipse cx="34" cy="20" rx="7" ry="7" fill="#E8D0B0" stroke="#8B7355" strokeWidth="1"/><circle cx="36" cy="18" r="1.8" fill="#3A2020"/><circle cx="36.5" cy="17.5" r="0.6" fill="white"/><circle cx="40" cy="20" r="1.5" fill="#3A2020"/><ellipse cx="16" cy="28" rx="3" ry="2" fill="#C4A56E" stroke="#8B7355" strokeWidth="0.6"/><ellipse cx="28" cy="28" rx="3" ry="2" fill="#C4A56E" stroke="#8B7355" strokeWidth="0.6"/></svg>);}
function DragonSVG({acc,ao}){return(<svg viewBox="0 0 52 40" fill="none" className="animal-svg"><AccessoryOverlay accessory={acc} offset={ao}/><path d="M14 18 Q4 6 8 2 L14 10 L18 4 L20 14" fill="#B080D0" stroke="#8060A0" strokeWidth="0.8" opacity="0.8"/><path d="M38 18 Q48 6 44 2 L38 10 L34 4 L32 14" fill="#B080D0" stroke="#8060A0" strokeWidth="0.8" opacity="0.8"/><ellipse cx="26" cy="24" rx="14" ry="12" fill="#A070C8" stroke="#7050A0" strokeWidth="1.3"/><ellipse cx="26" cy="26" rx="8" ry="8" fill="#D0B8E8"/><polygon points="18,12 16,4 21,10" fill="#C090E0"/><polygon points="34,12 36,4 31,10" fill="#C090E0"/><circle cx="21" cy="20" r="2.5" fill="#FFD700"/><circle cx="31" cy="20" r="2.5" fill="#FFD700"/><ellipse cx="21" cy="20" rx="1" ry="2" fill="#3A2020"/><ellipse cx="31" cy="20" rx="1" ry="2" fill="#3A2020"/><ellipse cx="26" cy="26" rx="3" ry="2" fill="#C090E0"/><path d="M24 28 Q26 30 28 28" stroke="#7050A0" strokeWidth="0.7" fill="none"/><path d="M40 24 Q48 20 46 14" stroke="#A070C8" strokeWidth="2.5" fill="none" strokeLinecap="round"/><path d="M46 14 L44 10 L48 12 Z" fill="#C090E0"/></svg>);}

// ── Unicorn: white body, rainbow mane, golden horn ──────────
function UnicornSVG({acc,ao}){return(<svg viewBox="0 0 50 40" fill="none" className="animal-svg"><AccessoryOverlay accessory={acc} offset={ao}/>
  {/* Horn */}
  <polygon points="28,4 25,16 31,16" fill="#FFD700" stroke="#DAA520" strokeWidth="0.8"/>
  <line x1="26" y1="8" x2="30" y2="8" stroke="#FFF8DC" strokeWidth="0.5"/><line x1="26.5" y1="11" x2="30" y2="11" stroke="#FFF8DC" strokeWidth="0.5"/>
  {/* Ears */}
  <polygon points="22,14 19,5 26,12" fill="white" stroke="#B0A0C0" strokeWidth="1" strokeLinejoin="round"/>
  <polygon points="34,14 37,5 30,12" fill="white" stroke="#B0A0C0" strokeWidth="1" strokeLinejoin="round"/>
  {/* Mane (rainbow) */}
  <path d="M18 12 Q14 18 16 24" stroke="#FF6B6B" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
  <path d="M16 14 Q12 20 14 26" stroke="#FFB347" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
  <path d="M14 16 Q10 22 13 28" stroke="#87CEEB" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
  <path d="M13 18 Q9 24 12 30" stroke="#DDA0DD" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7"/>
  {/* Body */}
  <ellipse cx="28" cy="24" rx="15" ry="13" fill="white" stroke="#B0A0C0" strokeWidth="1.4"/>
  {/* Eyes */}
  <ellipse cx="24" cy="20" rx="2" ry="2.5" fill="#6A4B8A"/><circle cx="24.7" cy="19.3" r="0.8" fill="white"/>
  <ellipse cx="33" cy="20" rx="2" ry="2.5" fill="#6A4B8A"/><circle cx="33.7" cy="19.3" r="0.8" fill="white"/>
  {/* Nose */}
  <ellipse cx="28.5" cy="25" rx="1.5" ry="1" fill="#DDA0DD"/>
  <path d="M26.5 27 Q28.5 29 30.5 27" stroke="#B0A0C0" strokeWidth="0.7" fill="none"/>
  {/* Blush */}
  <ellipse cx="20" cy="25" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.25"/>
  <ellipse cx="37" cy="25" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.25"/>
  {/* Tail (rainbow) */}
  <path d="M43 22 Q50 16 48 10" stroke="#FF6B6B" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
  <path d="M44 22 Q51 17 49 11" stroke="#87CEEB" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
  <path d="M45 23 Q52 18 50 12" stroke="#DDA0DD" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
  {/* Sparkle near horn */}
  <text x="32" y="6" fontSize="4" className="unicorn-sparkle">✨</text>
</svg>);}

// ── Config: speed, position, size, idle, accessory offset ───
// accOffset = [translateX, translateY, scale] for hat positioning
const ANIMAL_CONFIG = {
  cat:      { Comp: CatSVG,      speed: 18, bottom: 76, size: 42, idleClass: 'idle-groom',    accOffset: [11, -2, 0.9] },
  bunny:    { Comp: BunnySVG,     speed: 14, bottom: 76, size: 40, idleClass: 'idle-binky',    accOffset: [10, -8, 0.85] },
  dog:      { Comp: DogSVG,       speed: 15, bottom: 76, size: 44, idleClass: 'idle-wag',      accOffset: [12, -1, 0.9] },
  turtle:   { Comp: TurtleSVG,    speed: 30, bottom: 76, size: 46, idleClass: 'idle-hide',     accOffset: [33, 6, 0.7] },
  fox:      { Comp: FoxSVG,       speed: 12, bottom: 76, size: 42, idleClass: 'idle-pounce',   accOffset: [12, -2, 0.9] },
  owl:      { Comp: OwlSVG,       speed: 20, bottom: 160, size: 38, idleClass: 'idle-headspin', accOffset: [10, -4, 0.85] },
  penguin:  { Comp: PenguinSVG,   speed: 22, bottom: 76, size: 36, idleClass: 'idle-slide',    accOffset: [9, -1, 0.8] },
  redpanda: { Comp: RedPandaSVG,  speed: 16, bottom: 76, size: 44, idleClass: 'idle-standup',  accOffset: [12, -4, 0.85] },
  hedgehog: { Comp: HedgehogSVG,  speed: 24, bottom: 76, size: 40, idleClass: 'idle-curl',     accOffset: [26, 6, 0.7] },
  dragon:   { Comp: DragonSVG,    speed: 14, bottom: 200, size: 50, idleClass: 'idle-breathe',  accOffset: [16, -2, 0.9] },
  unicorn:  { Comp: UnicornSVG,   speed: 16, bottom: 120, size: 48, idleClass: 'idle-rear',    accOffset: [18, -4, 0.8] },
};

export default function AnimalParade() {
  const [animals, setAnimals] = useState([]);
  const [accessories, setAccessories] = useState({});

  useEffect(() => {
    const bp = getBattlePassState();
    const level = getLevelFromXP(bp.totalXP).level;
    setAnimals(getUnlockedAnimals(level));
    const eq = getEquippedCosmetics();
    const accMap = {};
    if (eq.animalAccessories) {
      const allAcc = COSMETIC_POOLS.meepleAccessory;
      Object.entries(eq.animalAccessories).forEach(([animalId, cosmeticId]) => {
        if (!cosmeticId) return;
        // cosmeticId is the battle pass reward ID like 'meeple_crown_b0'
        // We need the accessory name like 'crown'
        const reward = require('@/lib/battlePass').ALL_REWARDS.find(r => r.cosmeticId === cosmeticId);
        if (reward) {
          const pool = allAcc.find(p => p.id === reward.cosmeticRef);
          if (pool) accMap[animalId] = pool.accessory;
        }
      });
    }
    setAccessories(accMap);
  }, []);

  if (!animals.length) return null;
  return (
    <div className="animal-parade" aria-hidden="true">
      {animals.map((animal, i) => {
        const config = ANIMAL_CONFIG[animal.id];
        if (!config) return null;
        const { Comp, speed, bottom, size, idleClass, accOffset } = config;
        const delay = (i * 3.7) % speed;
        const acc = accessories[animal.id] || null;
        return (
          <div key={animal.id} className={`parade-animal ${idleClass}`}
            style={{ bottom:`${bottom}px`, animationDuration:`${speed}s`, animationDelay:`-${delay}s`, width:size, height:size }}>
            <div className="parade-animal-inner"><Comp acc={acc} ao={accOffset}/></div>
            <div className="parade-shadow" style={{ width: size * 0.6 }}/>
          </div>
        );
      })}
    </div>
  );
}
