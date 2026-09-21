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
    <ruby className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className="text-inherit">{k}</span>
      <rt className="text-[0.62em] font-normal text-amber-300 select-none pb-0.5 tracking-tight scale-90 -translate-y-0.5">
        {r}
      </rt>
    </ruby>
  );
};

interface FuriganaTextProps {
  text: string;
  className?: string;
  defaultRtColor?: string;
}

/**
 * "鬼[おに]殺[さつ]隊[たい]の仲間[なかま]" のようなブラケット付き文字列を
 * 6歳向けふりがな付きHTMLにパースして描画するコンポーネント
 */
export const FuriganaText: React.FC<FuriganaTextProps> = ({
  text,
  className = '',
  defaultRtColor = 'text-amber-300'
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
      <ruby key={key} className="inline-flex flex-col items-center leading-none mx-[0.5px]">
        <span className="text-inherit">{kanji}</span>
        <rt className={`text-[0.62em] font-normal ${defaultRtColor} select-none pb-0.5 tracking-tighter scale-90 -translate-y-0.5`}>
          {furigana}
        </rt>
      </ruby>
    );

    lastIndex = regex.lastIndex;
  }

  // Push remaining plain text
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return <span className={`inline ${className}`}>{elements}</span>;
};
