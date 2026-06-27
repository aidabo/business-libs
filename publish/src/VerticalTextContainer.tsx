import React, { useRef, useEffect } from 'react';
import type { WritingMode } from './types';

export interface VerticalTextContainerProps {
  children: React.ReactNode;
  writingMode?: WritingMode;
  columnCount?: number;
  columnGap?: string;
  columnWidth?: string;
  columnHeight?: string;
  /** Line width in characters (行幅). Sets columnHeight in em, e.g. lineWidth={30} → 30em tall container (~30 chars per line) */
  lineWidth?: number;
  /** Letter spacing for 行間 (line spacing/leading) in vertical mode */
  letterSpacing?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Wraps content with vertical writing mode CSS and column (段組み) layout.
 *
 * - `vertical-rl`: top-to-bottom, columns stack right-to-left (standard Japanese)
 * - `horizontal-tb`: no-op pass-through
 *
 * Auto-detects form controls (input, textarea, select) and excludes them from
 * vertical transformation so text entry remains usable.
 */
const VerticalTextContainer: React.FC<VerticalTextContainerProps> = ({
  children,
  writingMode = 'horizontal-tb',
  columnCount = 2,
  columnGap = '2rem',
  columnWidth,
  columnHeight = '80vh',
  lineWidth,
  letterSpacing = '0.125em',
  className = '',
  style,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);

  // Exclude form controls from vertical transformation
  useEffect(() => {
    const root = rootRef.current;
    if (!root || writingMode === 'horizontal-tb') return;

    const formElements = root.querySelectorAll('input, textarea, select');
    formElements.forEach((el) => {
      (el as HTMLElement).style.writingMode = 'horizontal-tb';
    });
  }, [writingMode, children]);

  if (writingMode === 'horizontal-tb') {
    return <>{children}</>;
  }

  // lineWidth overrides columnHeight: converts character count to em height
  const resolvedHeight = lineWidth ? `${lineWidth}em` : columnHeight;

  const columnStyles: React.CSSProperties = {};
  if (columnWidth && columnWidth !== 'auto') {
    columnStyles.columnWidth = columnWidth;
  } else {
    columnStyles.columnCount = columnCount;
  }
  if (resolvedHeight) {
    columnStyles.height = resolvedHeight;
  }
  if (letterSpacing) {
    columnStyles.letterSpacing = letterSpacing;
  }

  return (
    <div
      ref={rootRef}
      className={`vertical-text vertical-columns ${className}`}
      style={{
        columnGap,
        ...columnStyles,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default VerticalTextContainer;
