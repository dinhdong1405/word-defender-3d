import React from 'react';
import { Coins } from 'lucide-react';

interface CoinBadgeProps {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: () => void;
  title?: string;
  style?: React.CSSProperties;
}

export const CoinBadge: React.FC<CoinBadgeProps> = ({
  amount,
  size = 'md',
  showLabel = false,
  onClick,
  title,
  style,
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div
      className="coin-badge"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        gap: isSm ? '4px' : '6px',
        backgroundColor: '#FFF9E6',
        border: 'var(--border-ink)',
        borderRadius: 'var(--radius-full)',
        padding: isSm ? '3px 8px' : isLg ? '8px 16px' : '4px 12px',
        boxShadow: isSm ? 'var(--shadow-sticker-sm)' : 'var(--shadow-sticker)',
        fontWeight: 800,
        fontFamily: 'var(--font-display)',
        color: 'var(--color-ink)',
        fontSize: isSm ? '0.85rem' : isLg ? '1.25rem' : '1rem',
      }}
    >
      <div
        style={{
          width: isSm ? '16px' : isLg ? '24px' : '20px',
          height: isSm ? '16px' : isLg ? '24px' : '20px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-accent-yellow)',
          border: '1.5px solid var(--color-ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Coins size={isSm ? 10 : isLg ? 14 : 12} color="var(--color-ink)" />
      </div>
      <span>{amount.toLocaleString()}</span>
      {showLabel && <span style={{ fontSize: '0.8em', opacity: 0.8 }}>xu</span>}
    </div>
  );
};
