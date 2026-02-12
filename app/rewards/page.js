'use client';

import { useState, useEffect, useCallback } from 'react';
import FloatingHearts from '@/components/FloatingHearts';
import BottomNav from '@/components/BottomNav';
import { getCollection } from '@/lib/gameStore';
import {
  getBattlePassState,
  getLevelFromXP,
  ALL_REWARDS,
  getRewardsForBlock,
  getBlockForLevel,
  logPlay,
  redeemReward,
  getNextReward,
  initializeFromCollection,
  getCurrentTitle,
  COSMETIC_CATEGORIES,
  getAllCosmeticsForCategory,
  getEquippedCosmetics,
  equipCosmetic,
  unequipCosmetic,
} from '@/lib/battlePass';

export default function RewardsPage() {
  const [bpState, setBpState] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [games, setGames] = useState([]);
  const [showLogPlay, setShowLogPlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [xpPopup, setXpPopup] = useState(null);
  const [showRedeemConfirm, setShowRedeemConfirm] = useState(null);
  const [levelUpAnim, setLevelUpAnim] = useState(false);
  const [viewBlock, setViewBlock] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsCategory, setSettingsCategory] = useState(null);
  const [equipped, setEquipped] = useState({});

  useEffect(() => {
    const collection = getCollection();
    setGames(collection);
    const state = collection.length > 0
      ? initializeFromCollection(collection)
      : getBattlePassState();
    setBpState(state);
    const info = getLevelFromXP(state.totalXP);
    setLevelInfo(info);
    setViewBlock(getBlockForLevel(Math.max(1, info.level)));
    setEquipped(getEquippedCosmetics());
  }, []);

  const handleLogPlay = useCallback((game) => {
    const { play, levelInfo: newLevel, state: newState } = logPlay(game, games);
    const oldLevel = levelInfo?.level || 0;
    setBpState(newState);
    setLevelInfo(newLevel);
    setShowLogPlay(false);
    setSearchQuery('');
    setXpPopup({ total: play.xpEarned, bonuses: play.bonuses, gameName: game.name });
    if (newLevel.level > oldLevel) {
      setTimeout(() => setLevelUpAnim(true), 1500);
      setTimeout(() => setLevelUpAnim(false), 4000);
    }
    setTimeout(() => setXpPopup(null), 3500);
  }, [games, levelInfo]);

  const handleRedeem = (level) => {
    setBpState(redeemReward(level));
    setShowRedeemConfirm(null);
  };

  const handleEquip = (category, cosmeticId) => {
    setEquipped(equipCosmetic(category, cosmeticId));
  };

  const handleUnequip = (category) => {
    setEquipped(unequipCosmetic(category));
  };

  if (!bpState || !levelInfo) {
    return (
      <>
        <FloatingHearts />
        <div className="main-content page-enter">
          <div className="loader" style={{ paddingTop: '40vh' }}>
            <div className="loader-hearts"><span>💕</span><span>💕</span><span>💕</span></div>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  const nextReward = getNextReward(levelInfo.level);
  const blockRewards = getRewardsForBlock(viewBlock);
  const blockStart = viewBlock * 50 + 1;
  const blockEnd = (viewBlock + 1) * 50;
  const currentTitle = getCurrentTitle(levelInfo.level);

  const filteredGames = searchQuery.trim()
    ? games.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : games;

  return (
    <>
      <FloatingHearts />
      <div className="main-content page-enter" style={{ overflow: 'auto' }}>
        <div className="rewards-container">

          {/* Header with settings */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
            <h1 style={{ fontFamily: 'Caveat, cursive', fontSize: '1.8rem', color: 'var(--berry)' }}>
              🏆 Rewards
            </h1>
            <button
              onClick={() => { setShowSettings(true); setSettingsCategory(null); }}
              style={{
                background: 'white', border: '2px solid var(--rose)', borderRadius: 14,
                padding: '6px 12px', fontFamily: 'Quicksand, sans-serif', fontWeight: 700,
                fontSize: '0.78rem', color: 'var(--deep-rose)', cursor: 'pointer',
              }}
            >
              ⚙️ Cosmetics
            </button>
          </div>

          {/* Level Card */}
          <div className="level-card">
            <div className="level-badge">
              <span className="level-number">{levelInfo.level}</span>
              <span className="level-label">LEVEL</span>
            </div>
            <div className="level-details">
              <div className="level-title">{currentTitle}</div>
              <div className="xp-bar-wrapper">
                <div className="xp-bar">
                  <div className="xp-bar-fill" style={{ width: `${levelInfo.progressPercent}%` }} />
                </div>
                <div className="xp-text">
                  {levelInfo.isMaxLevel ? 'MAX LEVEL!' : `${Math.floor(levelInfo.xpIntoCurrentLevel)} / ${levelInfo.xpNeededForNext} XP`}
                </div>
              </div>
              <div className="total-xp">✨ {levelInfo.totalXP.toLocaleString()} total XP</div>
            </div>
          </div>

          {/* Next reward teaser */}
          {nextReward && (
            <div className="next-reward-teaser">
              <span className="teaser-icon">{nextReward.icon}</span>
              <div className="teaser-text">
                <strong>Next: Level {nextReward.level} — {nextReward.title}</strong>
                <span>{nextReward.reward}</span>
              </div>
            </div>
          )}

          {/* Log a Play */}
          <button className="btn-primary log-play-btn" onClick={() => setShowLogPlay(true)}>
            🎲 Log a Play (+XP)
          </button>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number">{bpState.plays.filter(p => p.gameId !== 'seed').length}</div>
              <div className="stat-label">Plays</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {new Set(bpState.plays.filter(p => p.gameId !== 'seed').map(p => p.gameId)).size}
              </div>
              <div className="stat-label">Unique</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {ALL_REWARDS.filter(r => r.level <= levelInfo.level).length}
              </div>
              <div className="stat-label">Unlocked</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">500</div>
              <div className="stat-label">Max Lv</div>
            </div>
          </div>

          {/* Block Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              Levels {blockStart}–{blockEnd}
            </h2>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setViewBlock(Math.max(0, viewBlock - 1))}
                disabled={viewBlock === 0}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  border: '2px solid var(--rose)', background: 'white',
                  color: 'var(--deep-rose)', fontWeight: 800, fontSize: '1rem',
                  cursor: viewBlock === 0 ? 'not-allowed' : 'pointer',
                  opacity: viewBlock === 0 ? 0.4 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >‹</button>
              <button
                onClick={() => setViewBlock(Math.min(9, viewBlock + 1))}
                disabled={viewBlock === 9}
                style={{
                  width: 34, height: 34, borderRadius: 10,
                  border: '2px solid var(--rose)', background: 'white',
                  color: 'var(--deep-rose)', fontWeight: 800, fontSize: '1rem',
                  cursor: viewBlock === 9 ? 'not-allowed' : 'pointer',
                  opacity: viewBlock === 9 ? 0.4 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >›</button>
            </div>
          </div>

          {/* Block quick nav */}
          <div className="filter-scroll-wrapper" style={{ marginBottom: 10 }}>
            <div className="filter-bar" style={{ padding: '4px 20px' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <button key={i}
                  className={`filter-pill ${viewBlock === i ? 'active' : ''}`}
                  onClick={() => setViewBlock(i)}
                  style={{ padding: '5px 10px', fontSize: '0.72rem', minHeight: 32 }}
                >
                  {i * 50 + 1}–{(i + 1) * 50}
                </button>
              ))}
            </div>
          </div>

          {/* Reward Track for current block */}
          <div className="reward-track">
            {blockRewards.map((reward) => {
              const unlocked = levelInfo.level >= reward.level;
              const isRedeemable = reward.type === 'redeemable';
              const isRedeemed = bpState.redeemedRewards.includes(reward.level);
              const isCurrent = !unlocked && reward === ALL_REWARDS.find(r => r.level > levelInfo.level);

              return (
                <div key={`${reward.level}-${reward.type}`}
                  className={`reward-card ${unlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}>
                  <div className="reward-level-badge">Lv.{reward.level}</div>
                  <div className="reward-icon">{reward.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="reward-title">{reward.title}</div>
                    <div className="reward-desc">
                      {reward.categoryLabel ? `${reward.categoryLabel}: ` : ''}{reward.reward}
                    </div>
                  </div>
                  {unlocked && isRedeemable && !isRedeemed && (
                    <button className="redeem-btn" onClick={() => setShowRedeemConfirm(reward.level)}>
                      {reward.redeemLabel}
                    </button>
                  )}
                  {isRedeemed && <div className="redeemed-badge">✅ Used</div>}
                  {unlocked && reward.type === 'cosmetic' && (
                    <div className="cosmetic-badge">🎨</div>
                  )}
                  {!unlocked && <div className="locked-badge">🔒</div>}
                </div>
              );
            })}
          </div>

          {/* Recent Activity */}
          {bpState.plays.length > 0 && (
            <>
              <h2 className="section-title">Recent Activity</h2>
              <div className="activity-list">
                {bpState.plays.slice().reverse().slice(0, 8).map((play, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-icon">🎲</div>
                    <div className="activity-info">
                      <div className="activity-name">{play.gameName}</div>
                      <div className="activity-date">
                        {new Date(play.date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="activity-xp">+{play.xpEarned} XP</div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ height: 24 }} />
        </div>
      </div>

      {/* ── Log Play Modal ── */}
      {showLogPlay && (
        <div className="drawn-paper-overlay" onClick={() => { setShowLogPlay(false); setSearchQuery(''); }}>
          <div className="log-play-modal" onClick={e => e.stopPropagation()}>
            <h2>🎲 What did you play?</h2>
            <input className="import-input" type="text" placeholder="🔍 Search your games..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
              style={{ width: '100%', marginTop: 10 }} />
            <div className="log-play-list">
              {filteredGames.map(game => (
                <div key={game.id} className="log-play-item" onClick={() => handleLogPlay(game)}>
                  {game.thumbnail ? (
                    <img src={game.thumbnail} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blush)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🎲</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {game.name}
                    </div>
                  </div>
                  <div style={{ color: 'var(--deep-rose)', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>
                    +XP
                  </div>
                </div>
              ))}
              {filteredGames.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {games.length === 0 ? 'Import games first!' : 'No matches'}
                </div>
              )}
            </div>
            <button className="btn-secondary" onClick={() => { setShowLogPlay(false); setSearchQuery(''); }}
              style={{ width: '100%', marginTop: 10 }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Cosmetics Settings Drawer ── */}
      {showSettings && (
        <>
          <div className="filter-drawer-overlay" onClick={() => { setShowSettings(false); setSettingsCategory(null); }} />
          <div className="filter-drawer" style={{ maxHeight: '85vh' }}>
            <div className="drawer-handle" />
            {!settingsCategory ? (
              <>
                <h3>⚙️ Cosmetics</h3>
                <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500 }}>
                  Equip unlocked cosmetics to customize your app!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(COSMETIC_CATEGORIES).map(([key, cat]) => {
                    const allInCat = getAllCosmeticsForCategory(key);
                    const unlockedCount = allInCat.filter(c => c.level <= levelInfo.level).length;
                    const equippedItem = equipped[key]
                      ? allInCat.find(c => c.cosmeticId === equipped[key])
                      : null;
                    return (
                      <button key={key}
                        onClick={() => setSettingsCategory(key)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '12px 14px', background: equipped[key] ? 'var(--blush-soft)' : 'white',
                          border: `2px solid ${equipped[key] ? 'var(--rose)' : 'var(--blush)'}`,
                          borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'Quicksand, sans-serif',
                        }}
                      >
                        <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{cat.label}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {equippedItem ? `${equippedItem.icon} ${equippedItem.title}` : 'None equipped'}
                            {' · '}{unlockedCount}/{allInCat.length} unlocked
                          </div>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>›</span>
                      </button>
                    );
                  })}
                </div>
                <button className="btn-primary" onClick={() => { setShowSettings(false); setSettingsCategory(null); }}
                  style={{ width: '100%', marginTop: 12 }}>Done</button>
              </>
            ) : (
              <>
                <button onClick={() => setSettingsCategory(null)}
                  style={{
                    background: 'none', border: 'none', color: 'var(--deep-rose)',
                    fontFamily: 'Quicksand, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                    cursor: 'pointer', marginBottom: 4,
                  }}>← Back</button>
                <h3>{COSMETIC_CATEGORIES[settingsCategory].icon} {COSMETIC_CATEGORIES[settingsCategory].label}</h3>

                {/* Default / None option */}
                <button
                  onClick={() => handleUnequip(settingsCategory)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', width: '100%',
                    background: !equipped[settingsCategory] ? 'var(--blush-soft)' : 'white',
                    border: `2px solid ${!equipped[settingsCategory] ? 'var(--deep-rose)' : 'var(--blush)'}`,
                    borderRadius: 14, cursor: 'pointer', marginBottom: 6,
                    fontFamily: 'Quicksand, sans-serif', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '1.3rem', width: 32, textAlign: 'center' }}>✖️</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>Default</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>No customization</div>
                  </div>
                  {!equipped[settingsCategory] && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--deep-rose)' }}>EQUIPPED</span>
                  )}
                </button>

                {/* Cosmetic items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {getAllCosmeticsForCategory(settingsCategory).map(item => {
                    const unlocked = levelInfo.level >= item.level;
                    const isEquipped = equipped[settingsCategory] === item.cosmeticId;
                    return (
                      <button key={item.cosmeticId}
                        onClick={() => unlocked && handleEquip(settingsCategory, item.cosmeticId)}
                        disabled={!unlocked}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', width: '100%',
                          background: isEquipped ? 'var(--blush-soft)' : unlocked ? 'white' : '#F8F4F4',
                          border: `2px solid ${isEquipped ? 'var(--deep-rose)' : unlocked ? 'var(--blush)' : '#E8E0E0'}`,
                          borderRadius: 14, cursor: unlocked ? 'pointer' : 'not-allowed',
                          fontFamily: 'Quicksand, sans-serif', textAlign: 'left',
                          opacity: unlocked ? 1 : 0.55,
                        }}
                      >
                        <span style={{ fontSize: '1.3rem', width: 32, textAlign: 'center' }}>
                          {unlocked ? item.icon : '🔒'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: unlocked ? 'var(--text-dark)' : 'var(--text-muted)' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {unlocked ? item.reward : `Unlocks at Level ${item.level}`}
                          </div>
                        </div>
                        {isEquipped && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--deep-rose)' }}>EQUIPPED</span>
                        )}
                        {!unlocked && (
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Lv.{item.level}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button className="btn-primary" onClick={() => setSettingsCategory(null)}
                  style={{ width: '100%', marginTop: 12 }}>Done</button>
              </>
            )}
          </div>
        </>
      )}

      {/* ── XP Toast ── */}
      {xpPopup && (
        <div className="xp-popup">
          <div className="xp-popup-header">
            <span className="xp-popup-game">{xpPopup.gameName}</span>
            <span className="xp-popup-total">+{xpPopup.total} XP</span>
          </div>
          <div className="xp-popup-bonuses">
            {xpPopup.bonuses.map((b, i) => (
              <div key={i} className="xp-bonus-line">
                <span>{b.label}</span><span>+{b.xp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Level Up ── */}
      {levelUpAnim && (
        <div className="level-up-overlay">
          <div className="level-up-content">
            <div className="level-up-stars">✨ 🌟 ⭐ 🌟 ✨</div>
            <h1>Level Up!</h1>
            <div className="level-up-number">Level {levelInfo.level}</div>
            <div className="level-up-title">{currentTitle}</div>
          </div>
        </div>
      )}

      {/* ── Redeem Confirm ── */}
      {showRedeemConfirm !== null && (
        <div className="drawn-paper-overlay" onClick={() => setShowRedeemConfirm(null)}>
          <div className="drawn-paper" onClick={e => e.stopPropagation()} style={{ maxWidth: 280 }}>
            {(() => {
              const reward = ALL_REWARDS.find(r => r.level === showRedeemConfirm && r.type === 'redeemable');
              return reward ? (
                <>
                  <div style={{ fontSize: '3rem', marginBottom: 8 }}>{reward.icon}</div>
                  <h2 style={{ fontSize: '1.5rem' }}>Redeem Reward?</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '8px 0 16px', fontWeight: 600 }}>
                    {reward.reward}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 16 }}>
                    Show this to your husband to claim! 💕
                  </p>
                  <button className="btn-primary" onClick={() => handleRedeem(showRedeemConfirm)}
                    style={{ width: '100%', marginBottom: 8 }}>Redeem Now! 🎉</button>
                  <button className="btn-secondary" onClick={() => setShowRedeemConfirm(null)}
                    style={{ width: '100%' }}>Save for Later</button>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}

      <BottomNav />
    </>
  );
}
