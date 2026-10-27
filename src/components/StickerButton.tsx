import React from 'react';

interface StickerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'accent' | 'mint' | 'blue' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const StickerButton: React.FC<StickerButtonProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  const variantClass = variant !== 'default' ? `sticker-btn-${variant}` : '';
  const sizeClass = size === 'sm' ? 'sticker-btn-sm' : size === 'lg' ? 'sticker-btn-lg' : '';

  return (
    <button
      className={`sticker-btn ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {icon && <span className="sticker-btn-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
