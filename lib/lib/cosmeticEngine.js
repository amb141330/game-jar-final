'use client';
import { useState, useEffect } from 'react';
import { getEquippedCosmetics, resolveCosmetic, getLevelFromXP, getBattlePassState } from './battlePass';

const DEFAULT_PAPER_COLORS = ['#FDF6EC','#FDEEF0','#F0E6F6','#E8F5ED','#FFF9E6'];
const DEFAULT_SPARKLES = ['✨','💫','⭐','✨','💖','✨'];

export function useCosmetics() {
  const [cosmetics, setCosmetics] = useState(null);
  const [key, setKey] = useState(0);
  const refresh = () => setKey(k => k + 1);

  useEffect(() => {
    const eq = getEquippedCosmetics();
    const bp = getBattlePassState();
    const level = getLevelFromXP(bp.totalXP).level;
    const jar = resolveCosmetic('jarTheme', eq.jarTheme);
    const lid = resolveCosmetic('lidTheme', eq.lidTheme);
    const paper = resolveCosmetic('paperTheme', eq.paperTheme);
    const spark = resolveCosmetic('sparkleStyle', eq.sparkleStyle);
    const bg = resolveCosmetic('bgTheme', eq.bgTheme);
    const heart = resolveCosmetic('heartColor', eq.heartColor);
    const decor = resolveCosmetic('jarDecor', eq.jarDecor);
    const nav = resolveCosmetic('navStyle', eq.navStyle);

    setCosmetics({
      jarTint: jar?.css?.jarTint || null, jarEdge: jar?.css?.jarEdge || null,
      lidFrom: lid?.css?.lidFrom || null, lidTo: lid?.css?.lidTo || null,
      paperColors: paper?.colors || DEFAULT_PAPER_COLORS,
      sparkleEmojis: spark?.emojis || DEFAULT_SPARKLES,
      bgFrom: bg?.css?.bgFrom || null, bgTo: bg?.css?.bgTo || null,
      heartColor: heart?.color || null,
      jarDecor: decor?.decor || null,
      navBg: nav?.css?.navBg || null, navBorder: nav?.css?.navBorder || null,
      animalAccessories: eq.animalAccessories || {},
      level,
    });
  }, [key]);

  return { cosmetics, refresh };
}
