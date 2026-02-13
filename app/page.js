'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FloatingHearts from '@/components/FloatingHearts';
import ShelfBackground from '@/components/ShelfBackground';
import BottomNav from '@/components/BottomNav';
import { useCosmetics } from '@/lib/cosmeticEngine';
import { getCollection, getFavorites, getUniqueTags, filterGames } from '@/lib/gameStore';

const DEFAULT_PAPERS = ['#FDF6EC','#FDEEF0','#F0E6F6','#E8F5ED','#FFF9E6'];
const DEFAULT_SPARKLES = ['✨','💫','⭐','✨','💖','✨'];
const QUICK_TAGS = ['✨ Never Played','🔥 Most Played','♥ Favorites','🤝 Co-op','🧸 Cozy','👫 2P','⚡ Quick'];
const TAG_DISPLAY_MAP = {
  '✨ Never Played':'Never Played','🔥 Most Played':'Most Played','♥ Favorites':'♥ Favorites',
  '🤝 Co-op':'Cooperative','🧸 Cozy':'Cozy','👫 2P':'2 Player Friendly','⚡ Quick':'Quick Game',
  '⏱ Short (≤30min)':'__short','⏱ Medium (≤90min)':'__medium','⏱ Long (90min+)':'__long',
};
const TAG_CATEGORIES = {
  'Game Length':['⏱ Short (≤30min)','⏱ Medium (≤90min)','⏱ Long (90min+)'],
  'Play Style':['Cooperative','Solo-able','Solo','2 Player Only','2 Player Friendly','Party Size'],
  'Theme':['Fantasy','Horror','Nature','Sci-Fi','Disney','Superhero','Pirate'],
  'Vibe':['Cozy','Family Friendly','Heavy','Thematic'],
  'Mechanics':['Worker Placement','Deck Building','Engine Building','Card Game','Dice',
    'Tile Placement','Push Your Luck','Trick-Taking','Set Collection','Area Control',
    'Auction','Deduction','Bluffing','Pattern Building','Card Drafting','Puzzle'],
  'Other':['Campaign','Adventure','Narrative','Euro','Economic','Abstract','Survival','Traitor','Strategy'],
};
const SPARKLE_POS = [{x:-25,y:-20},{x:25,y:-25},{x:-40,y:5},{x:40,y:0},{x:-15,y:-35},{x:15,y:-40}];

function JarDecoration({ decor }) {
  if (!decor) return null;
  const decorMap = {
    ribbon: <text x="100" y="175" textAnchor="middle" fontSize="20">🎀</text>,
    star: <text x="155" y="115" textAnchor="middle" fontSize="16">⭐</text>,
    heart: <text x="155" y="120" textAnchor="middle" fontSize="16">❤️</text>,
    flower: <text x="100" y="175" textAnchor="middle" fontSize="16">🌼</text>,
    gem: <text x="155" y="100" textAnchor="middle" fontSize="14">💎</text>,
    bow: <text x="100" y="67" textAnchor="middle" fontSize="22">🎀</text>,
    lights: <>{[0,1,2,3,4].map(i=><circle key={i} cx={55+i*22} cy={75} r={3} fill={['#FFD700','#FF69B4','#87CEEB','#90EE90','#DDA0DD'][i]} opacity={0.8}/>)}</>,
    lace: <rect x="30" y="164" width="140" height="6" rx="3" fill="rgba(255,255,255,0.5)" stroke="rgba(200,180,200,0.4)" strokeWidth="0.5" strokeDasharray="3 2"/>,
    clover: <text x="155" y="105" textAnchor="middle" fontSize="14">🍀</text>,
    butterfly: <text x="145" y="30" textAnchor="middle" fontSize="16">🦋</text>,
  };
  return (
    <svg style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:6}} viewBox="0 0 200 280">
      {decorMap[decor] || null}
    </svg>
  );
}

