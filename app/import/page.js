'use client';
import { useState, useEffect, useRef } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
import ShelfBackground from '@/components/ShelfBackground';
import AnimalParade from '@/components/AnimalParade';
import BottomNav from '@/components/BottomNav';
import { useCosmetics } from '@/lib/cosmeticEngine';
import { getCollection, saveCollection, getFavorites, toggleFavorite, importFromJSON, parseCollectionXML, parseThingXML } from '@/lib/gameStore';

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
      <ShelfBackground tintFrom={cosmetics?.bgFrom} tintTo={cosmetics?.bgTo}/>
      <FloatingHearts color={cosmetics?.heartColor}/>
      <AnimalParade/>
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
                <div className="import-input-group"><input className="import-input" type="text" placeholder="BGG username" value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchCollection()} disabled={loading}/><button className="btn-primary" onClick={fetchCollection} disabled={loading||!username.trim()} style={{padding:'12px 16px'}}>Go</button></div>
              </div>
            </div>
          )}
          {loading&&<div><div className="progress-bar-container"><div className="progress-bar" style={{width:`${progress}%`}}/></div><div className="loader"><div className="loader-hearts"><span>💕</span><span>💕</span><span>💕</span></div><span className="loader-text">{loadingStatus}</span></div></div>}
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
