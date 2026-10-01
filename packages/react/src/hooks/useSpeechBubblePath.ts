import { useMemo } from 'react';

interface SpeechBubblePathOptions {
  borderRadius: number;
  tailWidth: number;
  tailHeight: number;
  tailType?: 'pointed' | 'dot';
}

/**
 * 말풍선 SVG path 문자열을 생성한다.
 *
 * 구조:
 *   - body: 둥근 사각형 (width × bodyHeight)
 *   - tail: body 하단 중앙에서 아래로 뾰족하게 내려오는 삼각형 혹은 동그라미(thought bubble)
 *
 * @param width       말풍선 전체 너비
 * @param totalHeight body 높이 + tail 높이
 * @param options     borderRadius / tailWidth / tailHeight / tailType
 */
function buildSpeechBubblePath(
  width: number,
  totalHeight: number,
  options: SpeechBubblePathOptions,
): string {
  const { borderRadius, tailWidth, tailHeight, tailType = 'pointed' } = options;
  if (width <= 0 || totalHeight <= 0) return '';

  const bodyHeight = totalHeight - tailHeight;
  const r = Math.min(borderRadius, width / 2, bodyHeight / 2);

  // tail 꼭짓점 좌표
  const tailCenter = width / 2;
  const tailLeft = tailCenter - tailWidth / 2;
  const tailRight = tailCenter + tailWidth / 2;
  const tipY = totalHeight;

  const basePath = [
    // 상단 좌측 → 우측
    `M ${r} 0`,
    `L ${width - r} 0`,
    `Q ${width} 0 ${width} ${r}`,
    // 우측 상단 → 하단
    `L ${width} ${bodyHeight - r}`,
    `Q ${width} ${bodyHeight} ${width - r} ${bodyHeight}`,
  ];

  if (tailType === 'pointed') {
    basePath.push(
      // 우하단 → tail 오른쪽 → 꼭짓점 → tail 왼쪽
      `L ${tailRight} ${bodyHeight}`,
      `L ${tailCenter} ${tipY}`,
      `L ${tailLeft} ${bodyHeight}`
    );
  }

  basePath.push(
    // 좌하단
    `L ${r} ${bodyHeight}`,
    `Q 0 ${bodyHeight} 0 ${bodyHeight - r}`,
    // 좌측 하단 → 상단
    `L 0 ${r}`,
    `Q 0 0 ${r} 0`,
    'Z'
  );

  let result = basePath.join(' ');

  if (tailType === 'dot') {
    // 말풍선 아래쪽에 두 개의 원 추가
    const cx = tailCenter;
    
    // Dot 1 (큰 원)
    const r1 = tailHeight * 0.22;
    const cy1 = bodyHeight + tailHeight * 0.40;
    
    // Dot 2 (작은 원)
    const r2 = tailHeight * 0.12;
    const cy2 = bodyHeight + tailHeight * 0.88;

    const makeCircle = (cx: number, cy: number, radius: number) => {
      return `M ${cx - radius} ${cy} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 -${radius * 2} 0 Z`;
    };

    result += ` ${makeCircle(cx, cy1, r1)} ${makeCircle(cx, cy2, r2)}`;
  }

  return result;
}

/**
 * 말풍선 base path를 memoize하여 반환하는 hook.
 * width / totalHeight / options 중 하나라도 바뀔 때만 재계산.
 */
export function useSpeechBubblePath(
  width: number,
  totalHeight: number,
  options: SpeechBubblePathOptions,
): string {
  return useMemo(
    () => buildSpeechBubblePath(width, totalHeight, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [width, totalHeight, options.borderRadius, options.tailWidth, options.tailHeight, options.tailType],
  );
}
