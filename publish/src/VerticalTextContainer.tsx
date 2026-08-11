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
  /** CSS line-height; `1.8` is a comfortable Japanese reading default. */
  lineHeight?: string | number;
  /** Margin between block elements such as paragraphs and headings. */
  paragraphMargin?: string;
  /** Keep headings, figures, and quotes together when columns break. */
  keepBlocksTogether?: boolean;
  /** Japanese punctuation handling: mixed keeps Latin readable, upright is strict. */
  textOrientation?: 'mixed' | 'upright' | 'sideways';
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
  lineHeight = 1.8,
  paragraphMargin = '1em',
  keepBlocksTogether = true,
  textOrientation = 'mixed',
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
  columnStyles.lineHeight = lineHeight;
  columnStyles.textOrientation = textOrientation;
  (columnStyles as React.CSSProperties & Record<string, string | number>)[
    '--vertical-paragraph-margin'
  ] = paragraphMargin;
  (columnStyles as React.CSSProperties & Record<string, string | number>)[
    '--vertical-break-inside'
  ] = keepBlocksTogether ? 'avoid' : 'auto';

  return (
    <>
      <style>{`
        .vertical-text.vertical-columns .vertical-article-body > * {
          margin-block: var(--vertical-paragraph-margin);
          break-inside: var(--vertical-break-inside);
        }
        .vertical-text.vertical-columns .vertical-article-body h1,
        .vertical-text.vertical-columns .vertical-article-body h2,
        .vertical-text.vertical-columns .vertical-article-body h3,
        .vertical-text.vertical-columns .vertical-article-body figure,
        .vertical-text.vertical-columns .vertical-article-body blockquote,
        .vertical-text.vertical-columns .vertical-article-body img {
          break-before: auto;
          break-after: avoid;
        }
      `}</style>
      <div
        ref={rootRef}
        className={`vertical-text vertical-columns ${className}`}
        data-writing-mode={writingMode}
        style={{
          columnGap,
          ...columnStyles,
          ...style,
        }}
      >
        {children}
      </div>
    </>
  );
};

export default VerticalTextContainer;
