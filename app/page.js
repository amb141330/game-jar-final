'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import FloatingHearts from '@/components/FloatingHearts';

import BottomNav from '@/components/BottomNav';
import { useCosmetics } from '@/lib/cosmeticEngine';
import { getCollection, getFavorites, getUniqueTags, filterGames } from '@/lib/gameStore';
import { logPlay, getCosmeticCategoriesForPage, getAllCosmeticsForCategory, getEquippedCosmetics, equipCosmetic, unequipCosmetic, getLevelFromXP, getBattlePassState } from '@/lib/battlePass';
import { logDrawEvent, weightedRandomDraw } from '@/lib/playHistory';

const DEFAULT_PAPERS = ['#FDF6EC','#FDEEF0','#F0E6F6','#E8F5ED','#FFF9E6'];
const DEFAULT_SPARKLES = ['✨','💫','⭐','✨','💖','✨'];
const QUICK_TAGS = ['✨ Never Played','🔥 Most Played','♥ Favorites','🤝 Co-op','🧸 Cozy','👫 2P','⚡ Quick'];
const TAG_DISPLAY_MAP = {'✨ Never Played':'Never Played','🔥 Most Played':'Most Played','♥ Favorites':'♥ Favorites','🤝 Co-op':'Cooperative','🧸 Cozy':'Cozy','👫 2P':'2 Player Friendly','⚡ Quick':'Quick Game','⏱ Short (≤30min)':'__short','⏱ Medium (≤90min)':'__medium','⏱ Long (90min+)':'__long'};
const TAG_CATEGORIES = {'Game Length':['⏱ Short (≤30min)','⏱ Medium (≤90min)','⏱ Long (90min+)'],'Play Style':['Cooperative','Solo-able','Solo','2 Player Only','2 Player Friendly','Party Size'],'Theme':['Fantasy','Horror','Nature','Sci-Fi','Disney','Superhero','Pirate'],'Vibe':['Cozy','Family Friendly','Heavy','Thematic'],'Mechanics':['Worker Placement','Deck Building','Engine Building','Card Game','Dice','Tile Placement','Push Your Luck','Trick-Taking','Set Collection','Area Control','Auction','Deduction','Bluffing','Pattern Building','Card Drafting','Puzzle'],'Other':['Campaign','Adventure','Narrative','Euro','Economic','Abstract','Survival','Traitor','Strategy']};
const SPARKLE_POS = [{x:-25,y:-20},{x:25,y:-25},{x:-40,y:5},{x:40,y:0},{x:-15,y:-35},{x:15,y:-40}];

function JarDecoration({decor}){if(!decor)return null;const m={ribbon:<text x="100" y="175" textAnchor="middle" fontSize="20">🎀</text>,star:<text x="155" y="115" textAnchor="middle" fontSize="16">⭐</text>,heart:<text x="155" y="120" textAnchor="middle" fontSize="16">❤️</text>,flower:<text x="100" y="175" textAnchor="middle" fontSize="16">🌼</text>,gem:<text x="155" y="100" textAnchor="middle" fontSize="14">💎</text>,bow:<text x="100" y="67" textAnchor="middle" fontSize="22">🎀</text>,lights:<>{[0,1,2,3,4].map(i=><circle key={i} cx={55+i*22} cy={75} r={3} fill={['#FFD700','#FF69B4','#87CEEB','#90EE90','#DDA0DD'][i]} opacity={0.8}/>)}</>,lace:<rect x="30" y="164" width="140" height="6" rx="3" fill="rgba(255,255,255,0.5)" stroke="rgba(200,180,200,0.4)" strokeWidth="0.5" strokeDasharray="3 2"/>,clover:<text x="155" y="105" textAnchor="middle" fontSize="14">🍀</text>,butterfly:<text x="145" y="30" textAnchor="middle" fontSize="16">🦋</text>};return<svg style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:6}} viewBox="0 0 200 280">{m[decor]||null}</svg>;}

