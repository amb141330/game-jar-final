'use client';
import { useState, useEffect } from 'react';
import { getUnlockedAnimals, getBattlePassState, getLevelFromXP } from '@/lib/battlePass';

function CatSVG() {
  return (<svg viewBox="0 0 40 36" fill="none" className="animal-svg">
    <polygon points="8,12 5,2 14,10" fill="#FFE4C9" stroke="#5C4033" strokeWidth="1.2" strokeLinejoin="round"/>
    <polygon points="32,12 35,2 26,10" fill="#FFE4C9" stroke="#5C4033" strokeWidth="1.2" strokeLinejoin="round"/>
    <polygon points="8.5,11 7,5 13,10" fill="#FFB6C1" opacity="0.5"/>
    <polygon points="31.5,11 33,5 27,10" fill="#FFB6C1" opacity="0.5"/>
    <ellipse cx="20" cy="22" rx="14" ry="12" fill="#FFE4C9" stroke="#5C4033" strokeWidth="1.4"/>
    <path d="M34 22 Q42 14 38 8" stroke="#5C4033" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <ellipse cx="15" cy="20" rx="2" ry="2.5" fill="#5C4033"/><ellipse cx="25" cy="20" rx="2" ry="2.5" fill="#5C4033"/>
    <circle cx="15.8" cy="19.2" r="0.8" fill="white"/><circle cx="25.8" cy="19.2" r="0.8" fill="white"/>
    <ellipse cx="20" cy="24" rx="1.5" ry="1" fill="#FFB0A0"/>
    <path d="M18.5 26 Q20 28 21.5 26" stroke="#5C4033" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
    <line x1="2" y1="22" x2="14" y2="23" stroke="#5C4033" strokeWidth="0.6" opacity="0.4"/>
    <line x1="2" y1="25" x2="14" y2="24.5" stroke="#5C4033" strokeWidth="0.6" opacity="0.4"/>
    <line x1="26" y1="23" x2="38" y2="22" stroke="#5C4033" strokeWidth="0.6" opacity="0.4"/>
    <line x1="26" y1="24.5" x2="38" y2="25" stroke="#5C4033" strokeWidth="0.6" opacity="0.4"/>
    <ellipse cx="11" cy="25" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.25"/>
    <ellipse cx="29" cy="25" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.25"/>
  </svg>);
}
function BunnySVG() {
  return (<svg viewBox="0 0 40 40" fill="none" className="animal-svg">
    <ellipse cx="14" cy="6" rx="4" ry="12" fill="white" stroke="#8B7355" strokeWidth="1.2"/>
    <ellipse cx="26" cy="6" rx="4" ry="12" fill="white" stroke="#8B7355" strokeWidth="1.2"/>
    <ellipse cx="14" cy="5" rx="2" ry="8" fill="#FFB6C1" opacity="0.5"/>
    <ellipse cx="26" cy="5" rx="2" ry="8" fill="#FFB6C1" opacity="0.5"/>
    <ellipse cx="20" cy="26" rx="13" ry="12" fill="white" stroke="#8B7355" strokeWidth="1.3"/>
    <circle cx="15" cy="23" r="2" fill="#5C4033"/><circle cx="25" cy="23" r="2" fill="#5C4033"/>
    <circle cx="15.7" cy="22.3" r="0.7" fill="white"/><circle cx="25.7" cy="22.3" r="0.7" fill="white"/>
    <ellipse cx="20" cy="27" rx="2" ry="1.5" fill="#FFB0A0"/>
    <path d="M18 29 Q20 31 22 29" stroke="#8B7355" strokeWidth="0.7" fill="none"/>
    <ellipse cx="12" cy="27" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.3"/>
    <ellipse cx="28" cy="27" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.3"/>
    <circle cx="33" cy="30" r="4" fill="white" stroke="#8B7355" strokeWidth="0.8"/>
  </svg>);
}
function DogSVG() {
  return (<svg viewBox="0 0 44 36" fill="none" className="animal-svg">
    <ellipse cx="10" cy="16" rx="6" ry="10" fill="#C49A6C" stroke="#7A5C3D" strokeWidth="1.2" transform="rotate(-15 10 16)"/>
    <ellipse cx="34" cy="16" rx="6" ry="10" fill="#C49A6C" stroke="#7A5C3D" strokeWidth="1.2" transform="rotate(15 34 16)"/>
    <ellipse cx="22" cy="22" rx="14" ry="12" fill="#E8CFA0" stroke="#7A5C3D" strokeWidth="1.3"/>
    <path d="M36 20 Q44 12 40 6" stroke="#7A5C3D" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="17" cy="20" r="2.2" fill="#5C4033"/><circle cx="27" cy="20" r="2.2" fill="#5C4033"/>
    <circle cx="17.7" cy="19.3" r="0.8" fill="white"/><circle cx="27.7" cy="19.3" r="0.8" fill="white"/>
    <ellipse cx="22" cy="24.5" rx="2.5" ry="2" fill="#4A3030"/>
    <path d="M20 27 Q22 29 24 27" stroke="#7A5C3D" strokeWidth="0.8" fill="none"/>
    <ellipse cx="22" cy="29" rx="2" ry="2.5" fill="#FF8888" opacity="0.7"/>
    <ellipse cx="13" cy="25" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.2"/>
    <ellipse cx="31" cy="25" rx="3" ry="1.5" fill="#FFB6C1" opacity="0.2"/>
  </svg>);
}
function TurtleSVG() {
  return (<svg viewBox="0 0 48 32" fill="none" className="animal-svg">
    <ellipse cx="24" cy="18" rx="16" ry="13" fill="#6B8E5A" stroke="#4A6B3A" strokeWidth="1.4"/>
    <path d="M24 6 L18 18 L24 28 L30 18 Z" fill="#5A7D4A" opacity="0.4"/>
    <ellipse cx="42" cy="20" rx="6" ry="5" fill="#90B878" stroke="#5A7D4A" strokeWidth="1"/>
    <circle cx="44" cy="18" r="1.5" fill="#4A3030"/><circle cx="44.5" cy="17.5" r="0.5" fill="white"/>
    <path d="M42 22 Q44 23.5 46 22" stroke="#5A7D4A" strokeWidth="0.6" fill="none"/>
    <ellipse cx="46" cy="21" rx="2" ry="1" fill="#FFB6C1" opacity="0.3"/>
    <ellipse cx="14" cy="28" rx="4" ry="3" fill="#90B878" stroke="#5A7D4A" strokeWidth="0.6"/>
    <ellipse cx="34" cy="28" rx="4" ry="3" fill="#90B878" stroke="#5A7D4A" strokeWidth="0.6"/>
  </svg>);
}
function FoxSVG() {
  return (<svg viewBox="0 0 44 36" fill="none" className="animal-svg">
    <polygon points="10,14 4,1 18,10" fill="#E87830" stroke="#A05020" strokeWidth="1.2" strokeLinejoin="round"/>
    <polygon points="34,14 40,1 26,10" fill="#E87830" stroke="#A05020" strokeWidth="1.2" strokeLinejoin="round"/>
    <polygon points="10,13 7,5 16,10" fill="#2A2A2A"/><polygon points="34,13 37,5 28,10" fill="#2A2A2A"/>
    <ellipse cx="22" cy="22" rx="14" ry="12" fill="#E87830" stroke="#A05020" strokeWidth="1.3"/>
    <ellipse cx="22" cy="25" rx="8" ry="7" fill="white" opacity="0.9"/>
    <path d="M36 22 Q46 16 44 8" stroke="#E87830" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M44 8 L44 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <ellipse cx="17" cy="20" rx="2" ry="1.8" fill="#3A2020"/><ellipse cx="27" cy="20" rx="2" ry="1.8" fill="#3A2020"/>
    <circle cx="17.6" cy="19.5" r="0.7" fill="white"/><circle cx="27.6" cy="19.5" r="0.7" fill="white"/>
    <ellipse cx="22" cy="24" rx="1.8" ry="1.3" fill="#3A2020"/>
    <ellipse cx="14" cy="23" rx="2.5" ry="1.5" fill="#FFB6C1" opacity="0.3"/>
    <ellipse cx="30" cy="23" rx="2.5" ry="1.5" fill="#FFB6C1" opacity="0.3"/>
  </svg>);
}
function OwlSVG() {
  return (<svg viewBox="0 0 40 38" fill="none" className="animal-svg">
    <polygon points="10,10 4,0 16,8" fill="#8B6F4E" stroke="#6B5030" strokeWidth="1"/>
    <polygon points="30,10 36,0 24,8" fill="#8B6F4E" stroke="#6B5030" strokeWidth="1"/>
    <ellipse cx="20" cy="22" rx="14" ry="14" fill="#C4A56E" stroke="#8B6F4E" strokeWidth="1.3"/>
    <ellipse cx="20" cy="20" rx="10" ry="9" fill="#E8D8B8"/>
    <circle cx="15" cy="18" r="4.5" fill="white" stroke="#8B6F4E" strokeWidth="0.8"/>
    <circle cx="25" cy="18" r="4.5" fill="white" stroke="#8B6F4E" strokeWidth="0.8"/>
    <circle cx="15" cy="18" r="3" fill="#4A3020"/><circle cx="25" cy="18" r="3" fill="#4A3020"/>
    <circle cx="16" cy="17" r="1.2" fill="white"/><circle cx="26" cy="17" r="1.2" fill="white"/>
    <polygon points="20,22 18,25 22,25" fill="#E8A040" stroke="#C08030" strokeWidth="0.5"/>
    <path d="M6 22 Q2 30 8 34" stroke="#8B6F4E" strokeWidth="1.5" fill="#B0905A"/>
    <path d="M34 22 Q38 30 32 34" stroke="#8B6F4E" strokeWidth="1.5" fill="#B0905A"/>
    <ellipse cx="12" cy="23" rx="2.5" ry="1" fill="#FFB6C1" opacity="0.3"/>
    <ellipse cx="28" cy="23" rx="2.5" ry="1" fill="#FFB6C1" opacity="0.3"/>
  </svg>);
}
function PenguinSVG() {
  return (<svg viewBox="0 0 36 38" fill="none" className="animal-svg">
    <ellipse cx="18" cy="22" rx="13" ry="14" fill="#2A2A3A" stroke="#1A1A2A" strokeWidth="1.2"/>
    <ellipse cx="18" cy="24" rx="8" ry="10" fill="white"/>
    <circle cx="14" cy="18" r="2.5" fill="white"/><circle cx="22" cy="18" r="2.5" fill="white"/>
    <circle cx="14" cy="18" r="1.5" fill="#2A2A3A"/><circle cx="22" cy="18" r="1.5" fill="#2A2A3A"/>
    <circle cx="14.5" cy="17.5" r="0.5" fill="white"/><circle cx="22.5" cy="17.5" r="0.5" fill="white"/>
    <polygon points="18,20 15,23 21,23" fill="#E8A040" stroke="#C08030" strokeWidth="0.5"/>
    <ellipse cx="5" cy="24" rx="4" ry="8" fill="#2A2A3A" transform="rotate(-10 5 24)"/>
    <ellipse cx="31" cy="24" rx="4" ry="8" fill="#2A2A3A" transform="rotate(10 31 24)"/>
    <ellipse cx="14" cy="35" rx="4" ry="2" fill="#E8A040"/><ellipse cx="22" cy="35" rx="4" ry="2" fill="#E8A040"/>
    <ellipse cx="11" cy="22" rx="2" ry="1" fill="#FFB6C1" opacity="0.35"/>
    <ellipse cx="25" cy="22" rx="2" ry="1" fill="#FFB6C1" opacity="0.35"/>
  </svg>);
}
function RedPandaSVG() {
  return (<svg viewBox="0 0 44 38" fill="none" className="animal-svg">
    <circle cx="10" cy="8" r="5" fill="#C04020" stroke="#8B3015" strokeWidth="1"/>
    <circle cx="34" cy="8" r="5" fill="#C04020" stroke="#8B3015" strokeWidth="1"/>
    <circle cx="10" cy="8" r="3" fill="#E8D0B0"/><circle cx="34" cy="8" r="3" fill="#E8D0B0"/>
    <ellipse cx="22" cy="22" rx="14" ry="13" fill="#C04020" stroke="#8B3015" strokeWidth="1.3"/>
    <ellipse cx="22" cy="20" rx="9" ry="8" fill="#E8D0B0"/>
    <ellipse cx="16" cy="18" rx="4" ry="3" fill="#8B3015" opacity="0.6"/>
    <ellipse cx="28" cy="18" rx="4" ry="3" fill="#8B3015" opacity="0.6"/>
    <circle cx="16" cy="18" r="2" fill="#3A2020"/><circle cx="28" cy="18" r="2" fill="#3A2020"/>
    <circle cx="16.6" cy="17.4" r="0.7" fill="white"/><circle cx="28.6" cy="17.4" r="0.7" fill="white"/>
    <ellipse cx="22" cy="22.5" rx="2" ry="1.5" fill="#3A2020"/>
    <path d="M20 24 Q22 26 24 24" stroke="#8B3015" strokeWidth="0.6" fill="none"/>
    <rect x="36" y="16" width="6" height="14" rx="3" fill="#C04020" stroke="#8B3015" strokeWidth="0.8"/>
    <rect x="36" y="18" width="6" height="2" fill="#8B3015" opacity="0.4"/>
    <rect x="36" y="22" width="6" height="2" fill="#8B3015" opacity="0.4"/>
    <rect x="36" y="26" width="6" height="2" fill="#8B3015" opacity="0.4"/>
  </svg>);
}
function HedgehogSVG() {
  return (<svg viewBox="0 0 42 32" fill="none" className="animal-svg">
    {[[-3,10],[0,5],[4,2],[9,0],[14,-1],[19,0],[24,1],[28,3],[31,6],[33,10]].map(([x,y],i) =>
      <polygon key={i} points={`${x+10},${y+10} ${x+8},${y+4} ${x+12},${y+4}`} fill="#8B7355" opacity="0.8"/>
    )}
    <ellipse cx="22" cy="20" rx="15" ry="10" fill="#C4A56E" stroke="#8B7355" strokeWidth="1.3"/>
    <ellipse cx="34" cy="20" rx="7" ry="7" fill="#E8D0B0" stroke="#8B7355" strokeWidth="1"/>
    <circle cx="36" cy="18" r="1.8" fill="#3A2020"/><circle cx="36.5" cy="17.5" r="0.6" fill="white"/>
    <circle cx="40" cy="20" r="1.5" fill="#3A2020"/>
    <ellipse cx="36" cy="22" rx="2" ry="1" fill="#FFB6C1" opacity="0.35"/>
    <path d="M37 22 Q39 23.5 41 22" stroke="#8B7355" strokeWidth="0.5" fill="none"/>
    <ellipse cx="16" cy="28" rx="3" ry="2" fill="#C4A56E" stroke="#8B7355" strokeWidth="0.6"/>
    <ellipse cx="28" cy="28" rx="3" ry="2" fill="#C4A56E" stroke="#8B7355" strokeWidth="0.6"/>
  </svg>);
}
function DragonSVG() {
  return (<svg viewBox="0 0 52 40" fill="none" className="animal-svg">
    <path d="M14 18 Q4 6 8 2 L14 10 L18 4 L20 14" fill="#B080D0" stroke="#8060A0" strokeWidth="0.8" opacity="0.8"/>
    <path d="M38 18 Q48 6 44 2 L38 10 L34 4 L32 14" fill="#B080D0" stroke="#8060A0" strokeWidth="0.8" opacity="0.8"/>
    <ellipse cx="26" cy="24" rx="14" ry="12" fill="#A070C8" stroke="#7050A0" strokeWidth="1.3"/>
    <ellipse cx="26" cy="26" rx="8" ry="8" fill="#D0B8E8"/>
    <polygon points="18,12 16,4 21,10" fill="#C090E0" stroke="#8060A0" strokeWidth="0.6"/>
    <polygon points="34,12 36,4 31,10" fill="#C090E0" stroke="#8060A0" strokeWidth="0.6"/>
    <circle cx="21" cy="20" r="2.5" fill="#FFD700"/><circle cx="31" cy="20" r="2.5" fill="#FFD700"/>
    <ellipse cx="21" cy="20" rx="1" ry="2" fill="#3A2020"/><ellipse cx="31" cy="20" rx="1" ry="2" fill="#3A2020"/>
    <ellipse cx="26" cy="26" rx="3" ry="2" fill="#C090E0"/>
    <circle cx="24" cy="25" r="0.8" fill="#8060A0"/><circle cx="28" cy="25" r="0.8" fill="#8060A0"/>
    <path d="M24 28 Q26 30 28 28" stroke="#7050A0" strokeWidth="0.7" fill="none"/>
    <path d="M40 24 Q48 20 46 14 L44 18" stroke="#A070C8" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M46 14 L44 10 L48 12 Z" fill="#C090E0"/>
    <ellipse cx="18" cy="25" rx="2.5" ry="1" fill="#FFB6C1" opacity="0.3"/>
    <ellipse cx="34" cy="25" rx="2.5" ry="1" fill="#FFB6C1" opacity="0.3"/>
  </svg>);
}

