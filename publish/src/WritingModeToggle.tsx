import React from 'react';
import type { WritingMode } from './types';

export interface WritingModeToggleProps {
  /** Current writing mode */
  current?: WritingMode;
  /** Callback when writing mode changes */
  onChange?: (mode: WritingMode) => void;
  /** Available modes to show (default: all three) */
  modes?: WritingMode[];
  /** Compact variant for inline use */
  variant?: 'full' | 'compact';
  /** Position for compact mode */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Label prefix for i18n */
  label?: string;
}

interface ModeOption {
  value: WritingMode;
  icon: string;
  label: string;
  description: string;
}

const ALL_MODES: ModeOption[] = [
  {
    value: 'horizontal-tb',
    icon: '⟺',
    label: 'Horizontal',
    description: '横書き (yokogaki) — left-to-right, top-to-bottom',
  },
  {
    value: 'vertical-rl',
    icon: '⟳',
    label: 'Vertical (R→L)',
    description: '縦書き (tategaki) — top-to-bottom, columns stack right-to-left',
  },
  {
    value: 'vertical-lr',
    icon: '⟲',
    label: 'Vertical (L→R)',
    description: '左横書き — top-to-bottom, columns stack left-to-right',
  },
];

/**
 * WritingModeToggle — a reader-facing control to switch between
 * horizontal (横書き) and vertical (縦書き) reading modes.
 *
 * Two variants:
 * - `full`: Horizontal button group with icons and labels
 * - `compact`: Floating icon button that cycles through modes
 *
 * Usage:
 * ```tsx
 * const [mode, setMode] = useState<WritingMode>('horizontal-tb');
 * <WritingModeToggle current={mode} onChange={setMode} />
 * <ContentDetail writingMode={mode} ... />
 * ```
 */
const WritingModeToggle: React.FC<WritingModeToggleProps> = ({
  current = 'horizontal-tb',
  onChange,
  modes = ['horizontal-tb', 'vertical-rl', 'vertical-lr'],
  variant = 'full',
  position = 'top-right',
  label = 'Reading Mode',
}) => {
  const available = ALL_MODES.filter((m) => modes.includes(m.value));
  if (available.length === 0) return null;

  // Full variant: button group
  if (variant === 'full') {
    return (
      <div className="flex flex-col gap-1" role="radiogroup" aria-label={label}>
        <span className="text-xs font-medium text-gray-500">{label}</span>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {available.map((mode) => {
            const isActive = current === mode.value;
            return (
              <button
                key={mode.value}
                role="radio"
                aria-checked={isActive}
                aria-label={mode.description}
                title={mode.description}
                onClick={() => onChange?.(mode.value)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-sm" aria-hidden>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact variant: floating icon button
  const cycleToNext = () => {
    if (!onChange) return;
    const currentIndex = available.findIndex((m) => m.value === current);
    const nextIndex = (currentIndex + 1) % available.length;
    onChange(available[nextIndex].value);
  };

  const currentMode = available.find((m) => m.value === current) || available[0];
  const positionClasses: Record<string, string> = {
    'top-left': 'left-4 top-4',
    'top-right': 'right-4 top-4',
    'bottom-left': 'left-4 bottom-4',
    'bottom-right': 'right-4 bottom-4',
  };

  return (
    <button
      onClick={cycleToNext}
      title={`Switch to next reading mode (currently ${currentMode.label})`}
      aria-label={`Current: ${currentMode.description}. Click to switch.`}
      className={`fixed z-40 flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm transition-all hover:bg-white hover:shadow-xl ${positionClasses[position]}`}
    >
      <span className="text-lg">{currentMode.icon}</span>
      <span className="text-xs font-medium text-gray-700">
        {currentMode.label}
      </span>
    </button>
  );
};

export default WritingModeToggle;