export default function JarPage() {
  const router = useRouter();
  const { cosmetics, refresh: refreshCosmetics } = useCosmetics();
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
  // Game night session
  const [session, setSession] = useState(null); // { game, startTime }
  const [sessionTime, setSessionTime] = useState(0);
  const [xpPopup, setXpPopup] = useState(null);
  const [levelUpAnim, setLevelUpAnim] = useState(false);
  // Cosmetics settings
  const [showSettings, setShowSettings] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState(null);
  const [equipped, setEquipped] = useState({});
  const [levelInfo, setLevelInfo] = useState(null);
  const idleTimer = useRef(null);
  const sessionTimer = useRef(null);

  useEffect(() => {
    const c = getCollection(); setGames(c); setFavorites(getFavorites()); setAllTags(getUniqueTags(c));
    setEquipped(getEquippedCosmetics());
    const bp = getBattlePassState(); setLevelInfo(getLevelFromXP(bp.totalXP));
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
    const sched = () => { idleTimer.current = setTimeout(() => { if (!drawnGame && !session) { setJarAnim('idle'); setTimeout(()=>setJarAnim(''),700); } sched(); }, 5000+Math.random()*8000); };
    sched(); return ()=>clearTimeout(idleTimer.current);
  }, [games.length, drawnGame, session]);

  // Session timer
  useEffect(() => {
    if (session) {
      sessionTimer.current = setInterval(() => {
        setSessionTime(Math.floor((Date.now() - session.startTime) / 1000));
      }, 1000);
      return () => clearInterval(sessionTimer.current);
    }
    return () => {};
  }, [session]);

  const drawGame = useCallback(() => {
    if (!filteredGames.length) return;
    setJarAnim('shake'); setLidPop(true); setShowSparkles(true);
    setTimeout(()=>setJarAnim(''),500); setTimeout(()=>setLidPop(false),900); setTimeout(()=>setShowSparkles(false),900);
    setTimeout(() => {
      const pick = weightedRandomDraw(filteredGames, drawnGame?.id);
      setDrawnGame(pick);
    }, 500);
  }, [filteredGames, drawnGame]);

  // ── Draw actions ──────────────────────────────────────────
  const handleDismiss = () => { setDrawnGame(null); /* log nothing */ };

  const handleNotFeelingIt = () => {
    if (drawnGame) logDrawEvent(drawnGame, 'reject');
    // Immediately redraw a different game
    const pick = weightedRandomDraw(filteredGames, drawnGame?.id);
    setJarAnim('shake'); setTimeout(()=>setJarAnim(''),500);
    setDrawnGame(pick);
  };

  const handleLetsPlay = () => {
    if (drawnGame) {
      logDrawEvent(drawnGame, 'accept');
      setSession({ game: drawnGame, startTime: Date.now() });
      setDrawnGame(null);
      setSessionTime(0);
    }
  };

  const handleFinishSession = () => {
    if (!session) return;
    const { play, levelInfo: nl } = logPlay(session.game);
    const oldLevel = levelInfo?.level || 0;
    setLevelInfo(nl);
    setXpPopup({ total: play.xpEarned, bonuses: play.bonuses, gameName: session.game.name });
    if (nl.level > oldLevel) { setTimeout(()=>setLevelUpAnim(true),1500); setTimeout(()=>setLevelUpAnim(false),4000); }
    setTimeout(()=>setXpPopup(null),3500);
    setSession(null); setSessionTime(0);
    clearInterval(sessionTimer.current);
  };

  const handleCancelSession = () => { setSession(null); setSessionTime(0); clearInterval(sessionTimer.current); };

  // Cosmetics
  const handleEquip = (c,id) => { setEquipped(equipCosmetic(c,id)); refreshCosmetics(); };
  const handleUnequip = c => { setEquipped(unequipCosmetic(c)); refreshCosmetics(); };

  const toggleTag = d => { const a = TAG_DISPLAY_MAP[d]||d; setActiveTags(p=>p.includes(a)?p.filter(t=>t!==a):[...p,a]); };
  const isActive = d => { const a = TAG_DISPLAY_MAP[d]||d; return activeTags.includes(a); };
  const existingTags = new Set(allTags.map(t=>t.tag));
  const paperColors = cosmetics?.paperColors || DEFAULT_PAPERS;
  const sparkles = cosmetics?.sparkleEmojis || DEFAULT_SPARKLES;
  const bgStyle = cosmetics?.bgFrom ? { background:`linear-gradient(180deg,${cosmetics.bgFrom},${cosmetics.bgTo})` } : {};
  const fmtTime = s => `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor((s%3600)/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  if (!games.length) return (
    <><FloatingHearts color={cosmetics?.heartColor}/>
      <div className="main-content page-enter" style={bgStyle}>
        <div className="app-title" style={{paddingTop:'60px'}}><h1>Game Night Jar</h1><p className="subtitle">💕 for my favorite player 2 💕</p></div>
        <div className="empty-state"><div className="empty-jar">🫙</div><p>The jar is empty! Let&apos;s fill it with your games.</p><button className="btn-primary" onClick={()=>router.push('/import')}>Import Games</button></div>
      </div><BottomNav navBg={cosmetics?.navBg} navBorder={cosmetics?.navBorder}/></>
  );

  return (
    <><FloatingHearts color={cosmetics?.heartColor}/>
      <div className="main-content page-enter" style={bgStyle}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px 0'}}>
          <div className="app-title" style={{padding:0,textAlign:'left'}}><h1 style={{fontSize:'1.6rem'}}>Game Night Jar</h1></div>
          <button onClick={()=>{setShowSettings(true);setSettingsCategory(null);}} style={{background:'white',border:'2px solid var(--rose)',borderRadius:14,padding:'6px 12px',fontFamily:'Quicksand',fontWeight:700,fontSize:'0.75rem',color:'var(--deep-rose)',cursor:'pointer',flexShrink:0}}>⚙️</button>
        </div>
        <p className="subtitle" style={{textAlign:'center',fontFamily:'Caveat,cursive',fontSize:'0.95rem',color:'var(--rose)',margin:'-2px 0 4px'}}>💕 for my favorite player 2 💕</p>

        <div className="filter-section"><div className="filter-scroll-wrapper"><div className="filter-bar">
          {QUICK_TAGS.map(t=><button key={t} className={`filter-pill ${isActive(t)?'active':''}`} onClick={()=>toggleTag(t)}>{t}</button>)}
          <button className={`filter-pill ${showDrawer?'active':''}`} onClick={()=>setShowDrawer(true)} style={{background:showDrawer?undefined:'var(--blush-soft)'}}>🎛 More</button>
        </div></div></div>
        {activeTags.length>0?<div className="game-count-badge">{filteredGames.length} match<span onClick={()=>setActiveTags([])} style={{marginLeft:8,color:'var(--deep-rose)',cursor:'pointer',textDecoration:'underline',fontWeight:700}}>clear</span></div>:<div className="game-count-badge">{filteredGames.length} games in jar</div>}

        {/* Active session card */}
        {session && (
          <div className="session-card">
            <div className="session-header">
              <span className="session-emoji">🎲</span>
              <div><div className="session-game">{session.game.name}</div><div className="session-label">Game Night in Progress!</div></div>
            </div>
            <div className="session-timer">{fmtTime(sessionTime)}</div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn-primary" onClick={handleFinishSession} style={{flex:1,padding:'12px 16px'}}>✅ Finished! (+XP)</button>
              <button className="btn-secondary" onClick={handleCancelSession} style={{padding:'12px 14px',fontSize:'0.8rem'}}>Cancel</button>
            </div>
          </div>
        )}

        {/* Jar */}
        {!session && <div className="jar-section">
          <div className={`jar-container ${jarAnim==='shake'?'jar-shake':jarAnim==='idle'?'jar-idle-wobble':''}`} onClick={drawGame} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&drawGame()}>
            {showSparkles&&<div className="sparkle-burst">{SPARKLE_POS.map((s,i)=><span key={i} className="sparkle" style={{left:s.x,top:s.y}}>{sparkles[i]}</span>)}</div>}
            <div className={`jar-lid-wrapper ${lidPop?'lid-popping':''}`}><div className="jar-lid" style={{...(cosmetics?.lidFrom?{background:`linear-gradient(180deg,${cosmetics.lidFrom},${cosmetics.lidTo})`}:{})}}/></div>
            <div className="jar-neck"/>
            <div className="jar-body" style={{...(cosmetics?.jarTint?{background:`linear-gradient(135deg,${cosmetics.jarTint} 0%,rgba(200,225,240,0.1) 50%,${cosmetics.jarTint} 100%)`,borderColor:cosmetics.jarEdge}:{})}}>
              <div className="jar-shine"/><div className="jar-shine-2"/>
              <div className="jar-papers">{filteredGames.slice(0,28).map((g,i)=><div key={g.id} className="jar-paper-slip" style={{backgroundColor:paperColors[i%paperColors.length]}}/>)}</div>
            </div>
            <JarDecoration decor={cosmetics?.jarDecor}/>
          </div>
          <p className="tap-hint">{filteredGames.length>0?'tap the jar ♡':'no games match these filters'}</p>
        </div>}
      </div>

      {/* ─── DRAWN GAME OVERLAY ─── */}
      {drawnGame&&<div className="drawn-paper-overlay" onClick={handleDismiss}><div className="drawn-paper" onClick={e=>e.stopPropagation()}>
        {drawnGame.thumbnail&&<img src={drawnGame.thumbnail} alt={drawnGame.name} className="game-image"/>}
        <h2>{drawnGame.name}</h2>
        <div className="game-meta">{drawnGame.year&&<span>📅 {drawnGame.year}</span>}{drawnGame.minPlayers&&drawnGame.maxPlayers&&<span>👥 {drawnGame.minPlayers===drawnGame.maxPlayers?drawnGame.minPlayers:`${drawnGame.minPlayers}–${drawnGame.maxPlayers}`}</span>}{drawnGame.playingTime&&<span>⏱ {drawnGame.playingTime}min</span>}{drawnGame.numPlays>0?<span>🎲 {drawnGame.numPlays}×</span>:<span>✨ New!</span>}</div>
        {drawnGame.tags?.length>0&&<div className="tag-chips">{drawnGame.tags.filter(t=>t!=='Never Played'&&t!=='Most Played').slice(0,5).map(t=><span key={t} className="tag-chip">{t}</span>)}</div>}
        <div style={{display:'flex',gap:8,marginTop:16}}>
          <button className="btn-primary" onClick={handleLetsPlay} style={{flex:1,padding:'12px 16px',fontSize:'0.9rem'}}>🎲 Let&apos;s Play!</button>
          <button className="btn-secondary" onClick={handleNotFeelingIt} style={{flex:1,padding:'12px 16px',fontSize:'0.85rem'}}>Not Feeling It</button>
        </div>
        <p className="close-hint">tap outside to browse more</p>
      </div></div>}

      {/* ─── FILTER DRAWER ─── */}
      {showDrawer&&<><div className="filter-drawer-overlay" onClick={()=>setShowDrawer(false)}/><div className="filter-drawer"><div className="drawer-handle"/><h3>🎛 Filter Games</h3>
        {Object.entries(TAG_CATEGORIES).map(([cat,tags])=>{const avail=tags.filter(t=>t.startsWith('⏱')||existingTags.has(t));if(!avail.length)return null;return<div key={cat} className="tag-section"><div className="tag-section-title">{cat}</div><div className="tag-grid">{avail.map(t=><button key={t} className={`filter-pill ${isActive(t)?'active':''}`} onClick={()=>toggleTag(t)}>{t}</button>)}</div></div>;})}
        {activeTags.length>0&&<button className="filter-clear-btn" onClick={()=>{setActiveTags([]);setShowDrawer(false);}}>Clear All Filters</button>}
        <button className="btn-primary" onClick={()=>setShowDrawer(false)} style={{width:'100%',marginTop:10}}>Done ({filteredGames.length} game{filteredGames.length!==1?'s':''})</button>
      </div></>}

      {/* ─── COSMETICS SETTINGS (jar page items) ─── */}
      {showSettings&&<><div className="filter-drawer-overlay" onClick={()=>{setShowSettings(false);setSettingsCategory(null);}}/><div className="filter-drawer" style={{maxHeight:'85vh'}}><div className="drawer-handle"/>
        {!settingsCategory?<>
          <h3>🫙 Jar Cosmetics</h3>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {getCosmeticCategoriesForPage('jar').map(cat=>{
              const all=getAllCosmeticsForCategory(cat.key),uc=all.filter(c=>c.level<=(levelInfo?.level||0)).length;
              const ei=equipped[cat.key]?all.find(c=>c.cosmeticId===equipped[cat.key]):null;
              return(<button key={cat.key} onClick={()=>setSettingsCategory(cat.key)} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:equipped[cat.key]?'var(--blush-soft)':'white',border:`2px solid ${equipped[cat.key]?'var(--rose)':'var(--blush)'}`,borderRadius:14,cursor:'pointer',textAlign:'left',fontFamily:'Quicksand'}}>
                <span style={{fontSize:'1.4rem'}}>{cat.icon}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.85rem',color:'var(--text-dark)'}}>{cat.label}</div><div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{ei?`${ei.icon} ${ei.title}`:'None'} · {uc}/{all.length}</div></div><span style={{color:'var(--text-muted)'}}>›</span>
              </button>);
            })}
          </div><button className="btn-primary" onClick={()=>{setShowSettings(false);setSettingsCategory(null);}} style={{width:'100%',marginTop:12}}>Done</button>
        </>:<>
          <button onClick={()=>setSettingsCategory(null)} style={{background:'none',border:'none',color:'var(--deep-rose)',fontFamily:'Quicksand',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',marginBottom:4}}>← Back</button>
          <h3>{getCosmeticCategoriesForPage('jar').find(c=>c.key===settingsCategory)?.icon} {getCosmeticCategoriesForPage('jar').find(c=>c.key===settingsCategory)?.label}</h3>
          <button onClick={()=>handleUnequip(settingsCategory)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',width:'100%',background:!equipped[settingsCategory]?'var(--blush-soft)':'white',border:`2px solid ${!equipped[settingsCategory]?'var(--deep-rose)':'var(--blush)'}`,borderRadius:14,cursor:'pointer',marginBottom:6,fontFamily:'Quicksand',textAlign:'left'}}>
            <span style={{fontSize:'1.3rem',width:32,textAlign:'center'}}>✖️</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.82rem'}}>Default</div></div>
            {!equipped[settingsCategory]&&<span style={{fontSize:'0.7rem',fontWeight:800,color:'var(--deep-rose)'}}>EQUIPPED</span>}
          </button>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {getAllCosmeticsForCategory(settingsCategory).map(item=>{const ul=(levelInfo?.level||0)>=item.level,eq=equipped[settingsCategory]===item.cosmeticId;
              return(<button key={item.cosmeticId} onClick={()=>ul&&handleEquip(settingsCategory,item.cosmeticId)} disabled={!ul}
                style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',width:'100%',background:eq?'var(--blush-soft)':ul?'white':'#F8F4F4',border:`2px solid ${eq?'var(--deep-rose)':ul?'var(--blush)':'#E8E0E0'}`,borderRadius:14,cursor:ul?'pointer':'not-allowed',fontFamily:'Quicksand',textAlign:'left',opacity:ul?1:0.55}}>
                <span style={{fontSize:'1.3rem',width:32,textAlign:'center'}}>{ul?item.icon:'🔒'}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.82rem'}}>{item.title}</div><div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{ul?item.reward:`Unlocks Lv.${item.level}`}</div></div>
                {eq&&<span style={{fontSize:'0.7rem',fontWeight:800,color:'var(--deep-rose)'}}>EQUIPPED</span>}
              </button>);})}
          </div><button className="btn-primary" onClick={()=>setSettingsCategory(null)} style={{width:'100%',marginTop:12}}>Done</button>
        </>}
      </div></>}

      {/* XP Popup + Level up */}
      {xpPopup&&<div className="xp-popup"><div className="xp-popup-header"><span className="xp-popup-game">{xpPopup.gameName}</span><span className="xp-popup-total">+{xpPopup.total} XP</span></div><div className="xp-popup-bonuses">{xpPopup.bonuses.map((b,i)=><div key={i} className="xp-bonus-line"><span>{b.label}</span><span>+{b.xp}</span></div>)}</div></div>}
      {levelUpAnim&&<div className="level-up-overlay"><div className="level-up-content"><div className="level-up-stars">✨ 🌟 ⭐ 🌟 ✨</div><h1>Level Up!</h1><div className="level-up-number">Level {levelInfo?.level}</div></div></div>}

      <BottomNav navBg={cosmetics?.navBg} navBorder={cosmetics?.navBorder}/>
    </>
  );
}
