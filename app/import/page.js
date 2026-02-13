'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
import BottomNav from '@/components/BottomNav';
import { useCosmetics } from '@/lib/cosmeticEngine';
import { getCollection, saveCollection, getFavorites, toggleFavorite, importFromJSON, parseCollectionXML, parseThingXML } from '@/lib/gameStore';

const bookColors = [
  '#E8A0BF','#D4728C','#9B4D6E','#C9A96E','#7BAACC','#A5C8A1','#D4A0D9','#E8C87B',
  '#8BBDD9','#C49898','#B8D4A8','#D9B0C4','#A8C4D4','#E8B898','#98B8D4','#C8A8D8',
  '#D8C898','#A8D8C8','#D89898','#98D8A8',
];

function genBooks(n) {
  return Array.from({length:n},(_,i)=>({color:bookColors[i%bookColors.length],h:30+Math.random()*30,w:12+Math.random()*8}));
}

// Accessory SVG overlays for the meeple
function AccessoryOverlay({ accessory }) {
  if (!accessory) return null;
  const map = {
    crown: <><polygon points="12,0 14,5 10,5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.3"/><polygon points="17,0 19,5 15,5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.3"/><polygon points="22,0 24,5 20,5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.3"/><rect x="9" y="4" width="16" height="3" rx="0.5" fill="#FFD700" stroke="#DAA520" strokeWidth="0.3"/></>,
    witch: <><polygon points="17,0 8,10 26,10" fill="#4A2F6E" stroke="#2A1A4E" strokeWidth="0.4"/><rect x="6" y="9.5" width="22" height="2" rx="1" fill="#4A2F6E"/><circle cx="17" cy="4" r="1" fill="#8FD400"/></>,
    flower: <>{[[10,4,'#FF69B4'],[14,3,'#FFB347'],[18,2.5,'#87CEEB'],[22,3,'#90EE90'],[26,4,'#DDA0DD']].map(([x,y,c],i)=><circle key={i} cx={x} cy={y} r="2.5" fill={c} opacity="0.85"/>)}<circle cx="10" cy="4" r="1" fill="#FFD700"/><circle cx="14" cy="3" r="1" fill="#FFD700"/><circle cx="18" cy="2.5" r="1" fill="#FFD700"/><circle cx="22" cy="3" r="1" fill="#FFD700"/><circle cx="26" cy="4" r="1" fill="#FFD700"/></>,
    santa: <><path d="M8 9 Q17 -2 28 6 L26 10 L8 10 Z" fill="#CC0000"/><circle cx="27" cy="4" r="2.5" fill="white"/><rect x="7" y="8.5" width="22" height="3" rx="1.5" fill="white"/></>,
    wizard: <><polygon points="17,-2 6,12 28,12" fill="#3344AA" stroke="#2233AA" strokeWidth="0.3"/><rect x="5" y="10.5" width="24" height="2.5" rx="1" fill="#3344AA"/>{[[12,4],[17,6],[22,3]].map(([x,y],i)=><text key={i} x={x} y={y} fontSize="3" fill="#FFD700">✦</text>)}</>,
    bunny: <><ellipse cx="12" cy="2" rx="3" ry="8" fill="#FFB6C1" stroke="#333" strokeWidth="0.4"/><ellipse cx="22" cy="2" rx="3" ry="8" fill="#FFB6C1" stroke="#333" strokeWidth="0.4"/><ellipse cx="12" cy="2" rx="1.5" ry="5" fill="#FF8CAD"/><ellipse cx="22" cy="2" rx="1.5" ry="5" fill="#FF8CAD"/></>,
    pirate: <><path d="M6 10 Q17 2 28 10 Z" fill="#222"/><rect x="5" y="9" width="24" height="2.5" rx="1" fill="#222"/><text x="17" y="8" textAnchor="middle" fontSize="5">☠️</text></>,
    chef: <><ellipse cx="17" cy="3" rx="8" ry="6" fill="white" stroke="#DDD" strokeWidth="0.4"/><rect x="9" y="7" width="16" height="4" rx="1" fill="white" stroke="#DDD" strokeWidth="0.4"/></>,
    party: <><polygon points="17,-1 10,11 24,11" fill="#FF69B4" stroke="#DD5090" strokeWidth="0.3"/><circle cx="17" cy="-1" r="1.5" fill="#FFD700"/>{[[13,4,'#87CEEB'],[17,6,'#90EE90'],[21,3,'#FFD700']].map(([x,y,c],i)=><circle key={i} cx={x} cy={y} r="1" fill={c}/>)}</>,
    detective: <><ellipse cx="17" cy="8" rx="13" ry="4" fill="#8B6914" stroke="#6B4F10" strokeWidth="0.3"/><path d="M8 8 Q17 0 26 8 Z" fill="#8B6914" stroke="#6B4F10" strokeWidth="0.3"/></>,
  };
  return map[accessory] || null;
}

