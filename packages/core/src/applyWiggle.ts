import type { Point, SquiggleParams } from './types.js';
import { createPRNG, createIrregularNoise } from './noise.js';

/**
 * 각 점의 Normal 계산
 */
export function calculateNormals(points: Point[]): Point[] {
  const n = points.length;
  if (n < 2) return points.map(() => ({ x: 0, y: 0 }));
  const isClosed = Math.hypot(points[n - 1].x - points[0].x, points[n - 1].y - points[0].y) < 5;

  const cx = points.reduce((sum, p) => sum + p.x, 0) / n;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / n;

  return points.map((point, i) => {
    let prevIndex = i - 1;
    let nextIndex = i + 1;

    if (isClosed) {
      if (prevIndex < 0) prevIndex = n - 1;
      if (nextIndex >= n) nextIndex = 0;
    } else {
      if (prevIndex < 0) prevIndex = 0;
      if (nextIndex >= n) nextIndex = n - 1;
    }

    const prev = points[prevIndex];
    const next = points[nextIndex];

    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const length = Math.hypot(tx, ty) || 1;

    let nx = -ty / length;
    let ny = tx / length;

    // 바깥쪽을 향하도록 방향 보정
    if (isClosed) {
      const dx = point.x - cx;
      const dy = point.y - cy;
      if (nx * dx + ny * dy < 0) {
        nx *= -1;
        ny *= -1;
      }
    }

    return { x: nx, y: ny };
  });
}

/**
 * Laplacian 평균값 평활화 보정
 */
export function smoothPoints(points: Point[], amount: number): Point[] {
  const alpha = amount / 100;
  const n = points.length;
  if (n < 3) return [...points];
  const isClosed = Math.hypot(points[n - 1].x - points[0].x, points[n - 1].y - points[0].y) < 5;

  return points.map((point, i) => {
    let prevIndex = i - 1;
    let nextIndex = i + 1;

    if (isClosed) {
      if (prevIndex < 0) prevIndex = n - 1;
      if (nextIndex >= n) nextIndex = 0;
    } else {
      if (prevIndex < 0) prevIndex = 0;
      if (nextIndex >= n) nextIndex = n - 1;
    }

    const prev = points[prevIndex];
    const next = points[nextIndex];

    const average = {
      x: (prev.x + point.x + next.x) / 3,
      y: (prev.y + point.y + next.y) / 3,
    };

    return {
      x: point.x + (average.x - point.x) * alpha,
      y: point.y + (average.y - point.y) * alpha,
    };
  });
}

/**
 * 모서리 각도 기반 감쇄 팩터(Damping Factor) 계산.
 * 급격하게 꺾이는 모서리 코너 영역은 노이즈 왜곡 정도를 줄여주어
 * 둥근 사각형 고유의 코너 굴곡 구조가 파괴되지 않도록 보정한다.
 */
function getCornerDamping(points: Point[], i: number): number {
  const n = points.length;
  if (n < 3) return 1.0;

  const prev = points[(i - 1 + n) % n];
  const curr = points[i];
  const next = points[(i + 1) % n];

  const v1 = { x: curr.x - prev.x, y: curr.y - prev.y };
  const v2 = { x: next.x - curr.x, y: next.y - curr.y };

  const len1 = Math.hypot(v1.x, v1.y) || 1;
  const len2 = Math.hypot(v2.x, v2.y) || 1;

  const cosTheta = (v1.x * v2.x + v1.y * v2.y) / (len1 * len2);

  const isCorner = cosTheta < 0.85;
  return isCorner ? 0.65 : 1.0;
}

/**
 * Wiggle 적용 (Seeded noise + box-scale amplitude + Corner Protection)
 */
export function applyWiggle(points: Point[], params: SquiggleParams): Point[] {
  const { frequency, wiggle, smoothen, seed = 42 } = params;

  if (points.length < 2) return points;

  // Bounding box 계산
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const width = Math.max(...xs) - Math.min(...xs) || 100;
  const height = Math.max(...ys) - Math.min(...ys) || 100;

  const rng = createPRNG(seed);
  const noise = createIrregularNoise(points.length, rng, frequency);

  const amplitude = Math.min(width, height) * (wiggle / 100) * 0.16;

  const normals = calculateNormals(points);

  const displaced = points.map((point, i) => {
    const damping = getCornerDamping(points, i);
    return {
      x: point.x + normals[i].x * noise[i] * amplitude * damping,
      y: point.y + normals[i].y * noise[i] * amplitude * damping,
    };
  });

  return smoothPoints(displaced, smoothen);
}

/** @internal */
export function computeNormals(points: Point[]): Point[] {
  return calculateNormals(points);
}
