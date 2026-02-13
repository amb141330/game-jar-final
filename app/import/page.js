'use client';

import { useState, useEffect, useRef } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
import ShelfBackground from '@/components/ShelfBackground';
import BottomNav from '@/components/BottomNav';
import { useCosmetics } from '@/lib/cosmeticEngine';
import { getCollection, saveCollection, getFavorites, toggleFavorite, importFromJSON, parseCollectionXML, parseThingXML } from '@/lib/gameStore';

// Meeple accessory overlays - positioned relative to head center
function AccessoryOverlay({ accessory }) {
  if (!accessory) return null;
  const overlays = {
    crown: (
      <g transform="translate(20, -4)">
        <polygon points="0,8 3,-1 6,5 9,-2 12,5 15,-1 18,8" fill="#FFD700" stroke="#DAA520" strokeWidth="0.5"/>
        <rect x="0" y="7" width="18" height="3" rx="1" fill="#FFD700" stroke="#DAA520" strokeWidth="0.4"/>
        <circle cx="3" cy="1" r="1" fill="#FF6B6B"/><circle cx="9" cy="0" r="1" fill="#87CEEB"/><circle cx="15" cy="1" r="1" fill="#90EE90"/>
      </g>
    ),
    witch: (
      <g transform="translate(16, -10)">
        <polygon points="13,18 2,18 8,-2" fill="#4B2D73" stroke="#3A1F5E" strokeWidth="0.5"/>
        <ellipse cx="8" cy="17" rx="12" ry="3" fill="#4B2D73"/>
        <rect x="5" y="14" width="6" height="2" rx="1" fill="#8B5E3C"/>
        <circle cx="8" cy="-1" r="1.5" fill="#7CFC00"/>
      </g>
    ),
    flower: (
      <g transform="translate(14, -2)">
        {[[3,3,'#FF69B4'],[9,1,'#FFB347'],[15,0,'#87CEEB'],[21,1,'#FF69B4'],[27,3,'#DDA0DD']].map(([x,y,c],i)=>
          <g key={i}><circle cx={x} cy={y} r="3.5" fill={c} opacity="0.8"/><circle cx={x} cy={y} r="1.5" fill="#FFD700"/></g>
        )}
      </g>
    ),
    santa: (
      <g transform="translate(16, -6)">
        <path d="M0 12 Q13 -4 26 8 L24 14 L0 14 Z" fill="#CC0000"/>
        <ellipse cx="0" cy="13" rx="26" ry="3" fill="white"/>
        <circle cx="24" cy="5" r="3.5" fill="white"/>
      </g>
    ),
    wizard: (
      <g transform="translate(16, -12)">
        <polygon points="12,-2 0,18 24,18" fill="#2244AA" stroke="#1A338E" strokeWidth="0.4"/>
        <ellipse cx="12" cy="17" rx="14" ry="3" fill="#2244AA"/>
        <text x="8" y="8" fontSize="4" fill="#FFD700">✦</text>
        <text x="14" y="12" fontSize="3" fill="#FFD700">✦</text>
      </g>
    ),
    bunny: (
      <g transform="translate(17, -12)">
        <ellipse cx="6" cy="4" rx="4" ry="10" fill="white" stroke="#3A3030" strokeWidth="0.8"/>
        <ellipse cx="22" cy="4" rx="4" ry="10" fill="white" stroke="#3A3030" strokeWidth="0.8"/>
        <ellipse cx="6" cy="4" rx="2" ry="7" fill="#FFB6C1"/>
        <ellipse cx="22" cy="4" rx="2" ry="7" fill="#FFB6C1"/>
      </g>
    ),
    pirate: (
      <g transform="translate(16, -4)">
        <path d="M0 10 Q14 0 28 10 Z" fill="#1A1A1A"/>
        <ellipse cx="14" cy="10" rx="15" ry="3" fill="#1A1A1A"/>
        <text x="9" y="8" fontSize="7">☠️</text>
      </g>
    ),
    chef: (
      <g transform="translate(16, -8)">
        <circle cx="14" cy="4" r="6" fill="white" stroke="#DDD" strokeWidth="0.5"/>
        <circle cx="8" cy="6" r="5" fill="white" stroke="#DDD" strokeWidth="0.5"/>
        <circle cx="20" cy="6" r="5" fill="white" stroke="#DDD" strokeWidth="0.5"/>
        <rect x="2" y="10" width="24" height="5" rx="2" fill="white" stroke="#DDD" strokeWidth="0.5"/>
      </g>
    ),
    party: (
      <g transform="translate(22, -14)">
        <polygon points="8,-2 0,16 16,16" fill="#FF69B4" stroke="#DD4488" strokeWidth="0.4"/>
        <circle cx="8" cy="-2" r="2" fill="#FFD700"/>
        <circle cx="5" cy="5" r="1.2" fill="#87CEEB"/><circle cx="10" cy="8" r="1" fill="#90EE90"/><circle cx="6" cy="11" r="1.2" fill="#FFD700"/>
      </g>
    ),
    detective: (
      <g transform="translate(14, -2)">
        <ellipse cx="16" cy="8" rx="18" ry="5" fill="#8B6914" stroke="#6B4F10" strokeWidth="0.4"/>
        <path d="M4 8 Q16 -2 28 6 L28 8 L4 8 Z" fill="#8B6914"/>
        <rect x="10" y="3" width="12" height="5" rx="1" fill="#6B4F10"/>
      </g>
    ),
  };
  return overlays[accessory] || null;
}

