import type { BezierSegment } from './types.js';

const PRECISION = 3; // 소수점 자리수

/**
 * BezierSegment 배열을 SVG path 문자열로 직렬화한다.
 * → "M x0 y0 C cp1x cp1y cp2x cp2y x1 y1 C ..."
 */
export function buildPath(segments: BezierSegment[]): string {
  if (segments.length === 0) return '';
  if (segments.length === 1) {
    const { point } = segments[0];
    return `M ${r(point.x)} ${r(point.y)}`;
  }

  const [first, ...rest] = segments;
  const parts: string[] = [`M ${r(first.point.x)} ${r(first.point.y)}`];

  for (let i = 0; i < rest.length; i++) {
    const prev = segments[i];
    const curr = rest[i];

    parts.push(
      `C ${r(prev.cp1.x)} ${r(prev.cp1.y)} ` +
      `${r(prev.cp2.x)} ${r(prev.cp2.y)} ` +
      `${r(curr.point.x)} ${r(curr.point.y)}`
    );
  }

  return parts.join(' ');
}

/** 소수점 반올림 (path 문자열을 짧게 유지) */
function r(n: number): number {
  return parseFloat(n.toFixed(PRECISION));
}
