'use client';
import { useState, useEffect, useCallback } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
import AnimalParade from '@/components/AnimalParade';
import BottomNav from '@/components/BottomNav';
import { useCosmetics } from '@/lib/cosmeticEngine';
import { getCollection } from '@/lib/gameStore';
import {
  getBattlePassState, getLevelFromXP, ALL_REWARDS, getRewardsForBlock, getBlockForLevel,
  logPlay, redeemReward, getNextReward, getCurrentTitle,
  COSMETIC_CATEGORIES, getAllCosmeticsForCategory, getEquippedCosmetics, equipCosmetic, unequipCosmetic,
} from '@/lib/battlePass';

export default function RewardsPage() {
  const { cosmetics, refresh: refreshCosmetics } = useCosmetics();
  const [bpState,setBpState]=useState(null);
  const [levelInfo,setLevelInfo]=useState(null);
  const [games,setGames]=useState([]);
  const [showLogPlay,setShowLogPlay]=useState(false);
  const [searchQuery,setSearchQuery]=useState('');
  const [xpPopup,setXpPopup]=useState(null);
  const [showRedeemConfirm,setShowRedeemConfirm]=useState(null);
  const [levelUpAnim,setLevelUpAnim]=useState(false);
  const [viewBlock,setViewBlock]=useState(0);
  const [showSettings,setShowSettings]=useState(false);
  const [settingsCategory,setSettingsCategory]=useState(null);
  const [equipped,setEquipped]=useState({});

  useEffect(()=>{
    setGames(getCollection());
    const state=getBattlePassState(); setBpState(state);
    const info=getLevelFromXP(state.totalXP); setLevelInfo(info);
    setViewBlock(getBlockForLevel(Math.max(1,info.level)));
    setEquipped(getEquippedCosmetics());
  },[]);

  const handleLogPlay=useCallback(game=>{
    const {play,levelInfo:nl,state:ns}=logPlay(game);
    const old=levelInfo?.level||0;
    setBpState(ns);setLevelInfo(nl);setShowLogPlay(false);setSearchQuery('');
    setXpPopup({total:play.xpEarned,bonuses:play.bonuses,gameName:game.name});
    if(nl.level>old){setTimeout(()=>setLevelUpAnim(true),1500);setTimeout(()=>setLevelUpAnim(false),4000);}
    setTimeout(()=>setXpPopup(null),3500);
  },[levelInfo]);

  const handleRedeem=l=>{setBpState(redeemReward(l));setShowRedeemConfirm(null);};
  const handleEquip=(c,id)=>{setEquipped(equipCosmetic(c,id));refreshCosmetics();};
  const handleUnequip=c=>{setEquipped(unequipCosmetic(c));refreshCosmetics();};

  if(!bpState||!levelInfo)return(<><FloatingHearts/><div className="main-content page-enter"><div className="loader" style={{paddingTop:'40vh'}}><div className="loader-hearts"><span>💕</span><span>💕</span><span>💕</span></div></div></div><BottomNav/></>);

  const nextReward=getNextReward(levelInfo.level);
  const blockRewards=getRewardsForBlock(viewBlock);
  const currentTitle=getCurrentTitle(levelInfo.level);
  const filtered=searchQuery.trim()?games.filter(g=>g.name.toLowerCase().includes(searchQuery.toLowerCase())):games;
  const bgStyle=cosmetics?.bgFrom?{background:`linear-gradient(180deg,${cosmetics.bgFrom},${cosmetics.bgTo})`}:{};

  return (
    <>
      <FloatingHearts color={cosmetics?.heartColor}/>
      <AnimalParade/>
      <div className="main-content page-enter" style={{overflow:'auto',...bgStyle}}>
        <div className="rewards-container">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:6}}>
            <h1 style={{fontFamily:'Caveat,cursive',fontSize:'1.8rem',color:'var(--berry)'}}>🏆 Rewards</h1>
            <button onClick={()=>{setShowSettings(true);setSettingsCategory(null);}} style={{background:'white',border:'2px solid var(--rose)',borderRadius:14,padding:'6px 12px',fontFamily:'Quicksand',fontWeight:700,fontSize:'0.78rem',color:'var(--deep-rose)',cursor:'pointer'}}>⚙️ Cosmetics</button>
          </div>

          <div className="level-card">
            <div className="level-badge"><span className="level-number">{levelInfo.level}</span><span className="level-label">LEVEL</span></div>
            <div className="level-details">
              <div className="level-title">{currentTitle}</div>
              <div className="xp-bar-wrapper"><div className="xp-bar"><div className="xp-bar-fill" style={{width:`${levelInfo.progressPercent}%`}}/></div>
                <div className="xp-text">{levelInfo.isMaxLevel?'MAX LEVEL!':`${Math.floor(levelInfo.xpIntoCurrentLevel)} / ${levelInfo.xpNeededForNext} XP`}</div></div>
              <div className="total-xp">✨ {levelInfo.totalXP.toLocaleString()} total XP</div>
            </div>
          </div>

          {nextReward&&<div className="next-reward-teaser"><span className="teaser-icon">{nextReward.icon}</span><div className="teaser-text"><strong>Next: Lv {nextReward.level} — {nextReward.title}</strong><span>{nextReward.reward}</span></div></div>}

          <button className="btn-primary log-play-btn" onClick={()=>setShowLogPlay(true)}>🎲 Log a Play (+XP)</button>

          <div className="stats-row">
            <div className="stat-card"><div className="stat-number">{bpState.plays.length}</div><div className="stat-label">Plays</div></div>
            <div className="stat-card"><div className="stat-number">{new Set(bpState.plays.map(p=>p.gameId)).size}</div><div className="stat-label">Unique</div></div>
            <div className="stat-card"><div className="stat-number">{ALL_REWARDS.filter(r=>r.level<=levelInfo.level).length}</div><div className="stat-label">Unlocked</div></div>
            <div className="stat-card"><div className="stat-number">500</div><div className="stat-label">Max</div></div>
          </div>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <h2 className="section-title" style={{margin:0}}>Levels {viewBlock*50+1}–{(viewBlock+1)*50}</h2>
            <div style={{display:'flex',gap:4}}>
              <button onClick={()=>setViewBlock(Math.max(0,viewBlock-1))} disabled={viewBlock===0} style={{width:34,height:34,borderRadius:10,border:'2px solid var(--rose)',background:'white',color:'var(--deep-rose)',fontWeight:800,fontSize:'1rem',cursor:viewBlock===0?'not-allowed':'pointer',opacity:viewBlock===0?0.4:1,display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
              <button onClick={()=>setViewBlock(Math.min(9,viewBlock+1))} disabled={viewBlock===9} style={{width:34,height:34,borderRadius:10,border:'2px solid var(--rose)',background:'white',color:'var(--deep-rose)',fontWeight:800,fontSize:'1rem',cursor:viewBlock===9?'not-allowed':'pointer',opacity:viewBlock===9?0.4:1,display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
            </div>
          </div>

          <div className="filter-scroll-wrapper" style={{marginBottom:10}}><div className="filter-bar" style={{padding:'4px 20px'}}>
            {Array.from({length:10},(_,i)=><button key={i} className={`filter-pill ${viewBlock===i?'active':''}`} onClick={()=>setViewBlock(i)} style={{padding:'5px 10px',fontSize:'0.72rem',minHeight:32}}>{i*50+1}–{(i+1)*50}</button>)}
          </div></div>

          <div className="reward-track">{blockRewards.map(rw=>{
            const ul=levelInfo.level>=rw.level,rd=rw.type==='redeemable',isAnimal=rw.type==='animal',rmd=bpState.redeemedRewards.includes(rw.level),cur=!ul&&rw===ALL_REWARDS.find(r=>r.level>levelInfo.level);
            return(<div key={`${rw.level}-${rw.type}`} className={`reward-card ${ul?'unlocked':'locked'} ${cur?'current':''} ${isAnimal?'animal-reward':''}`}>
              <div className="reward-level-badge">Lv.{rw.level}</div>
              <div className="reward-icon">{rw.icon}</div>
              <div style={{flex:1,minWidth:0}}><div className="reward-title">{rw.title}</div><div className="reward-desc">{rw.categoryLabel?`${rw.categoryLabel}: `:''}{rw.reward}</div></div>
              {ul&&rd&&!rmd&&<button className="redeem-btn" onClick={()=>setShowRedeemConfirm(rw.level)}>{rw.redeemLabel}</button>}
              {rmd&&<div className="redeemed-badge">✅ Used</div>}
              {ul&&rw.type==='cosmetic'&&<div className="cosmetic-badge">🎨</div>}
              {ul&&isAnimal&&<div className="cosmetic-badge">🐾</div>}
              {!ul&&<div className="locked-badge">🔒</div>}
            </div>);
          })}</div>

          {bpState.plays.length>0&&<><h2 className="section-title">Recent Activity</h2>
            <div className="activity-list">{bpState.plays.slice().reverse().slice(0,8).map((p,i)=>(
              <div key={i} className="activity-item"><div className="activity-icon">🎲</div>
                <div className="activity-info"><div className="activity-name">{p.gameName}</div><div className="activity-date">{new Date(p.date).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</div></div>
                <div className="activity-xp">+{p.xpEarned} XP</div></div>))}</div></>}
          <div style={{height:24}}/>
        </div>
      </div>

      {showLogPlay&&<div className="drawn-paper-overlay" onClick={()=>{setShowLogPlay(false);setSearchQuery('');}}>
        <div className="log-play-modal" onClick={e=>e.stopPropagation()}>
          <h2>🎲 What did you play?</h2>
          <input className="import-input" type="text" placeholder="🔍 Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} autoFocus style={{width:'100%',marginTop:10}}/>
          <div className="log-play-list">{filtered.map(g=>(
            <div key={g.id} className="log-play-item" onClick={()=>handleLogPlay(g)}>
              {g.thumbnail?<img src={g.thumbnail} alt="" style={{width:32,height:32,borderRadius:8,objectFit:'cover'}}/>:<div style={{width:32,height:32,borderRadius:8,background:'var(--blush)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.9rem'}}>🎲</div>}
              <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:'0.85rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{g.name}</div>
                <div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{g.playingTime?`${g.playingTime}min → ${Math.max(2,Math.round((g.playingTime/60)*10))} XP`:''}</div></div>
              <div style={{color:'var(--deep-rose)',fontWeight:700,fontSize:'0.75rem',flexShrink:0}}>+XP</div>
            </div>))}
            {!filtered.length&&<div style={{padding:20,textAlign:'center',color:'var(--text-muted)',fontSize:'0.85rem'}}>{games.length===0?'Import games first!':'No matches'}</div>}
          </div>
          <button className="btn-secondary" onClick={()=>{setShowLogPlay(false);setSearchQuery('');}} style={{width:'100%',marginTop:10}}>Cancel</button>
        </div>
      </div>}

      {showSettings&&<><div className="filter-drawer-overlay" onClick={()=>{setShowSettings(false);setSettingsCategory(null);}}/><div className="filter-drawer" style={{maxHeight:'85vh'}}><div className="drawer-handle"/>
        {!settingsCategory?<>
          <h3>⚙️ Cosmetics</h3><p style={{textAlign:'center',fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:12,fontWeight:500}}>Equip unlocked cosmetics to customize!</p>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {Object.entries(COSMETIC_CATEGORIES).map(([k,cat])=>{const all=getAllCosmeticsForCategory(k),uc=all.filter(c=>c.level<=levelInfo.level).length;const ei=equipped[k]?all.find(c=>c.cosmeticId===equipped[k]):null;
              return(<button key={k} onClick={()=>setSettingsCategory(k)} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:equipped[k]?'var(--blush-soft)':'white',border:`2px solid ${equipped[k]?'var(--rose)':'var(--blush)'}`,borderRadius:14,cursor:'pointer',textAlign:'left',fontFamily:'Quicksand'}}>
                <span style={{fontSize:'1.4rem'}}>{cat.icon}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.85rem',color:'var(--text-dark)'}}>{cat.label}</div><div style={{fontSize:'0.7rem',color:'var(--text-muted)'}}>{ei?`${ei.icon} ${ei.title}`:'None'} · {uc}/{all.length} unlocked</div></div><span style={{color:'var(--text-muted)',fontSize:'1rem'}}>›</span>
              </button>);})}
          </div><button className="btn-primary" onClick={()=>{setShowSettings(false);setSettingsCategory(null);}} style={{width:'100%',marginTop:12}}>Done</button>
        </>:<>
          <button onClick={()=>setSettingsCategory(null)} style={{background:'none',border:'none',color:'var(--deep-rose)',fontFamily:'Quicksand',fontWeight:700,fontSize:'0.85rem',cursor:'pointer',marginBottom:4}}>← Back</button>
          <h3>{COSMETIC_CATEGORIES[settingsCategory].icon} {COSMETIC_CATEGORIES[settingsCategory].label}</h3>
          <button onClick={()=>handleUnequip(settingsCategory)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',width:'100%',background:!equipped[settingsCategory]?'var(--blush-soft)':'white',border:`2px solid ${!equipped[settingsCategory]?'var(--deep-rose)':'var(--blush)'}`,borderRadius:14,cursor:'pointer',marginBottom:6,fontFamily:'Quicksand',textAlign:'left'}}>
            <span style={{fontSize:'1.3rem',width:32,textAlign:'center'}}>✖️</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.82rem'}}>Default</div><div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>No customization</div></div>
            {!equipped[settingsCategory]&&<span style={{fontSize:'0.7rem',fontWeight:800,color:'var(--deep-rose)'}}>EQUIPPED</span>}
          </button>
          <div style={{display:'flex',flexDirection:'column',gap:4}}>
            {getAllCosmeticsForCategory(settingsCategory).map(item=>{const ul=levelInfo.level>=item.level,eq=equipped[settingsCategory]===item.cosmeticId;
              return(<button key={item.cosmeticId} onClick={()=>ul&&handleEquip(settingsCategory,item.cosmeticId)} disabled={!ul}
                style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',width:'100%',background:eq?'var(--blush-soft)':ul?'white':'#F8F4F4',border:`2px solid ${eq?'var(--deep-rose)':ul?'var(--blush)':'#E8E0E0'}`,borderRadius:14,cursor:ul?'pointer':'not-allowed',fontFamily:'Quicksand',textAlign:'left',opacity:ul?1:0.55}}>
                <span style={{fontSize:'1.3rem',width:32,textAlign:'center'}}>{ul?item.icon:'🔒'}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.82rem',color:ul?'var(--text-dark)':'var(--text-muted)'}}>{item.title}</div><div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{ul?item.reward:`Unlocks at Level ${item.level}`}</div></div>
                {eq&&<span style={{fontSize:'0.7rem',fontWeight:800,color:'var(--deep-rose)'}}>EQUIPPED</span>}
                {!ul&&<span style={{fontSize:'0.65rem',fontWeight:700,color:'var(--text-muted)'}}>Lv.{item.level}</span>}
              </button>);})}
          </div><button className="btn-primary" onClick={()=>setSettingsCategory(null)} style={{width:'100%',marginTop:12}}>Done</button>
        </>}
      </div></>}

      {xpPopup&&<div className="xp-popup"><div className="xp-popup-header"><span className="xp-popup-game">{xpPopup.gameName}</span><span className="xp-popup-total">+{xpPopup.total} XP</span></div>
        <div className="xp-popup-bonuses">{xpPopup.bonuses.map((b,i)=><div key={i} className="xp-bonus-line"><span>{b.label}</span><span>+{b.xp}</span></div>)}</div></div>}

      {levelUpAnim&&<div className="level-up-overlay"><div className="level-up-content"><div className="level-up-stars">✨ 🌟 ⭐ 🌟 ✨</div><h1>Level Up!</h1><div className="level-up-number">Level {levelInfo.level}</div><div className="level-up-title">{currentTitle}</div></div></div>}

      {showRedeemConfirm!==null&&<div className="drawn-paper-overlay" onClick={()=>setShowRedeemConfirm(null)}>
        <div className="drawn-paper" onClick={e=>e.stopPropagation()} style={{maxWidth:280}}>
          {(()=>{const rw=ALL_REWARDS.find(r=>r.level===showRedeemConfirm&&r.type==='redeemable');return rw?<>
            <div style={{fontSize:'3rem',marginBottom:8}}>{rw.icon}</div><h2 style={{fontSize:'1.5rem'}}>Redeem Reward?</h2>
            <p style={{color:'var(--text-muted)',fontSize:'0.9rem',margin:'8px 0 16px',fontWeight:600}}>{rw.reward}</p>
            <p style={{color:'var(--text-muted)',fontSize:'0.75rem',marginBottom:16}}>Show this to your husband! 💕</p>
            <button className="btn-primary" onClick={()=>handleRedeem(showRedeemConfirm)} style={{width:'100%',marginBottom:8}}>Redeem! 🎉</button>
            <button className="btn-secondary" onClick={()=>setShowRedeemConfirm(null)} style={{width:'100%'}}>Save for Later</button>
          </>:null;})()}
        </div>
      </div>}

      <BottomNav navBg={cosmetics?.navBg} navBorder={cosmetics?.navBorder}/>
    </>
  );
}
