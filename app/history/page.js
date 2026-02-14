'use client';
import { useState, useEffect } from 'react';
import FloatingHearts from '@/components/FloatingHearts';

import BottomNav from '@/components/BottomNav';
import { useCosmetics } from '@/lib/cosmeticEngine';
import { getBattlePassState, getLevelFromXP } from '@/lib/battlePass';
import { getDrawHistory, computeStats } from '@/lib/playHistory';

export default function HistoryPage() {
  const { cosmetics } = useCosmetics();
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const bp = getBattlePassState();
    const dh = getDrawHistory();
    const s = computeStats(bp.plays, dh);
    setStats(s);
  }, []);

  const bgStyle = cosmetics?.bgFrom ? { background: `linear-gradient(180deg, ${cosmetics.bgFrom}, ${cosmetics.bgTo})` } : {};

  if (!stats) return (
    <><FloatingHearts color={cosmetics?.heartColor}/>
      <div className="main-content page-enter" style={bgStyle}>
        <div className="history-container" style={{paddingTop:20,textAlign:'center'}}>
          <h1 style={{fontFamily:'Caveat,cursive',fontSize:'1.8rem',color:'var(--berry)'}}>📊 History</h1>
          <div style={{marginTop:40,color:'var(--text-muted)',fontSize:'0.9rem',fontWeight:600}}>
            <div style={{fontSize:'2.5rem',marginBottom:8}}>🎲</div>
            <p>No plays logged yet!</p>
            <p style={{fontSize:'0.8rem',marginTop:4}}>Draw a game from the jar and tap &quot;Let&apos;s Play&quot; to start tracking.</p>
          </div>
        </div>
      </div>
      <BottomNav navBg={cosmetics?.navBg} navBorder={cosmetics?.navBorder}/>
    </>
  );

  const maxMonth = Math.max(...stats.months.map(m => m.count), 1);

  return (
    <><FloatingHearts color={cosmetics?.heartColor}/>
      <div className="main-content page-enter" style={{overflow:'auto',...bgStyle}}>
        <div className="history-container">
          <h1 style={{fontFamily:'Caveat,cursive',fontSize:'1.8rem',color:'var(--berry)',paddingTop:6}}>📊 History</h1>

          {/* Tab bar */}
          <div className="filter-scroll-wrapper" style={{margin:'8px 0'}}><div className="filter-bar" style={{padding:'4px 8px'}}>
            {[['overview','Overview'],['timeline','Timeline'],['insights','Insights']].map(([k,l])=>
              <button key={k} className={`filter-pill ${tab===k?'active':''}`} onClick={()=>setTab(k)} style={{padding:'7px 16px',fontSize:'0.8rem'}}>{l}</button>
            )}
          </div></div>

          {/* ─── OVERVIEW TAB ─── */}
          {tab === 'overview' && <>
            {/* Quick stats */}
            <div className="stats-row">
              <div className="stat-card"><div className="stat-number">{stats.totalSessions}</div><div className="stat-label">Plays</div></div>
              <div className="stat-card"><div className="stat-number">{stats.uniqueGames}</div><div className="stat-label">Unique</div></div>
              <div className="stat-card"><div className="stat-number">{stats.currentActiveStreak}</div><div className="stat-label">Streak</div></div>
              <div className="stat-card"><div className="stat-number">{stats.longestStreak}</div><div className="stat-label">Best</div></div>
            </div>

            {/* Monthly chart */}
            <div className="history-card">
              <h3 className="card-title">📅 Monthly Activity</h3>
              <div className="month-chart">
                {stats.months.map((m, i) => (
                  <div key={i} className="month-bar-col">
                    <div className="month-bar-value">{m.count || ''}</div>
                    <div className="month-bar-track"><div className="month-bar-fill" style={{height:`${(m.count/maxMonth)*100}%`}}/></div>
                    <div className="month-bar-label">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day of week */}
            <div className="history-card">
              <h3 className="card-title">📆 Favorite Days</h3>
              <div className="dow-chart">
                {stats.dayNames.map((name, i) => {
                  const max = Math.max(...stats.dayOfWeekPlays, 1);
                  return (
                    <div key={i} className="dow-item">
                      <span className="dow-label">{name}</span>
                      <div className="dow-bar-track"><div className="dow-bar-fill" style={{width:`${(stats.dayOfWeekPlays[i]/max)*100}%`}}/></div>
                      <span className="dow-count">{stats.dayOfWeekPlays[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Most played */}
            <div className="history-card">
              <h3 className="card-title">🔥 Most Played</h3>
              {stats.mostPlayed.slice(0, 5).map((g, i) => (
                <div key={g.gameId} className="history-game-row">
                  <span className="history-rank">#{i + 1}</span>
                  <span className="history-game-name">{g.name}</span>
                  <span className="history-game-count">{g.count}×</span>
                </div>
              ))}
            </div>

            {/* Dusty games */}
            {stats.dusty.length > 0 && <div className="history-card">
              <h3 className="card-title">🕸 Needs Some Love</h3>
              <p style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:8,fontWeight:500}}>Games you haven&apos;t played in a while</p>
              {stats.dusty.map(g => (
                <div key={g.gameId} className="history-game-row">
                  <span className="history-game-name">{g.name}</span>
                  <span className="history-game-count" style={{color:'var(--text-muted)'}}>{g.daysSince}d ago</span>
                </div>
              ))}
            </div>}
          </>}

          {/* ─── TIMELINE TAB ─── */}
          {tab === 'timeline' && <>
            <div className="history-card">
              <h3 className="card-title">🕐 Recent Activity</h3>
              {stats.recent.map((p, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot"/>
                  <div className="timeline-content">
                    <div className="timeline-game">{p.gameName}</div>
                    <div className="timeline-meta">
                      {new Date(p.date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}
                      {p.xpEarned > 0 && <span className="timeline-xp">+{p.xpEarned} XP</span>}
                      {p.origin === 'bgg' && <span className="timeline-badge">BGG</span>}
                    </div>
                  </div>
                </div>
              ))}
              {stats.recent.length === 0 && <p style={{textAlign:'center',color:'var(--text-muted)',fontSize:'0.85rem',padding:16}}>No plays yet!</p>}
            </div>
          </>}

          {/* ─── INSIGHTS TAB ─── */}
          {tab === 'insights' && <>
            {/* Rejection patterns */}
            {stats.mostRejected.length > 0 && <div className="history-card">
              <h3 className="card-title">🙅 Most Skipped</h3>
              <p style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:8,fontWeight:500}}>Games you often pass on when drawn</p>
              {stats.mostRejected.map((g, i) => (
                <div key={g.gameId} className="history-game-row">
                  <span className="history-game-name">{g.name}</span>
                  <span className="history-game-count" style={{color:'var(--deep-rose)'}}>skipped {g.count}×</span>
                </div>
              ))}
            </div>}

            {/* Day patterns */}
            <div className="history-card">
              <h3 className="card-title">💡 Play Patterns</h3>
              <div className="insight-list">
                {(() => {
                  const insights = [];
                  // Best day
                  const bestDay = stats.dayOfWeekPlays.indexOf(Math.max(...stats.dayOfWeekPlays));
                  if (stats.dayOfWeekPlays[bestDay] > 0) {
                    insights.push(`You play the most on ${stats.dayNames[bestDay]}s`);
                  }
                  // Streaks
                  if (stats.longestStreak >= 3) insights.push(`Your best streak was ${stats.longestStreak} days in a row!`);
                  if (stats.currentActiveStreak >= 2) insights.push(`You're on a ${stats.currentActiveStreak}-day streak right now 🔥`);
                  // Variety
                  if (stats.uniqueGames >= 10) insights.push(`You've played ${stats.uniqueGames} different games — nice variety!`);
                  if (stats.totalSessions >= 50) insights.push(`${stats.totalSessions} total plays — you're a board game machine!`);
                  // Dusty insight
                  if (stats.dusty.length > 0) insights.push(`${stats.dusty[0].name} hasn't been played in ${stats.dusty[0].daysSince} days`);
                  if (!insights.length) insights.push('Keep playing to unlock more insights!');
                  return insights.map((ins, i) => <div key={i} className="insight-item">{ins}</div>);
                })()}
              </div>
            </div>

            {/* XP breakdown */}
            <div className="history-card">
              <h3 className="card-title">✨ XP Summary</h3>
              <div className="history-game-row">
                <span className="history-game-name">Total XP Earned</span>
                <span className="history-game-count" style={{color:'var(--deep-rose)'}}>{stats.totalXP.toLocaleString()}</span>
              </div>
              <div className="history-game-row">
                <span className="history-game-name">Avg XP per Play</span>
                <span className="history-game-count">{stats.totalSessions > 0 ? Math.round(stats.totalXP / stats.totalSessions) : 0}</span>
              </div>
            </div>
          </>}

          <div style={{height:24}}/>
        </div>
      </div>
      <BottomNav navBg={cosmetics?.navBg} navBorder={cosmetics?.navBorder}/>
    </>
  );
}
