'use client';
import { useState, useEffect, useCallback } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
import AnimalParade from '@/components/AnimalParade';
import BottomNav from '@/components/BottomNav';
import { useCosmetics } from '@/lib/cosmeticEngine';
import { getBattlePassState, getLevelFromXP, ALL_REWARDS, getRewardsForBlock, getBlockForLevel, redeemReward, getNextReward, getCurrentTitle, getAllCosmeticsForCategory, getEquippedCosmetics, equipCosmetic, unequipCosmetic } from '@/lib/battlePass';

export default function RewardsPage() {
  const { cosmetics, refresh: refreshCosmetics } = useCosmetics();
  const [bpState,setBpState]=useState(null);
  const [levelInfo,setLevelInfo]=useState(null);
  const [showRedeemConfirm,setShowRedeemConfirm]=useState(null);
  const [viewBlock,setViewBlock]=useState(0);
  // Title badge only
  const [showTitlePicker,setShowTitlePicker]=useState(false);
  const [equipped,setEquipped]=useState({});

  useEffect(()=>{
    const state=getBattlePassState();setBpState(state);
    const info=getLevelFromXP(state.totalXP);setLevelInfo(info);
    setViewBlock(getBlockForLevel(Math.max(1,info.level)));
    setEquipped(getEquippedCosmetics());
  },[]);

  const handleRedeem=l=>{setBpState(redeemReward(l));setShowRedeemConfirm(null);};
  const handleEquipTitle=(id)=>{setEquipped(equipCosmetic('titleBadge',id));refreshCosmetics();};
  const handleUnequipTitle=()=>{setEquipped(unequipCosmetic('titleBadge'));refreshCosmetics();};

  if(!bpState||!levelInfo)return(<><FloatingHearts/><div className="main-content page-enter"><div className="loader" style={{paddingTop:'40vh'}}><div className="loader-hearts"><span>💕</span><span>💕</span><span>💕</span></div></div></div><BottomNav/></>);

  const nextReward=getNextReward(levelInfo.level);
  const blockRewards=getRewardsForBlock(viewBlock);
  const currentTitle=getCurrentTitle(levelInfo.level);
  const bgStyle=cosmetics?.bgFrom?{background:`linear-gradient(180deg,${cosmetics.bgFrom},${cosmetics.bgTo})`}:{};

  return (
    <>
      <FloatingHearts color={cosmetics?.heartColor}/>
      <AnimalParade/>
      <div className="main-content page-enter" style={{overflow:'auto',...bgStyle}}>
        <div className="rewards-container">
          <h1 style={{fontFamily:'Caveat,cursive',fontSize:'1.8rem',color:'var(--berry)',paddingTop:6}}>🏆 Rewards</h1>

          <div className="level-card">
            <div className="level-badge"><span className="level-number">{levelInfo.level}</span><span className="level-label">LEVEL</span></div>
            <div className="level-details">
              <button onClick={()=>setShowTitlePicker(true)} className="level-title" style={{background:'none',border:'none',cursor:'pointer',fontFamily:'Caveat,cursive',fontSize:'1.15rem',color:'var(--berry)',fontWeight:600,padding:0,textAlign:'left'}}>{currentTitle} ✎</button>
              <div className="xp-bar-wrapper"><div className="xp-bar"><div className="xp-bar-fill" style={{width:`${levelInfo.progressPercent}%`}}/></div>
                <div className="xp-text">{levelInfo.isMaxLevel?'MAX LEVEL!':`${Math.floor(levelInfo.xpIntoCurrentLevel)} / ${levelInfo.xpNeededForNext} XP`}</div></div>
              <div className="total-xp">✨ {levelInfo.totalXP.toLocaleString()} total XP</div>
            </div>
          </div>

          {nextReward&&<div className="next-reward-teaser"><span className="teaser-icon">{nextReward.icon}</span><div className="teaser-text"><strong>Next: Lv {nextReward.level} — {nextReward.title}</strong><span>{nextReward.reward}</span></div></div>}

          <div className="stats-row">
            <div className="stat-card"><div className="stat-number">{bpState.plays.length}</div><div className="stat-label">Plays</div></div>
            <div className="stat-card"><div className="stat-number">{new Set(bpState.plays.map(p=>p.gameId)).size}</div><div className="stat-label">Unique</div></div>
            <div className="stat-card"><div className="stat-number">{ALL_REWARDS.filter(r=>r.level<=levelInfo.level).length}</div><div className="stat-label">Unlocked</div></div>
            <div className="stat-card"><div className="stat-number">500</div><div className="stat-label">Max</div></div>
          </div>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
            <h2 className="section-title" style={{margin:0}}>Levels {viewBlock*50+1}–{(viewBlock+1)*50}</h2>
            <div style={{display:'flex',gap:4}}>
              <button onClick={()=>setViewBlock(Math.max(0,viewBlock-1))} disabled={viewBlock===0} className="block-nav-btn" style={{opacity:viewBlock===0?0.4:1}}>‹</button>
              <button onClick={()=>setViewBlock(Math.min(9,viewBlock+1))} disabled={viewBlock===9} className="block-nav-btn" style={{opacity:viewBlock===9?0.4:1}}>›</button>
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

          <div style={{height:24}}/>
        </div>
      </div>

      {/* Title badge picker */}
      {showTitlePicker&&<><div className="filter-drawer-overlay" onClick={()=>setShowTitlePicker(false)}/><div className="filter-drawer" style={{maxHeight:'70vh'}}><div className="drawer-handle"/>
        <h3>🏷 Title Badge</h3>
        <button onClick={handleUnequipTitle} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',width:'100%',background:!equipped.titleBadge?'var(--blush-soft)':'white',border:`2px solid ${!equipped.titleBadge?'var(--deep-rose)':'var(--blush)'}`,borderRadius:14,cursor:'pointer',marginBottom:6,fontFamily:'Quicksand',textAlign:'left'}}>
          <span style={{width:32,textAlign:'center'}}>🎖</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.82rem'}}>Auto (based on level)</div></div>
          {!equipped.titleBadge&&<span style={{fontSize:'0.7rem',fontWeight:800,color:'var(--deep-rose)'}}>ACTIVE</span>}
        </button>
        <div style={{display:'flex',flexDirection:'column',gap:4}}>
          {getAllCosmeticsForCategory('titleBadge').map(item=>{const ul=levelInfo.level>=item.level,eq=equipped.titleBadge===item.cosmeticId;
            return(<button key={item.cosmeticId} onClick={()=>ul&&handleEquipTitle(item.cosmeticId)} disabled={!ul}
              style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',width:'100%',background:eq?'var(--blush-soft)':ul?'white':'#F8F4F4',border:`2px solid ${eq?'var(--deep-rose)':ul?'var(--blush)':'#E8E0E0'}`,borderRadius:14,cursor:ul?'pointer':'not-allowed',fontFamily:'Quicksand',textAlign:'left',opacity:ul?1:0.55}}>
              <span style={{fontSize:'1.3rem',width:32,textAlign:'center'}}>{ul?item.icon:'🔒'}</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'0.82rem'}}>{item.title}</div><div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{ul?'':`Lv.${item.level}`}</div></div>
              {eq&&<span style={{fontSize:'0.7rem',fontWeight:800,color:'var(--deep-rose)'}}>EQUIPPED</span>}
            </button>);})}
        </div>
        <button className="btn-primary" onClick={()=>setShowTitlePicker(false)} style={{width:'100%',marginTop:12}}>Done</button>
      </div></>}

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
