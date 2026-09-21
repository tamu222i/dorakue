/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Character } from '../../domain/models/types.ts';

interface PixelSpriteProps {
  character: Character;
  size?: number; // pixel size on screen (e.g. 64, 96, 128)
  isAttacking?: boolean;
  isHit?: boolean;
  isCollapsed?: boolean;
  isSilhouette?: boolean; // When hidden / not encountered yet
  className?: string;
}

export const PixelSprite: React.FC<PixelSpriteProps> = ({
  character,
  size = 64,
  isAttacking = false,
  isHit = false,
  isCollapsed = false,
  isSilhouette = false,
  className = ''
}) => {
  const { spriteConfig, role, name, catalogNo } = character;

  // Generate 32x32 high-definition retro pixel matrix (2x resolution of 16x16)
  const pixelMatrix = useMemo(() => {
    // 32 rows x 32 columns
    const grid: (string | null)[][] = Array.from({ length: 32 }, () => Array(32).fill(null));

    if (isSilhouette) {
      // Draw silhouette using dark tone with a subtle edge glow
      // We will render character shape then turn all non-null into #1e293b / #0f172a
    }

    const hair = spriteConfig.hairColor || '#1e293b';
    const skin = spriteConfig.skinColor || '#fed7aa';
    const eye = spriteConfig.eyeColor || '#0f172a';
    const haori = spriteConfig.haoriColor || '#059669';
    const accent = spriteConfig.accentColor || '#ffffff';
    const darkSuit = '#18181b';
    const white = '#ffffff';

    // Character identity flags
    const isNezuko = name.includes('禰豆子');
    const isTanjiro = name.includes('炭治郎');
    const isZenitsu = name.includes('善逸');
    const isInosuke = name.includes('伊之助') || spriteConfig.hasMask === 'boar';
    const isRengoku = name.includes('煉獄');
    const isMuzan = name.includes('無惨');
    const isGiyu = name.includes('義勇');
    const isShinobu = name.includes('しのぶ');
    const isAkaza = name.includes('猗窩座');
    const isKokushibo = name.includes('黒死牟');
    const isDemon = role === 'demon';

    // Helper to fill rectangle in 32x32
    const fillRect = (r1: number, c1: number, r2: number, c2: number, color: string) => {
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          if (r >= 0 && r < 32 && c >= 0 && c < 32) {
            grid[r][c] = color;
          }
        }
      }
    };

    // 1. HEAD / HAIR / MASK (Rows 2 to 14)
    if (isInosuke) {
      // Inosuke: High-detail Wild Boar Head Mask
      fillRect(3, 8, 12, 23, '#78716c'); // Base fur
      fillRect(4, 9, 11, 22, '#a8a29e'); // Highlights
      // Dark fur edges
      fillRect(2, 10, 3, 21, '#57534e');
      // Boar snout (pink nose)
      fillRect(10, 14, 13, 17, '#f43f5e');
      fillRect(11, 15, 12, 16, '#fda4af');
      // Nostrils
      grid[12][14] = '#881337';
      grid[12][17] = '#881337';
      // Sharp tusks
      fillRect(11, 11, 14, 12, '#ffffff');
      fillRect(11, 19, 14, 20, '#ffffff');
      grid[15][11] = '#fef08a';
      grid[15][20] = '#fef08a';
      // Glowing deep blue boar eyes
      fillRect(8, 10, 10, 12, '#0284c7');
      fillRect(8, 19, 10, 21, '#0284c7');
      grid[9][11] = '#38bdf8';
      grid[9][20] = '#38bdf8';
      // Boar ears
      fillRect(2, 6, 5, 8, '#78716c');
      fillRect(3, 7, 4, 7, '#f472b6');
      fillRect(2, 23, 5, 25, '#78716c');
      fillRect(3, 24, 4, 24, '#f472b6');
    } else {
      // Standard / Pillars / Tanjiro / Muzan / Demons
      // Hair Base & Volume (Rows 2 to 7)
      fillRect(2, 8, 7, 23, hair);
      fillRect(1, 10, 2, 21, hair);

      // Hair Spikes / Curls / Flow
      if (isRengoku) {
        // Flame Hair spikes
        fillRect(0, 7, 4, 9, '#ef4444');
        fillRect(1, 13, 3, 18, '#f59e0b');
        fillRect(0, 22, 4, 24, '#ef4444');
        // Red tips on yellow hair
        grid[5][8] = '#dc2626';
        grid[6][23] = '#dc2626';
        grid[7][7] = '#dc2626';
        grid[7][24] = '#dc2626';
      } else if (isZenitsu) {
        // Blunt-cut yellow hair with orange gradient tips
        fillRect(2, 8, 7, 23, '#eab308');
        for (let c = 8; c <= 23; c++) {
          if (c % 2 === 0) grid[7][c] = '#f97316';
        }
      } else if (isShinobu) {
        // Shinobu: Black hair fading into purple ends + butterfly hair ornament
        fillRect(6, 7, 8, 8, '#a855f7');
        fillRect(6, 23, 8, 24, '#a855f7');
        // Butterfly hairpin
        fillRect(3, 21, 5, 24, '#38bdf8');
        grid[4][22] = '#a855f7';
        grid[4][23] = '#ffffff';
      } else if (isMuzan) {
        // Black fedora hat with white silk band
        fillRect(3, 6, 5, 25, '#09090b');
        fillRect(1, 9, 3, 22, '#09090b');
        fillRect(4, 7, 4, 24, '#f8fafc'); // White hat ribbon
      } else if (catalogNo % 2 === 0) {
        // Dynamic spiky hair
        grid[0][9] = hair;
        grid[0][15] = hair;
        grid[0][21] = hair;
      }

      // Demon Horns (if demon)
      if (spriteConfig.hasHorn) {
        fillRect(0, 9, 2, 10, '#f1f5f9');
        grid[0][9] = '#dc2626';
        fillRect(0, 21, 2, 22, '#f1f5f9');
        grid[0][22] = '#dc2626';
      }

      // Face (Rows 7 to 14, Cols 10 to 21)
      fillRect(7, 10, 13, 21, skin);
      // Jawline tapering
      grid[14][10] = null;
      grid[14][21] = null;
      fillRect(14, 11, 14, 20, skin);

      // EYES & EYEBROWS (Rows 9 to 11)
      if (isKokushibo) {
        // Kokushibo has 6 eyes!
        fillRect(8, 11, 9, 13, '#dc2626');
        fillRect(8, 18, 9, 20, '#dc2626');
        fillRect(10, 11, 11, 13, '#dc2626');
        fillRect(10, 18, 11, 20, '#dc2626');
        fillRect(12, 12, 13, 14, '#dc2626');
        fillRect(12, 17, 13, 19, '#dc2626');
      } else if (isMuzan) {
        // Muzan: Cat-like vertical slit crimson eyes
        fillRect(9, 12, 11, 13, '#dc2626');
        fillRect(9, 18, 11, 19, '#dc2626');
        grid[10][12] = '#450a0a';
        grid[10][19] = '#450a0a';
      } else {
        // High-definition eyes with highlights
        fillRect(9, 11, 11, 13, eye);
        fillRect(9, 18, 11, 20, eye);
        // Eye reflections / highlights
        grid[9][11] = '#ffffff';
        grid[9][18] = '#ffffff';

        // Eyebrows
        fillRect(8, 11, 8, 13, hair);
        fillRect(8, 18, 8, 20, hair);
      }

      // Demon markings or blue tattoos for Akaza
      if (isAkaza) {
        // Blue striped martial artist markings
        fillRect(7, 15, 13, 16, '#0284c7');
        grid[9][10] = '#0284c7';
        grid[9][21] = '#0284c7';
      }

      // Mouth
      if (isNezuko) {
        // Green Bamboo Muzzle with red cord
        fillRect(12, 12, 14, 19, '#15803d');
        fillRect(13, 13, 13, 18, '#4ade80');
        // Bamboo nodes
        grid[12][15] = '#14532d';
        grid[13][15] = '#14532d';
        // Red cords around cheeks
        grid[13][10] = '#dc2626';
        grid[13][11] = '#dc2626';
        grid[13][20] = '#dc2626';
        grid[13][21] = '#dc2626';
        // Pink ribbon in hair
        fillRect(4, 21, 6, 23, '#f43f5e');
      } else if (isTanjiro) {
        // Flame scar on forehead
        fillRect(7, 12, 8, 14, '#b91c1c');
        grid[8][13] = '#991b1b';
        // Hanafuda Earrings hanging on left & right
        fillRect(12, 8, 15, 9, '#f8fafc');
        grid[13][8] = '#dc2626';
        grid[14][9] = '#09090b';
      } else {
        // Neutral or determined mouth
        grid[13][15] = '#991b1b';
        grid[13][16] = '#991b1b';
      }
    }

    // 2. TORSO / DEMON SLAYER CORPS UNIFORM & HAORI (Rows 15 to 24)
    // Base uniform / body
    fillRect(15, 9, 24, 22, isDemon ? skin : darkSuit);

    // White button seam & belt
    if (!isDemon && !isInosuke) {
      for (let r = 15; r <= 20; r++) {
        if (r % 2 === 0) grid[r][15] = '#f8fafc'; // silver buttons
      }
      // White Corps Belt
      fillRect(21, 10, 22, 21, '#ffffff');
      grid[21][15] = '#eab308'; // Gold buckle
      grid[21][16] = '#eab308';
    }

    // HAORI (羽織) Left & Right Sleeves / Torso drape
    // Left Haori
    fillRect(15, 5, 23, 10, haori);
    // Right Haori
    fillRect(15, 21, 23, 26, haori);

    // Haori Patterns (2x Hi-Res rendering)
    if (spriteConfig.haoriPattern === 'checker_green' || isTanjiro) {
      // Tanjiro's Checkered Green & Black pattern (Ichimatsu)
      for (let r = 15; r <= 23; r++) {
        for (let c = 5; c <= 26; c++) {
          if (c <= 10 || c >= 21) {
            const isBlackCheck = (Math.floor(r / 2) + Math.floor(c / 2)) % 2 === 0;
            if (isBlackCheck) {
              grid[r][c] = '#09090b';
            } else {
              grid[r][c] = '#10b981';
            }
          }
        }
      }
    } else if (spriteConfig.haoriPattern === 'split_red_green' || isGiyu) {
      // Giyu's Split Haori (Right side plain rust-red, Left side green/yellow geometric)
      fillRect(15, 5, 23, 10, '#991b1b'); // Solid reddish rust
      for (let r = 15; r <= 23; r++) {
        for (let c = 21; c <= 26; c++) {
          grid[r][c] = (r + c) % 2 === 0 ? '#15803d' : '#eab308';
        }
      }
    } else if (spriteConfig.haoriPattern === 'triangle_yellow' || isZenitsu) {
      // Zenitsu's Triangle Scale Pattern
      fillRect(15, 5, 23, 10, '#f59e0b');
      fillRect(15, 21, 23, 26, '#f59e0b');
      for (let r = 15; r <= 23; r += 2) {
        grid[r][7] = '#ffffff';
        grid[r + 1][8] = '#ffffff';
        grid[r][23] = '#ffffff';
        grid[r + 1][24] = '#ffffff';
      }
    } else if (spriteConfig.haoriPattern === 'flame_edge' || isRengoku) {
      // Rengoku's Flame Cloak
      fillRect(15, 5, 21, 10, '#ffffff');
      fillRect(15, 21, 21, 26, '#ffffff');
      // Flame edges on the hem
      for (let c = 5; c <= 26; c++) {
        if (c <= 10 || c >= 21) {
          grid[22][c] = '#f59e0b';
          grid[23][c] = '#dc2626';
        }
      }
    } else if (spriteConfig.haoriPattern === 'butterfly_wing' || isShinobu) {
      // Shinobu's Butterfly Wing Haori
      fillRect(15, 5, 23, 10, '#ffffff');
      fillRect(15, 21, 23, 26, '#ffffff');
      for (let r = 21; r <= 23; r++) {
        grid[r][5] = '#c084fc';
        grid[r][6] = '#38bdf8';
        grid[r][9] = '#09090b';
        grid[r][22] = '#09090b';
        grid[r][25] = '#38bdf8';
        grid[r][26] = '#c084fc';
      }
    }

    // 3. LEGS & FOOTWEAR (Rows 24 to 30)
    fillRect(24, 11, 28, 14, isDemon ? skin : darkSuit);
    fillRect(24, 17, 28, 20, isDemon ? skin : darkSuit);

    // Kyahan (Leg wraps / 白脚絆)
    fillRect(27, 11, 29, 14, '#f8fafc');
    fillRect(27, 17, 29, 20, '#f8fafc');

    // Zori Sandals & Tabi (草履と足袋)
    fillRect(30, 10, 31, 14, '#fed7aa');
    fillRect(30, 17, 31, 21, '#fed7aa');
    grid[31][12] = '#dc2626'; // red sandal thong
    grid[31][19] = '#dc2626';

    // 4. NICHIRIN SWORD (日輪刀) (Right side, Rows 14 to 28)
    if (spriteConfig.hasSword) {
      // Hilt & Tsuba (鍔)
      fillRect(14, 27, 16, 28, '#09090b');
      grid[17][26] = accent; // Tsuba guard
      grid[17][27] = accent;
      grid[17][28] = accent;
      grid[17][29] = accent;
      // Blade / Scabbard
      for (let r = 18; r <= 27; r++) {
        grid[r][27] = '#0f172a'; // Black Nichirin blade / sheath
        grid[r][28] = '#cbd5e1'; // Metallic gleam
      }
      grid[28][27] = accent; // Scabbard tip
    }

    // If silhouette mode is requested, transform all colored pixels into mysterious dark shadow
    if (isSilhouette) {
      for (let r = 0; r < 32; r++) {
        for (let c = 0; c < 32; c++) {
          if (grid[r][c]) {
            grid[r][c] = '#1e293b'; // Slate dark silhouette
          }
        }
      }
      // Put a glowing question mark in the center of silhouette
      const qColor = '#f59e0b';
      fillRect(11, 14, 11, 17, qColor);
      grid[12][17] = qColor;
      fillRect(13, 15, 14, 16, qColor);
      grid[16][15] = qColor;
      grid[16][16] = qColor;
    }

    return grid;
  }, [character, spriteConfig, role, name, catalogNo, isSilhouette]);

  return (
    <div
      className={`relative inline-block transition-transform select-none ${className} ${
        isHit ? 'animate-bounce filter brightness-200' : ''
      } ${isAttacking ? 'scale-110 -translate-y-2' : ''} ${
        isCollapsed ? 'opacity-40 grayscale rotate-90 translate-y-4' : ''
      }`}
      style={{ width: size, height: size }}
      title={isSilhouette ? '？？？？？ (未遭遇)' : `${character.name} (No.${character.catalogNo})`}
    >
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        shapeRendering="crispEdges"
        className="w-full h-full pixel-art drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]"
        style={{ imageRendering: 'pixelated' }}
      >
        {pixelMatrix.map((row, r) =>
          row.map((color, c) => {
            if (!color) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width="1"
                height="1"
                fill={color}
              />
            );
          })
        )}
      </svg>
    </div>
  );
};
