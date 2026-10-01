import React from 'react';
import { useSquigglePath } from './hooks/useSquigglePath.js';
import type { WobblyShapeProps } from './types.js';

/**
 * 커스텀 SVG path에 Squiggle(hand-drawn wobbly) 효과를 적용하는 컴포넌트.
 *
 * @example
 * <WobblyShape
 *   d="M 0 50 C 100 0 200 100 300 50"
 *   frequency={200}
 *   wiggle={16}
 *   smoothen={74}
 *   stroke="#1a1a1a"
 *   strokeWidth={2}
 *   width={300}
 *   height={100}
 * />
 */
export const WobblyShape: React.FC<WobblyShapeProps> = ({
  d,
  frequency = 200,
  wiggle = 16,
  smoothen = 74,
  strokeWidth = 2,
  stroke = '#1a1a1a',
  fill = 'none',
  seed = 42,
  width,
  height,
  className,
  style,
}) => {
  const wobblyD = useSquigglePath(d, { frequency, wiggle, smoothen, strokeWidth, seed });

  // viewBox를 동적으로 계산 (overflow를 위해 padding 추가)
  const w = width ?? 400;
  const h = height ?? 200;
  const amplitude = Math.min(w, h) * (wiggle / 100) * 0.22;
  const padding = Math.ceil(amplitude) + strokeWidth + 8;
  const vbWidth = w + padding * 2;
  const vbHeight = h + padding * 2;

  return (
    <svg
      viewBox={`${-padding} ${-padding} ${vbWidth} ${vbHeight}`}
      width={width ?? '100%'}
      height={height ?? '100%'}
      className={className}
      style={{ overflow: 'visible', ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={wobblyD}
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