/**
 * Cute Meeple-Cat — my own design!
 * 
 * A squishy, round little meeple: egg/gumdrop shaped body (wider at bottom,
 * narrower at top), small pointy cat ears, a minimal kawaii face, and a 
 * polka-dot bow. Think "if a meeple and a marshmallow cat had a baby."
 */
function MeepleCharacter({ accessory }) {
  return (
    <div className="meeple-character">
      <div className="meeple-inner">
        <svg className="meeple-svg" viewBox="0 0 58 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Hat accessory layer */}
          <g><AccessoryOverlay accessory={accessory}/></g>

          {/* Left ear */}
          <path d="M15 18 L10 4 L23 15 Z" fill="#FFFBF0" stroke="#4A3040" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M15 17 L12 8 L21 15 Z" fill="#FFB6C1" opacity="0.45"/>
          {/* Right ear */}
          <path d="M43 18 L48 4 L35 15 Z" fill="#FFFBF0" stroke="#4A3040" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M43 17 L46 8 L37 15 Z" fill="#FFB6C1" opacity="0.45"/>

          {/* Body — gumdrop/egg shape: round top, wider bottom, very soft */}
          <path d="
            M29 12
            C18 12, 9 22, 9 36
            C9 48, 14 56, 20 58
            L38 58
            C44 56, 49 48, 49 36
            C49 22, 40 12, 29 12 Z
          " fill="#FFFBF0" stroke="#4A3040" strokeWidth="2"/>

          {/* Face — minimal kawaii style */}
          {/* Eyes: small shiny ovals */}
          <ellipse cx="22" cy="34" rx="2.5" ry="3" fill="#4A3040"/>
          <ellipse cx="36" cy="34" rx="2.5" ry="3" fill="#4A3040"/>
          <circle cx="23" cy="33" r="1" fill="white" opacity="0.9"/>
          <circle cx="37" cy="33" r="1" fill="white" opacity="0.9"/>

          {/* Nose — tiny triangle/oval, gold-ish */}
          <ellipse cx="29" cy="39.5" rx="2" ry="1.5" fill="#F0B860"/>

          {/* Mouth — tiny happy curve */}
          <path d="M26 42.5 Q29 45 32 42.5" stroke="#4A3040" strokeWidth="1" fill="none" strokeLinecap="round"/>

          {/* Whiskers — 3 per side, delicate */}
          <line x1="4" y1="36" x2="18" y2="37" stroke="#4A3040" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
          <line x1="4" y1="40" x2="18" y2="39.5" stroke="#4A3040" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
          <line x1="5" y1="32" x2="18" y2="34.5" stroke="#4A3040" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
          <line x1="40" y1="37" x2="54" y2="36" stroke="#4A3040" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
          <line x1="40" y1="39.5" x2="54" y2="40" stroke="#4A3040" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
          <line x1="40" y1="34.5" x2="53" y2="32" stroke="#4A3040" strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>

          {/* Blush — soft pink circles */}
          <ellipse cx="16" cy="40" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.25"/>
          <ellipse cx="42" cy="40" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.25"/>

          {/* Bow — polka dot, on right ear */}
          <ellipse cx="44" cy="10" rx="5.5" ry="3.8" fill="#FF4466" transform="rotate(-12 44 10)"/>
          <ellipse cx="51" cy="9" rx="5.5" ry="3.8" fill="#FF4466" transform="rotate(12 51 9)"/>
          <circle cx="47.5" cy="10" r="2.8" fill="#DD2244"/>
          {/* Polka dots */}
          <circle cx="42" cy="9.5" r="0.9" fill="white" opacity="0.65"/>
          <circle cx="45" cy="12" r="0.7" fill="white" opacity="0.65"/>
          <circle cx="50" cy="8" r="0.9" fill="white" opacity="0.65"/>
          <circle cx="53" cy="11" r="0.7" fill="white" opacity="0.65"/>
        </svg>
        <div className="meeple-shadow"/>
      </div>
    </div>
  );
}

