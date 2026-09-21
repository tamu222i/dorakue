/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface DqFrameProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gold' | 'danger';
  title?: string;
}

export const DqFrame: React.FC<DqFrameProps> = ({
  children,
  className = '',
  variant = 'default',
  title
}) => {
  const borderClass =
    variant === 'gold'
      ? 'border-[#eab308] shadow-[0_0_12px_rgba(234,179,8,0.3)]'
      : variant === 'danger'
      ? 'border-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.3)]'
      : 'border-white';

  return (
    <div
      className={`bg-[#050811]/95 border-4 rounded-md p-3 relative text-white dq-window ${borderClass} ${className}`}
    >
      {title && (
        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-[#050811] border-2 border-white rounded text-xs font-bold tracking-wider text-amber-300">
          {title}
        </div>
      )}
      {children}
    </div>
  );
};
