import type { Point, BezierSegment } from './types.js';

/**
 * 점 배열을 Catmull-Rom spline → Cubic Bezier 세그먼트로 변환한다.
 * 꺾인 선을 매끄러운 SVG path 곡선으로 렌더링하기 위한 필수 단계.
 */
export function smoothPoints(points: Point[], _smoothenValue = 74): BezierSegment[] {
  const n = points.length;
  if (n === 0) return [];

  // tension 고정값 0.65 — 일정한 손그림 베지어 곡률 제공
  const tension = 0.65;

  const isClosed = Math.hypot(points[n - 1].x - points[0].x, points[n - 1].y - points[0].y) < 5;

  return points.map((point, i) => {
    let i0 = i - 1;
    let i1 = i;
    let i2 = i + 1;
    let i3 = i + 2;

    if (isClosed) {
      if (i0 < 0) i0 = n - 1;
      if (i2 >= n) i2 = 0;
      if (i3 >= n) i3 = (i3 - n) % n;
    } else {
      if (i0 < 0) i0 = 0;
      if (i2 >= n) i2 = n - 1;
      if (i3 >= n) i3 = n - 1;
    }

    const p0 = points[i0];
    const p1 = points[i1];
    const p2 = points[i2];
    const p3 = points[i3];

    // Catmull-Rom to Cubic Bezier 제어점 자동 계산
    const cp1: Point = {
      x: p1.x + (p2.x - p0.x) * tension / 6,
      y: p1.y + (p2.y - p0.y) * tension / 6,
    };
    const cp2: Point = {
      x: p2.x - (p3.x - p1.x) * tension / 6,
      y: p2.y - (p3.y - p1.y) * tension / 6,
    };

    return { point: p1, cp1, cp2 };
  });
}