export default function ImportPage() {
  const { cosmetics } = useCosmetics();
  const [username,setUsername]=useState('');
  const [games,setGames]=useState([]);
  const [favorites,setFavorites]=useState(new Set());
  const [loading,setLoading]=useState(false);
  const [loadingStatus,setLoadingStatus]=useState('');
  const [progress,setProgress]=useState(0);
  const [error,setError]=useState('');
  const [searchQuery,setSearchQuery]=useState('');
  const fileInputRef=useRef(null);

  useEffect(()=>{setGames(getCollection());setFavorites(getFavorites());},[]);

  const fetchCollection=async()=>{
    if(!username.trim())return;
    setLoading(true);setError('');setProgress(0);setLoadingStatus('Reaching out to BGG...');
    try{
      const r=await fetch(`/api/bgg/collection?username=${encodeURIComponent(username.trim())}`);
      if(!r.ok){const e=await r.json();throw new Error(e.error||'Failed');}
      setProgress(30);setLoadingStatus('Parsing...');
      let pg=parseCollectionXML(await r.text());
      if(!pg.length)throw new Error('No games found');
      setProgress(50);setLoadingStatus(`Found ${pg.length} games!`);
      const bs=20,tb=Math.ceil(pg.length/bs);
      for(let i=0;i<tb;i++){
        const ids=pg.slice(i*bs,(i+1)*bs).map(g=>g.id).join(',');
        try{const tr=await fetch(`/api/bgg/things?ids=${ids}`);if(tr.ok){const d=parseThingXML(await tr.text());pg=pg.map(g=>d[g.id]?{...g,tags:d[g.id].tags}:g);}}catch{}
        setProgress(50+((i+1)/tb)*45);if(i<tb-1)await new Promise(r=>setTimeout(r,800));
      }
      pg.forEach(g=>{if(g.numPlays===0)g.tags.push('Never Played');});
      const sorted=[...pg].filter(g=>g.numPlays>0).sort((a,b)=>b.numPlays-a.numPlays);
      const top10=new Set(sorted.slice(0,10).map(g=>g.id));
      pg.forEach(g=>{if(top10.has(g.id))g.tags.push('Most Played');});
      pg.sort((a,b)=>a.name.localeCompare(b.name));
      saveCollection(pg);setGames(pg);setProgress(100);setLoadingStatus('Done! 🎉');
      setTimeout(()=>{setLoading(false);setProgress(0);},1000);
    }catch(e){setError(e.message);setLoading(false);}
  };

  const handleJSON=async e=>{const f=e.target.files?.[0];if(!f)return;setLoading(true);setError('');setLoadingStatus('Reading...');setProgress(50);
    try{setGames(importFromJSON(await f.text()));setProgress(100);setLoadingStatus('Done! 🎉');setTimeout(()=>{setLoading(false);setProgress(0);},1000);}
    catch(e){setError(e.message);setLoading(false);}if(fileInputRef.current)fileInputRef.current.value='';};

  const loadBundled=async()=>{setLoading(true);setError('');setLoadingStatus('Loading...');setProgress(30);
    try{const r=await fetch('/collection.json');if(!r.ok)throw new Error('Not found');setGames(importFromJSON(await r.json()));setProgress(100);setLoadingStatus('Done! 🎉');
      setTimeout(()=>{setLoading(false);setProgress(0);},1000);}catch(e){setError(e.message);setLoading(false);}};

  const toggleFav=id=>setFavorites(new Set(toggleFavorite(id)));
  const clearAll=()=>{if(confirm('Remove all?')){saveCollection([]);setGames([]);}};
  const exportAll=()=>{const b=new Blob([JSON.stringify(games,null,2)],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='games.json';a.click();URL.revokeObjectURL(u);};
  const shown=searchQuery.trim()?games.filter(g=>g.name.toLowerCase().includes(searchQuery.toLowerCase())):games;

  return (
    <>
      {/* Shelves always visible — bg cosmetic applied as tint layer behind books */}
      <ShelfBackground tintFrom={cosmetics?.bgFrom} tintTo={cosmetics?.bgTo}/>
      <MeepleCharacter accessory={cosmetics?.meepleAccessory}/>
      <FloatingHearts color={cosmetics?.heartColor}/>
      <div className="main-content page-enter" style={{overflow:'auto'}}>
        <div className="import-container">
          <div className="app-title" style={{paddingTop:'6px'}}><h1>📚 Game Library</h1></div>
          {!games.length&&!loading&&(
            <div style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'16px'}}>
              <button className="btn-primary" onClick={loadBundled} style={{width:'100%'}}>🫙 Load Our Collection</button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleJSON} style={{display:'none'}}/>
              <button className="btn-secondary" onClick={()=>fileInputRef.current?.click()} style={{width:'100%'}}>📄 Import from JSON</button>
              <div style={{borderTop:'1px solid var(--blush)',paddingTop:'10px',marginTop:'4px'}}>
                <p style={{fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:'6px',fontWeight:600}}>Or import from BGG:</p>
                <div className="import-input-group">
                  <input className="import-input" type="text" placeholder="BGG username" value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchCollection()} disabled={loading}/>
                  <button className="btn-primary" onClick={fetchCollection} disabled={loading||!username.trim()} style={{padding:'12px 16px'}}>Go</button>
                </div>
              </div>
            </div>
          )}
          {loading&&<div><div className="progress-bar-container"><div className="progress-bar" style={{width:`${progress}%`}}/></div>
            <div className="loader"><div className="loader-hearts"><span>💕</span><span>💕</span><span>💕</span></div><span className="loader-text">{loadingStatus}</span></div></div>}
          {error&&<div style={{background:'#FFF0F0',padding:'12px 14px',borderRadius:'14px',color:'#C44',fontSize:'0.85rem',margin:'10px 0',fontWeight:600}}>{error}</div>}
          {games.length>0&&!loading&&<>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'10px',marginBottom:'6px',gap:'6px'}}>
              <span style={{fontSize:'0.78rem',color:'var(--text-muted)',fontWeight:700}}>{games.length} games</span>
              <div style={{display:'flex',gap:'5px'}}>
                <button className="btn-secondary" onClick={exportAll} style={{padding:'5px 10px',fontSize:'0.72rem'}}>Export</button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={handleJSON} style={{display:'none'}}/>
                <button className="btn-secondary" onClick={()=>fileInputRef.current?.click()} style={{padding:'5px 10px',fontSize:'0.72rem'}}>Import</button>
                <button className="btn-secondary" onClick={clearAll} style={{padding:'5px 10px',fontSize:'0.72rem'}}>Clear</button>
              </div>
            </div>
            <input className="import-input" type="text" placeholder="🔍 Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{marginBottom:'6px',width:'100%'}}/>
            <div className="game-list">{shown.map(g=>(
              <div key={g.id} className="game-list-item">
                {g.thumbnail?<img src={g.thumbnail} alt="" loading="lazy"/>:<div style={{width:38,height:38,borderRadius:10,background:'var(--blush)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',flexShrink:0}}>🎲</div>}
                <div className="game-info"><div className="game-name">{g.name}</div><div className="game-detail">{g.year&&`${g.year}`}{g.numPlays>0?` · ${g.numPlays} plays`:' · Never played'}{g.playingTime?` · ${g.playingTime}min`:''}</div></div>
                <button className="fav-btn" onClick={()=>toggleFav(g.id)}>{favorites.has(g.id)?'❤️':'🤍'}</button>
              </div>))}
              {!shown.length&&searchQuery&&<div style={{padding:'20px',textAlign:'center',color:'var(--text-muted)',fontSize:'0.85rem',fontWeight:600}}>No matches</div>}
            </div>
          </>}
        </div>
      </div>
      <BottomNav navBg={cosmetics?.navBg} navBorder={cosmetics?.navBorder}/>
    </>
  );
}
