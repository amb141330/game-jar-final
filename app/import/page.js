'use client';
import { useState, useEffect, useRef } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
import ShelfBackground from '@/components/ShelfBackground';
import AnimalParade from '@/components/AnimalParade';
import BottomNav from '@/components/BottomNav';
import { useCosmetics } from '@/lib/cosmeticEngine';
import { getCollection, saveCollection, getFavorites, toggleFavorite, importFromJSON, parseCollectionXML, parseThingXML } from '@/lib/gameStore';
import { getCosmeticCategoriesForPage, getAllCosmeticsForCategory, getEquippedCosmetics, equipCosmetic, unequipCosmetic, setAnimalAccessory, clearAnimalAccessory, getUnlockedAnimals, getLevelFromXP, getBattlePassState, ANIMAL_UNLOCKS, ALL_REWARDS, COSMETIC_POOLS } from '@/lib/battlePass';

export default function ImportPage() {
  const { cosmetics, refresh: refreshCosmetics } = useCosmetics();
  const [username,setUsername]=useState('');
  const [games,setGames]=useState([]);
  const [favorites,setFavorites]=useState(new Set());
  const [loading,setLoading]=useState(false);
  const [loadingStatus,setLoadingStatus]=useState('');
  const [progress,setProgress]=useState(0);
  const [error,setError]=useState('');
  const [searchQuery,setSearchQuery]=useState('');
  const fileInputRef=useRef(null);
  // Cosmetics
  const [showSettings, setShowSettings] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState(null);
  const [equipped, setEquipped] = useState({});
  const [levelInfo, setLevelInfo] = useState(null);
  // Animal accessory picker
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [unlockedAnimals, setUnlockedAnimals] = useState([]);

  useEffect(() => {
    setGames(getCollection()); setFavorites(getFavorites());
    const eq = getEquippedCosmetics(); setEquipped(eq);
    const bp = getBattlePassState(); const li = getLevelFromXP(bp.totalXP);
    setLevelInfo(li); setUnlockedAnimals(getUnlockedAnimals(li.level));
  }, []);

  const fetchCollection=async()=>{
    if(!username.trim())return;setLoading(true);setError('');setProgress(0);setLoadingStatus('Reaching out to BGG...');
    try{const r=await fetch(`/api/bgg/collection?username=${encodeURIComponent(username.trim())}`);if(!r.ok){const e=await r.json();throw new Error(e.error||'Failed');}setProgress(30);setLoadingStatus('Parsing...');let pg=parseCollectionXML(await r.text());if(!pg.length)throw new Error('No games found');setProgress(50);setLoadingStatus(`Found ${pg.length} games!`);const bs=20,tb=Math.ceil(pg.length/bs);for(let i=0;i<tb;i++){const ids=pg.slice(i*bs,(i+1)*bs).map(g=>g.id).join(',');try{const tr=await fetch(`/api/bgg/things?ids=${ids}`);if(tr.ok){const d=parseThingXML(await tr.text());pg=pg.map(g=>d[g.id]?{...g,tags:d[g.id].tags}:g);}}catch{}setProgress(50+((i+1)/tb)*45);if(i<tb-1)await new Promise(r=>setTimeout(r,800));}pg.forEach(g=>{if(g.numPlays===0)g.tags.push('Never Played');});const sorted=[...pg].filter(g=>g.numPlays>0).sort((a,b)=>b.numPlays-a.numPlays);const top10=new Set(sorted.slice(0,10).map(g=>g.id));pg.forEach(g=>{if(top10.has(g.id))g.tags.push('Most Played');});pg.sort((a,b)=>a.name.localeCompare(b.name));saveCollection(pg);setGames(pg);setProgress(100);setLoadingStatus('Done! 🎉');setTimeout(()=>{setLoading(false);setProgress(0);},1000);
    }catch(e){setError(e.message);setLoading(false);}
  };
  const handleJSON=async e=>{const f=e.target.files?.[0];if(!f)return;setLoading(true);setError('');setLoadingStatus('Reading...');setProgress(50);try{setGames(importFromJSON(await f.text()));setProgress(100);setLoadingStatus('Done! 🎉');setTimeout(()=>{setLoading(false);setProgress(0);},1000);}catch(e){setError(e.message);setLoading(false);}if(fileInputRef.current)fileInputRef.current.value='';};
  const loadBundled=async()=>{setLoading(true);setError('');setLoadingStatus('Loading...');setProgress(30);try{const r=await fetch('/collection.json');if(!r.ok)throw new Error('Not found');setGames(importFromJSON(await r.json()));setProgress(100);setLoadingStatus('Done! 🎉');setTimeout(()=>{setLoading(false);setProgress(0);},1000);}catch(e){setError(e.message);setLoading(false);}};
  const toggleFav=id=>setFavorites(new Set(toggleFavorite(id)));
  const clearAll=()=>{if(confirm('Remove all?')){saveCollection([]);setGames([]);}};
  const exportAll=()=>{const b=new Blob([JSON.stringify(games,null,2)],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='games.json';a.click();URL.revokeObjectURL(u);};
  const shown=searchQuery.trim()?games.filter(g=>g.name.toLowerCase().includes(searchQuery.toLowerCase())):games;

  // Cosmetic helpers
  const handleEquip = (c,id) => { setEquipped(equipCosmetic(c,id)); refreshCosmetics(); };
  const handleUnequip = c => { setEquipped(unequipCosmetic(c)); refreshCosmetics(); };
  const handleAnimalAccessory = (animalId, cosmeticId) => { setEquipped(setAnimalAccessory(animalId, cosmeticId)); refreshCosmetics(); };
  const handleClearAnimalAccessory = (animalId) => { setEquipped(clearAnimalAccessory(animalId)); refreshCosmetics(); };

  // Get the accessory name for a given animal
  const getAnimalAccessoryName = (animalId) => {
    const acc = equipped.animalAccessories?.[animalId];
    if (!acc) return null;
    const reward = ALL_REWARDS.find(r => r.cosmeticId === acc);
    if (!reward) return null;
    const pool = COSMETIC_POOLS.meepleAccessory.find(p => p.id === reward.cosmeticRef);
    return pool ? pool.name : null;
  };

  const jarCosmeticCategories = getCosmeticCategoriesForPage('games');

  return (
    <>
      <ShelfBackground tintFrom={cosmetics?.bgFrom} tintTo={cosmetics?.bgTo}/>
      <FloatingHearts color={cosmetics?.heartColor}/>
      <AnimalParade/>
      <div className="main-content page-enter" style={{overflow:'auto'}}>
        <div className="import-container">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:6}}>
            <h1 style={{fontFamily:'Caveat,cursive',fontSize:'1.8rem',color:'var(--berry)'}}>📚 Game Library</h1>
            <button onClick={()=>{setShowSettings(true);setSettingsCategory(null);setSelectedAnimal(null);}} style={{background:'white',border:'2px solid var(--rose)',borderRadius:14,padding:'6px 12px',fontFamily:'Quicksand',fontWeight:700,fontSize:'0.75rem',color:'var(--deep-rose)',cursor:'pointer'}}>⚙️</button>
          </div>
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

      {/* ─── COSMETICS SETTINGS (games page) ─── */}
      {showSettings&&<><div className="filter-drawer-overlay" onClick={()=>{setShowSettings(false);setSettingsCategory(null);setSelectedAnimal(null);}}/><div className="filter-drawer" style={{maxHeight:'85vh'}}><div className="drawer-handle"/>
        {!settingsCategory && !selectedAnimal ? <>
          <h3>📚 Games Page Cosmetics</h3>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {/* Non-animal categories */}
            {jarCosmeticCategories.filter(c=>c.key!=='meepleAccessory').map(cat=>{
              const all=getAllCosmeticsForCategory(cat.key),uc=all.filter(c=>c.level<=(levelInfo?.level||0)).length;
              const ei=equipped[cat.key]?all.find(c=>c.cosmeticId===equipped[cat.key]):null;
              return(<button key={cat.key} onClick={()=>setSettingsCategory(cat.key)} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:equipped[cat.key]?'var(--blush-soft)':'white',border:`2px solid ${equipped[cat.key]?'var(--rose)':'var(--blush)'}`,borderRadius:14,cursor:'pointer',textAlign:'left',fontFamily:'Quicksand'}}>
                <span style={{fontSize:'1.4rem'}}>{cat.icon}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.85rem'}}>{cat.label}</div><div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{ei?`${ei.icon} ${ei.title}`:'None'} · {uc}/{all.length}</div></div><span style={{color:'var(--text-muted)'}}>›</span>
              </button>);
            })}
            {/* Animal Hats — shows list of unlocked animals */}
            <button onClick={()=>setSettingsCategory('animalHats')} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'white',border:'2px solid var(--blush)',borderRadius:14,cursor:'pointer',textAlign:'left',fontFamily:'Quicksand'}}>
              <span style={{fontSize:'1.4rem'}}>👒</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.85rem'}}>Animal Hats</div><div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{unlockedAnimals.length} animals · Choose hats per animal</div></div><span style={{color:'var(--text-muted)'}}>›</span>
            </button>
          </div>
          <button className="btn-primary" onClick={()=>{setShowSettings(false);setSettingsCategory(null);}} style={{width:'100%',marginTop:12}}>Done</button>
        </> : settingsCategory === 'animalHats' && !selectedAnimal ? <>
          {/* Animal picker */}
          <button onClick={()=>setSettingsCategory(null)} style={{background:'none',border:'none',color:'var(--deep-rose)',fontFamily:'Quicksand',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',marginBottom:4}}>← Back</button>
          <h3>👒 Choose an Animal</h3>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {unlockedAnimals.map(animal => {
              const accName = getAnimalAccessoryName(animal.id);
              return (
                <button key={animal.id} onClick={()=>setSelectedAnimal(animal.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:accName?'var(--blush-soft)':'white',border:`2px solid ${accName?'var(--rose)':'var(--blush)'}`,borderRadius:14,cursor:'pointer',textAlign:'left',fontFamily:'Quicksand'}}>
                  <span style={{fontSize:'1.6rem'}}>{animal.icon}</span>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.85rem'}}>{animal.name}</div><div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{accName || 'No hat'}</div></div>
                  <span style={{color:'var(--text-muted)'}}>›</span>
                </button>
              );
            })}
          </div>
          <button className="btn-primary" onClick={()=>setSettingsCategory(null)} style={{width:'100%',marginTop:12}}>Done</button>
        </> : selectedAnimal ? <>
          {/* Hat picker for specific animal */}
          <button onClick={()=>setSelectedAnimal(null)} style={{background:'none',border:'none',color:'var(--deep-rose)',fontFamily:'Quicksand',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',marginBottom:4}}>← Back</button>
          <h3>{ANIMAL_UNLOCKS.find(a=>a.id===selectedAnimal)?.icon} {ANIMAL_UNLOCKS.find(a=>a.id===selectedAnimal)?.name}&apos;s Hat</h3>
          <button onClick={()=>handleClearAnimalAccessory(selectedAnimal)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',width:'100%',background:!equipped.animalAccessories?.[selectedAnimal]?'var(--blush-soft)':'white',border:`2px solid ${!equipped.animalAccessories?.[selectedAnimal]?'var(--deep-rose)':'var(--blush)'}`,borderRadius:14,cursor:'pointer',marginBottom:6,fontFamily:'Quicksand',textAlign:'left'}}>
            <span style={{fontSize:'1.3rem',width:32,textAlign:'center'}}>✖️</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.82rem'}}>No Hat</div></div>
            {!equipped.animalAccessories?.[selectedAnimal]&&<span style={{fontSize:'0.7rem',fontWeight:800,color:'var(--deep-rose)'}}>EQUIPPED</span>}
          </button>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {getAllCosmeticsForCategory('meepleAccessory').map(item => {
              const ul = (levelInfo?.level||0) >= item.level;
              const eq = equipped.animalAccessories?.[selectedAnimal] === item.cosmeticId;
              return (
                <button key={item.cosmeticId} onClick={()=>ul&&handleAnimalAccessory(selectedAnimal,item.cosmeticId)} disabled={!ul}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',width:'100%',background:eq?'var(--blush-soft)':ul?'white':'#F8F4F4',border:`2px solid ${eq?'var(--deep-rose)':ul?'var(--blush)':'#E8E0E0'}`,borderRadius:14,cursor:ul?'pointer':'not-allowed',fontFamily:'Quicksand',textAlign:'left',opacity:ul?1:0.55}}>
                  <span style={{fontSize:'1.3rem',width:32,textAlign:'center'}}>{ul?item.icon:'🔒'}</span>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.82rem'}}>{item.title}</div><div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{ul?item.reward:`Unlocks Lv.${item.level}`}</div></div>
                  {eq&&<span style={{fontSize:'0.7rem',fontWeight:800,color:'var(--deep-rose)'}}>EQUIPPED</span>}
                </button>
              );
            })}
          </div>
          <button className="btn-primary" onClick={()=>setSelectedAnimal(null)} style={{width:'100%',marginTop:12}}>Done</button>
        </> : <>
          {/* Regular cosmetic category picker */}
          <button onClick={()=>setSettingsCategory(null)} style={{background:'none',border:'none',color:'var(--deep-rose)',fontFamily:'Quicksand',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',marginBottom:4}}>← Back</button>
          <h3>{jarCosmeticCategories.find(c=>c.key===settingsCategory)?.icon} {jarCosmeticCategories.find(c=>c.key===settingsCategory)?.label}</h3>
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

      <BottomNav navBg={cosmetics?.navBg} navBorder={cosmetics?.navBorder}/>
    </>
  );
}