export default function JarPage() {
  const router = useRouter();
  const { cosmetics } = useCosmetics();
  const [games, setGames] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [allTags, setAllTags] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [drawnGame, setDrawnGame] = useState(null);
  const [jarAnim, setJarAnim] = useState('');
  const [lidPop, setLidPop] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const idleTimer = useRef(null);

  useEffect(() => {
    const c = getCollection(); setGames(c); setFavorites(getFavorites()); setAllTags(getUniqueTags(c));
  }, []);

  useEffect(() => {
    let r = filterGames(games, activeTags.filter(t=>!t.startsWith('__')), favorites);
    if (activeTags.includes('__short')) r = r.filter(g=>g.playingTime&&g.playingTime<=30);
    if (activeTags.includes('__medium')) r = r.filter(g=>g.playingTime&&g.playingTime>30&&g.playingTime<=90);
    if (activeTags.includes('__long')) r = r.filter(g=>g.playingTime&&g.playingTime>90);
    setFilteredGames(r);
  }, [games, activeTags, favorites]);

  useEffect(() => {
    if (!games.length) return;
    const sched = () => {
      idleTimer.current = setTimeout(() => {
        if (!drawnGame) { setJarAnim('idle'); setTimeout(()=>setJarAnim(''),700); }
        sched();
      }, 5000 + Math.random()*8000);
    };
    sched(); return ()=>clearTimeout(idleTimer.current);
  }, [games.length, drawnGame]);

  const drawGame = useCallback(() => {
    if (!filteredGames.length) return;
    setJarAnim('shake'); setLidPop(true); setShowSparkles(true);
    setTimeout(()=>setJarAnim(''),500); setTimeout(()=>setLidPop(false),900); setTimeout(()=>setShowSparkles(false),900);
    setTimeout(()=>setDrawnGame(filteredGames[Math.floor(Math.random()*filteredGames.length)]),500);
  }, [filteredGames]);

  const toggleTag = d => { const a = TAG_DISPLAY_MAP[d]||d; setActiveTags(p=>p.includes(a)?p.filter(t=>t!==a):[...p,a]); };
  const isActive = d => { const a = TAG_DISPLAY_MAP[d]||d; return activeTags.includes(a); };
  const existingTags = new Set(allTags.map(t=>t.tag));

  const paperColors = cosmetics?.paperColors || DEFAULT_PAPERS;
  const sparkles = cosmetics?.sparkleEmojis || DEFAULT_SPARKLES;

  if (!games.length) {
    return (
      <>
        <ShelfBackground tintFrom={cosmetics?.bgFrom} tintTo={cosmetics?.bgTo}/>
        <FloatingHearts color={cosmetics?.heartColor}/>
        <div className="main-content page-enter">
          <div className="app-title" style={{paddingTop:'60px'}}><h1>Game Night Jar</h1><p className="subtitle">💕 for my favorite player 2 💕</p></div>
          <div className="empty-state">
            <div className="empty-jar">🫙</div>
            <p>The jar is empty! Let&apos;s fill it with your games.</p>
            <button className="btn-primary" onClick={()=>router.push('/import')}>Import Games</button>
          </div>
        </div>
        <BottomNav navBg={cosmetics?.navBg} navBorder={cosmetics?.navBorder}/>
      </>
    );
  }

  return (
    <>
      <ShelfBackground tintFrom={cosmetics?.bgFrom} tintTo={cosmetics?.bgTo}/>
      <FloatingHearts color={cosmetics?.heartColor}/>
      <div className="main-content page-enter">
        <div className="app-title"><h1>Game Night Jar</h1><p className="subtitle">💕 for my favorite player 2 💕</p></div>

        <div className="filter-section"><div className="filter-scroll-wrapper"><div className="filter-bar">
          {QUICK_TAGS.map(t=><button key={t} className={`filter-pill ${isActive(t)?'active':''}`} onClick={()=>toggleTag(t)}>{t}</button>)}
          <button className={`filter-pill ${showDrawer?'active':''}`} onClick={()=>setShowDrawer(true)} style={{background:showDrawer?undefined:'var(--blush-soft)'}}>🎛 More</button>
        </div></div></div>

        {activeTags.length > 0 ? (
          <div className="game-count-badge">{filteredGames.length} match
            <span onClick={()=>setActiveTags([])} style={{marginLeft:8,color:'var(--deep-rose)',cursor:'pointer',textDecoration:'underline',fontWeight:700}}>clear</span>
          </div>
        ) : <div className="game-count-badge">{filteredGames.length} games in jar</div>}

        <div className="jar-section">
          <div className={`jar-container ${jarAnim==='shake'?'jar-shake':jarAnim==='idle'?'jar-idle-wobble':''}`}
            onClick={drawGame} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&drawGame()}>
            {showSparkles && <div className="sparkle-burst">
              {SPARKLE_POS.map((s,i)=><span key={i} className="sparkle" style={{left:s.x,top:s.y}}>{sparkles[i]}</span>)}
            </div>}
            <div className={`jar-lid-wrapper ${lidPop?'lid-popping':''}`}>
              <div className="jar-lid" style={{
                ...(cosmetics?.lidFrom ? { background: `linear-gradient(180deg, ${cosmetics.lidFrom}, ${cosmetics.lidTo})` } : {}),
              }}/>
            </div>
            <div className="jar-neck"/>
            <div className="jar-body" style={{
              ...(cosmetics?.jarTint ? {
                background: `linear-gradient(135deg, ${cosmetics.jarTint} 0%, rgba(200,225,240,0.1) 50%, ${cosmetics.jarTint} 100%)`,
                borderColor: cosmetics.jarEdge,
              } : {}),
            }}>
              <div className="jar-shine"/><div className="jar-shine-2"/>
              <div className="jar-papers">
                {filteredGames.slice(0,28).map((g,i)=><div key={g.id} className="jar-paper-slip" style={{backgroundColor:paperColors[i%paperColors.length]}}/>)}
              </div>
            </div>
            <JarDecoration decor={cosmetics?.jarDecor}/>
          </div>
          <p className="tap-hint">{filteredGames.length>0?'tap the jar ♡':'no games match these filters'}</p>
        </div>
      </div>

      {showDrawer && <>
        <div className="filter-drawer-overlay" onClick={()=>setShowDrawer(false)}/>
        <div className="filter-drawer">
          <div className="drawer-handle"/>
          <h3>🎛 Filter Games</h3>
          {Object.entries(TAG_CATEGORIES).map(([cat,tags])=>{
            const avail = tags.filter(t=>t.startsWith('⏱')||existingTags.has(t));
            if (!avail.length) return null;
            return <div key={cat} className="tag-section"><div className="tag-section-title">{cat}</div>
              <div className="tag-grid">{avail.map(t=><button key={t} className={`filter-pill ${isActive(t)?'active':''}`} onClick={()=>toggleTag(t)}>{t}</button>)}</div></div>;
          })}
          {activeTags.length>0&&<button className="filter-clear-btn" onClick={()=>{setActiveTags([]);setShowDrawer(false);}}>Clear All Filters</button>}
          <button className="btn-primary" onClick={()=>setShowDrawer(false)} style={{width:'100%',marginTop:10}}>Done ({filteredGames.length} game{filteredGames.length!==1?'s':''})</button>
        </div>
      </>}

      {drawnGame && <div className="drawn-paper-overlay" onClick={()=>setDrawnGame(null)}>
        <div className="drawn-paper" onClick={e=>e.stopPropagation()}>
          {drawnGame.thumbnail&&<img src={drawnGame.thumbnail} alt={drawnGame.name} className="game-image"/>}
          <h2>{drawnGame.name}</h2>
          <div className="game-meta">
            {drawnGame.year&&<span>📅 {drawnGame.year}</span>}
            {drawnGame.minPlayers&&drawnGame.maxPlayers&&<span>👥 {drawnGame.minPlayers===drawnGame.maxPlayers?drawnGame.minPlayers:`${drawnGame.minPlayers}–${drawnGame.maxPlayers}`}</span>}
            {drawnGame.playingTime&&<span>⏱ {drawnGame.playingTime}min</span>}
            {drawnGame.numPlays>0?<span>🎲 {drawnGame.numPlays}×</span>:<span>✨ New!</span>}
          </div>
          {drawnGame.tags?.length>0&&<div className="tag-chips">{drawnGame.tags.filter(t=>t!=='Never Played'&&t!=='Most Played').slice(0,5).map(t=><span key={t} className="tag-chip">{t}</span>)}</div>}
          <p className="close-hint">tap outside to close</p>
        </div>
      </div>}

      <BottomNav navBg={cosmetics?.navBg} navBorder={cosmetics?.navBorder}/>
    </>
  );
}
