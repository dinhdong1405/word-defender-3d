import React from 'react';

interface PaperPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  foldedCorner?: boolean;
}

export const PaperPanel: React.FC<PaperPanelProps> = ({
  children,
  className = '',
  foldedCorner = false,
  ...props
}) => {
  return (
    <div className={`paper-panel ${className}`.trim()} {...props}>
      {foldedCorner && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 24px 24px 0',
            borderColor: 'transparent var(--color-grid) transparent transparent',
          }}
        />
      )}
      {children}
    </div>
  );
};
