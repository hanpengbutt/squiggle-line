import React, { useRef, useState, useEffect } from 'react';
import { useSquigglePath } from './hooks/useSquigglePath.js';
import { useSpeechBubblePath } from './hooks/useSpeechBubblePath.js';
import type { WobblySpeechBubbleProps } from './types.js';

/**
 * 텍스트 크기에 맞게 자동으로 조절되는 wobbly 말풍선 컴포넌트.
 *
 * WobblyBox와 동일하게 ResizeObserver로 children 크기를 감지하고,
 * 감지된 크기로 말풍선 path(둥근 사각형 + 하단 꼬리)를 생성한 뒤
 * useSquigglePath로 손그림 효과를 적용한다.
 *
 * @example
 * <WobblySpeechBubble
 *   maxWidth={320}
 *   padding={20}
 *   stroke="#1a1a1a"
 *   strokeWidth={3}
 *   fill="white"
 * >
 *   <p>안녕하세요!</p>
 * </WobblySpeechBubble>
 */
export const WobblySpeechBubble: React.FC<WobblySpeechBubbleProps> = ({
  children,
  maxWidth,
  padding = 16,
  borderRadius = 16,
  tailType = 'pointed',
  tailWidth = 24,
  tailHeight = 20,
  frequency = 200,
  wiggle = 12,
  smoothen = 74,
  strokeWidth = 2,
  stroke = '#1a1a1a',
  fill = 'white',
  seed = 42,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // children 크기 변화 감지 (WobblyBox와 동일한 패턴)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 현재 크기로 말풍선 base path 생성
  // size.height = body 높이 + tailHeight (spacer div 포함)
  const basePath = useSpeechBubblePath(size.width, size.height, {
    borderRadius,
    tailWidth,
    tailHeight,
    tailType,
  });

  // wobbly 효과 적용
  const wobblyPath = useSquigglePath(basePath, {
    frequency,
    wiggle,
    smoothen,
    strokeWidth,
    seed,
  });

  // 흔들림 진폭에 따라 SVG 오버플로우 여백 계산
  const amplitude = Math.min(size.width, size.height) * (wiggle / 100) * 0.22;
  const svgPadding = Math.ceil(amplitude) + strokeWidth + 8;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-block',
        maxWidth,
        ...style,
      }}
    >
      {/* Wobbly SVG overlay — body + tail 전체를 덮음 */}
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

      {/* 실제 콘텐츠 — SVG fill 위로 올라오도록 z-index 지정 */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>

      {/* 꼬리 높이만큼 공간 확보 — 이로 인해 containerRef의 height가 tailHeight만큼 늘어남 */}
      <div aria-hidden="true" style={{ height: tailHeight }} />
    </div>
  );
};
