import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useSquigglePath } from './hooks/useSquigglePath.js';
import type { WobblyBoxProps } from './types.js';

/**
 * children을 감싸고, 컨텐츠 크기에 맞게 wobbly border를 동적으로 렌더링하는 컴포넌트.
 *
 * ResizeObserver로 크기를 감지하므로, 텍스트가 늘어나도 border가 자동으로 따라옴.
 *
 * @example
 * <WobblyBox
 *   frequency={200}
 *   wiggle={16}
 *   smoothen={74}
 *   stroke="#1a1a1a"
 *   strokeWidth={2}
 *   borderRadius={8}
 * >
 *   <p>어떤 컨텐츠든 자동으로 맞춰짐</p>
 * </WobblyBox>
 */
export const WobblyBox: React.FC<WobblyBoxProps> = ({
  children,
  frequency = 200,
  wiggle = 16,
  smoothen = 74,
  strokeWidth = 2,
  stroke = '#1a1a1a',
  fill = 'none',
  seed = 42,
  borderRadius = 0,
  padding: paddingProp,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // children 크기 변화 감지
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 현재 크기 기반으로 base path 생성
  const basePath = useBoxPath(size.width, size.height, borderRadius);

  // wobbly path 계산
  const wobblyPath = useSquigglePath(basePath, {
    frequency,
    wiggle,
    smoothen,
    strokeWidth,
    seed,
  });

  const amplitude = Math.min(size.width, size.height) * (wiggle / 100) * 0.22;
  const svgPadding = paddingProp ?? Math.ceil(amplitude) + strokeWidth + 8;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
    >
      {/* Wobbly SVG overlay */}
      {size.width > 0 && wobblyPath && (
        <svg
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -svgPadding,
            left: -svgPadding,
            width: size.width + svgPadding * 2,
            height: size.height + svgPadding * 2,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
          viewBox={`${-svgPadding} ${-svgPadding} ${size.width + svgPadding * 2} ${size.height + svgPadding * 2}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d={wobblyPath}
            stroke={stroke}
            strokeWidth={strokeWidth}
            fill={fill}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* 실제 컨텐츠 */}
      {children}
    </div>
  );
};

/**
 * 주어진 크기와 borderRadius로 SVG path 문자열을 생성한다.
 * - borderRadius=0: 직각 사각형 (Z로 닫힘 → closed path → outward normal 적용)
 * - borderRadius>0: 둥근 사각형 (Q 커맨드 사용)
 */
function useBoxPath(width: number, height: number, borderRadius: number): string {
  return useCallback(() => {
    if (width === 0 || height === 0) return '';
    const r = Math.min(borderRadius, width / 2, height / 2);

    if (r <= 0) {
      return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
    }

    return [
      `M ${r} 0`,
      `L ${width - r} 0`,
      `Q ${width} 0 ${width} ${r}`,
      `L ${width} ${height - r}`,
      `Q ${width} ${height} ${width - r} ${height}`,
      `L ${r} ${height}`,
      `Q 0 ${height} 0 ${height - r}`,
      `L 0 ${r}`,
      `Q 0 0 ${r} 0`,
      'Z',
    ].join(' ');
  }, [width, height, borderRadius])();
}
