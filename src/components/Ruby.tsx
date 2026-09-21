/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RubyProps {
  k: string; // 漢字 (Kanji)
  r: string; // ルビ / ふりがな (Furigana)
  className?: string;
}

/**
 * 6歳でも読めるルビ（ふりがな）コンポーネント
 */
export const Ruby: React.FC<RubyProps> = ({ k, r, className = '' }) => {
  return (
    <span className={`inline ${className}`}>
      <span className="text-inherit">{k}</span>
      <span className="text-[0.78em] font-normal text-amber-300/90 select-none">
        （{r}）
      </span>
    </span>
  );
};

interface FuriganaTextProps {
  text: string;
  className?: string;
  defaultRtColor?: string;
}

/**
 * "鬼[おに]殺[さつ]隊[たい]の仲間[なかま]" のようなブラケット付き文字列を
 * "鬼（おに）殺（さつ）隊（たい）の仲間（なかま）" のような文字の後ろに（かっこ）形式で描画するコンポーネント
 */
export const FuriganaText: React.FC<FuriganaTextProps> = ({
  text,
  className = '',
  defaultRtColor = 'text-amber-300/90'
}) => {
  // Regex to match Kanji[furigana] or Word[furigana]
  // Matches any non-bracket sequence followed by [furigana]
  const regex = /([^\[\]\s]+)\[([a-zA-Zぁ-んァ-ヶー・]+)\]/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const kanji = match[1];
    const furigana = match[2];
    const key = `furi-${match.index}-${kanji}`;

    elements.push(
      <span key={key} className="inline">
        <span className="text-inherit">{kanji}</span>
        <span className={`text-[0.78em] font-normal ${defaultRtColor} select-none`}>
          （{furigana}）
        </span>
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  // Push remaining plain text
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return <span className={`inline ${className}`}>{elements}</span>;
};