const ANIMAL_CONFIG = {
  cat:      { Comp: CatSVG,      speed: 18, bottom: 76, size: 42, idleClass: 'idle-groom' },
  bunny:    { Comp: BunnySVG,     speed: 14, bottom: 76, size: 40, idleClass: 'idle-binky' },
  dog:      { Comp: DogSVG,       speed: 15, bottom: 76, size: 44, idleClass: 'idle-wag' },
  turtle:   { Comp: TurtleSVG,    speed: 30, bottom: 76, size: 46, idleClass: 'idle-hide' },
  fox:      { Comp: FoxSVG,       speed: 12, bottom: 76, size: 42, idleClass: 'idle-pounce' },
  owl:      { Comp: OwlSVG,       speed: 20, bottom: 160, size: 38, idleClass: 'idle-headspin' },
  penguin:  { Comp: PenguinSVG,   speed: 22, bottom: 76, size: 36, idleClass: 'idle-slide' },
  redpanda: { Comp: RedPandaSVG,  speed: 16, bottom: 76, size: 44, idleClass: 'idle-standup' },
  hedgehog: { Comp: HedgehogSVG,  speed: 24, bottom: 76, size: 40, idleClass: 'idle-curl' },
  dragon:   { Comp: DragonSVG,    speed: 14, bottom: 200, size: 50, idleClass: 'idle-breathe' },
};

export default function AnimalParade() {
  const [animals, setAnimals] = useState([]);
  useEffect(() => {
    const bp = getBattlePassState();
    const level = getLevelFromXP(bp.totalXP).level;
    setAnimals(getUnlockedAnimals(level));
  }, []);
  if (!animals.length) return null;
  return (
    <div className="animal-parade" aria-hidden="true">
      {animals.map((animal, i) => {
        const config = ANIMAL_CONFIG[animal.id];
        if (!config) return null;
        const { Comp, speed, bottom, size, idleClass } = config;
        const delay = (i * 3.7) % speed;
        return (
          <div key={animal.id} className={`parade-animal ${idleClass}`}
            style={{ bottom: `${bottom}px`, animationDuration: `${speed}s`, animationDelay: `-${delay}s`, width: size, height: size }}>
            <div className="parade-animal-inner"><Comp/></div>
            <div className="parade-shadow" style={{ width: size * 0.6 }}/>
          </div>
        );
      })}
    </div>
  );
}
