'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FloatingHearts from '@/components/FloatingHearts';
import { useCosmetics } from '@/lib/cosmeticEngine';

const fingerEmojis = ['🩷','💜','💙','🩵','💚','💛','🧡','❤️'];

export default function FirstPlayerPage() {
  const router = useRouter();
  const { cosmetics } = useCosmetics();
  const [fingers,setFingers]=useState({});
  const [phase,setPhase]=useState('waiting');
  const [countdown,setCountdown]=useState(3);
  const [winnerId,setWinnerId]=useState(null);
  const ct=useRef(null),st=useRef(null),cc=useRef(0);

  const clear=useCallback(()=>{if(ct.current){clearInterval(ct.current);ct.current=null;}if(st.current){clearTimeout(st.current);st.current=null;}},[]);

  const startStab=useCallback((n)=>{
    if(st.current)clearTimeout(st.current);
    if(n<2){setPhase('waiting');setCountdown(3);clear();return;}
    st.current=setTimeout(()=>{setPhase('countdown');setCountdown(3);let c=3;
      ct.current=setInterval(()=>{c--;setCountdown(c);if(c<=0){clearInterval(ct.current);ct.current=null;setPhase('picking');}},1000);
    },3000);
  },[clear]);

  useEffect(()=>{if(phase==='picking')setFingers(p=>{const ids=Object.keys(p);if(!ids.length)return p;setWinnerId(ids[Math.floor(Math.random()*ids.length)]);setPhase('done');return p;});},[phase]);

  const onStart=useCallback(e=>{e.preventDefault();
    if(phase==='done'){setPhase('waiting');setWinnerId(null);setFingers({});setCountdown(3);cc.current=0;clear();return;}
    const nf={};for(const t of e.changedTouches)nf[t.identifier]={x:t.clientX,y:t.clientY,ci:cc.current++%fingerEmojis.length};
    setFingers(p=>{const u={...p,...nf};if(phase==='countdown'){clear();setPhase('waiting');setCountdown(3);}startStab(Object.keys(u).length);return u;});
  },[phase,clear,startStab]);

  const onMove=useCallback(e=>{e.preventDefault();if(phase==='done')return;
    setFingers(p=>{const u={...p};for(const t of e.changedTouches)if(u[t.identifier])u[t.identifier]={...u[t.identifier],x:t.clientX,y:t.clientY};return u;});
  },[phase]);

  const onEnd=useCallback(e=>{e.preventDefault();if(phase==='done')return;
    setFingers(p=>{const u={...p};for(const t of e.changedTouches)delete u[t.identifier];
      if(phase==='countdown'){clear();setPhase('waiting');setCountdown(3);}startStab(Object.keys(u).length);return u;});
  },[phase,clear,startStab]);

  useEffect(()=>()=>clear(),[clear]);

  const fc=Object.keys(fingers).length;
  const inst=phase==='done'?'Tap anywhere to play again!':phase==='countdown'?'Hold still...':fc===0?'Everyone place a finger on the screen!':fc===1?'Need at least 2 fingers!':`${fc} players ready! Hold still...`;

  return (
    <div style={{position:'fixed',inset:0,zIndex:300,background:`linear-gradient(180deg,${cosmetics?.bgFrom||'#FFF8F0'},${cosmetics?.bgTo||'#FFE4E1'})`}}>
      <FloatingHearts color={cosmetics?.heartColor}/>
      <div className="touch-arena" onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd} onTouchCancel={onEnd}>
        <div className="instruction">{inst}</div>
        {phase==='countdown'&&<div className="countdown" key={countdown}>{countdown}</div>}
        {Object.entries(fingers).map(([id,f])=>{const w=phase==='done'&&id===winnerId,l=phase==='done'&&id!==winnerId;
          return <div key={id} className={`finger-dot ${w?'winner':l?'loser':'waiting'}`} style={{left:f.x,top:f.y}}>{w?'👑':fingerEmojis[f.ci]}</div>;})}
      </div>
      <button className="touch-back-btn" onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();router.push('/');}} onTouchEnd={e=>{e.stopPropagation();e.preventDefault();router.push('/');}}>← Back to Jar</button>
    </div>
  );
}
