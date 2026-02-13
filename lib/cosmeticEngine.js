'use client';

import { useState, useEffect } from 'react';
import { getEquippedCosmetics, resolveCosmetic, getLevelFromXP, getBattlePassState } from './battlePass';

const DEFAULT_PAPER_COLORS = ['#FDF6EC', '#FDEEF0', '#F0E6F6', '#E8F5ED', '#FFF9E6'];
const DEFAULT_SPARKLES = ['✨', '💫', '⭐', '✨', '💖', '✨'];

/**
 * Hook: reads equipped cosmetics and returns resolved visual data
 * Re-reads on mount and when `refreshKey` changes (call refresh() after equipping)
 */
export function useCosmetics() {
  const [cosmetics, setCosmetics] = useState(null);
  const [key, setKey] = useState(0);

  const refresh = () => setKey(k => k + 1);

  useEffect(() => {
    const eq = getEquippedCosmetics();
    const bp = getBattlePassState();
    const level = getLevelFromXP(bp.totalXP).level;

    // Resolve each category
    const jar = resolveCosmetic('jarTheme', eq.jarTheme);
    const lid = resolveCosmetic('lidTheme', eq.lidTheme);
    const paper = resolveCosmetic('paperTheme', eq.paperTheme);
    const spark = resolveCosmetic('sparkleStyle', eq.sparkleStyle);
    const bg = resolveCosmetic('bgTheme', eq.bgTheme);
    const heart = resolveCosmetic('heartColor', eq.heartColor);
    const meeple = resolveCosmetic('meepleAccessory', eq.meepleAccessory);
    const decor = resolveCosmetic('jarDecor', eq.jarDecor);
    const nav = resolveCosmetic('navStyle', eq.navStyle);

    setCosmetics({
      // Jar glass style
      jarTint: jar?.css?.jarTint || null,
      jarEdge: jar?.css?.jarEdge || null,

      // Lid color
      lidFrom: lid?.css?.lidFrom || null,
      lidTo: lid?.css?.lidTo || null,

      // Paper slip colors
      paperColors: paper?.colors || DEFAULT_PAPER_COLORS,

      // Sparkle emojis on draw
      sparkleEmojis: spark?.emojis || DEFAULT_SPARKLES,

      // Background gradient
      bgFrom: bg?.css?.bgFrom || null,
      bgTo: bg?.css?.bgTo || null,

      // Heart color
      heartColor: heart?.color || null,

      // Meeple accessory id
      meepleAccessory: meeple?.accessory || null,

      // Jar decoration id
      jarDecor: decor?.decor || null,

      // Nav style
      navBg: nav?.css?.navBg || null,
      navBorder: nav?.css?.navBorder || null,

      level,
    });
  }, [key]);

  return { cosmetics, refresh };
}