/*
 * Cute meeple-cat: bread-loaf / marshmallow shape matching the reference.
 * Rounded rectangle body, small cat ear triangles, minimal face, polka-dot bow.
 */
function MeepleCharacter({ accessory }) {
  return (
    <div className="meeple-character">
      <div className="meeple-inner">
        <svg className="meeple-svg" viewBox="0 0 52 58" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Accessory (hat etc) - rendered above head */}
          <g transform="translate(9, -2)">
            <AccessoryOverlay accessory={accessory}/>
          </g>

          {/* Cat ears */}
          <polygon points="10,18 6,4 18,14" fill="#FFFBF0" stroke="#3A3030" strokeWidth="1.8" strokeLinejoin="round"/>
          <polygon points="42,18 46,4 34,14" fill="#FFFBF0" stroke="#3A3030" strokeWidth="1.8" strokeLinejoin="round"/>
          {/* Inner ear pink */}
          <polygon points="10.5,17 8,8 16,14" fill="#FFB6C1" opacity="0.5"/>
          <polygon points="41.5,17 44,8 36,14" fill="#FFB6C1" opacity="0.5"/>

          {/* Body - bread loaf / marshmallow shape */}
          <rect x="4" y="14" width="44" height="40" rx="12" ry="10"
            fill="#FFFBF0" stroke="#3A3030" strokeWidth="2"/>

          {/* Eyes - small dots */}
          <circle cx="19" cy="32" r="2.2" fill="#3A3030"/>
          <circle cx="33" cy="32" r="2.2" fill="#3A3030"/>
          {/* Tiny eye highlights */}
          <circle cx="19.7" cy="31.3" r="0.7" fill="white"/>
          <circle cx="33.7" cy="31.3" r="0.7" fill="white"/>

          {/* Nose - gold oval */}
          <ellipse cx="26" cy="37" rx="2" ry="1.5" fill="#E8B84A"/>

          {/* Whiskers */}
          <line x1="2" y1="34" x2="15" y2="35" stroke="#3A3030" strokeWidth="1" strokeLinecap="round"/>
          <line x1="2" y1="38" x2="15" y2="37.5" stroke="#3A3030" strokeWidth="1" strokeLinecap="round"/>
          <line x1="2" y1="30" x2="15" y2="32.5" stroke="#3A3030" strokeWidth="1" strokeLinecap="round"/>
          <line x1="37" y1="35" x2="50" y2="34" stroke="#3A3030" strokeWidth="1" strokeLinecap="round"/>
          <line x1="37" y1="37.5" x2="50" y2="38" stroke="#3A3030" strokeWidth="1" strokeLinecap="round"/>
          <line x1="37" y1="32.5" x2="50" y2="30" stroke="#3A3030" strokeWidth="1" strokeLinecap="round"/>

          {/* Blush circles */}
          <ellipse cx="13" cy="38" rx="3.5" ry="2" fill="#FFB6C1" opacity="0.3"/>
          <ellipse cx="39" cy="38" rx="3.5" ry="2" fill="#FFB6C1" opacity="0.3"/>

          {/* Bow on right ear - polka dot */}
          <ellipse cx="41" cy="12" rx="5" ry="3.5" fill="#FF4466" transform="rotate(-10 41 12)"/>
          <ellipse cx="48" cy="11" rx="5" ry="3.5" fill="#FF4466" transform="rotate(10 48 11)"/>
          <circle cx="44.5" cy="11.5" r="2.5" fill="#DD2244"/>
          {/* Polka dots */}
          <circle cx="39" cy="11.5" r="0.8" fill="white" opacity="0.7"/>
          <circle cx="42" cy="13.5" r="0.6" fill="white" opacity="0.7"/>
          <circle cx="47" cy="10.5" r="0.8" fill="white" opacity="0.7"/>
          <circle cx="49.5" cy="12.5" r="0.6" fill="white" opacity="0.7"/>
        </svg>
        <div className="meeple-shadow"/>
      </div>
    </div>
  );
}

function ShelfBackground() {
  const shelves = useMemo(()=>[genBooks(40),genBooks(40),genBooks(40),genBooks(40)],[]);
  return (
    <div className="shelf-bg" aria-hidden="true">
      {shelves.map((books,ri)=>(
        <div key={ri} className={`shelf-row shelf-row-${ri+1}`}>
          {[...books,...books].map((b,bi)=><div key={bi} className="shelf-book" style={{backgroundColor:b.color,height:b.h,width:b.w,opacity:0.5}}/>)}
        </div>
      ))}
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
  const bgStyle=cosmetics?.bgFrom?{background:`linear-gradient(180deg,${cosmetics.bgFrom},${cosmetics.bgTo})`}:{};

  return (
    <>
      <ShelfBackground/>
      <MeepleCharacter accessory={cosmetics?.meepleAccessory}/>
      <FloatingHearts color={cosmetics?.heartColor}/>
      <div className="main-content page-enter" style={{overflow:'auto',...bgStyle}}>
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
