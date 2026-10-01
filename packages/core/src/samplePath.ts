import type { Point } from './types.js';

/**
 * SVG path 데이터를 실제 거리(px) 기준 spacing 간격으로 등간격 샘플링한다.
 * width/height가 달라도 선의 굴곡 밀도가 균일하게 유지되는 핵심 단계.
 */
export function samplePath(pathData: string, spacing: number): Point[] {
  if (typeof document !== 'undefined') {
    return samplePathBrowser(pathData, spacing);
  }
  return samplePathFallback(pathData, spacing);
}

function samplePathBrowser(pathData: string, spacing: number): Point[] {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  svg.appendChild(path);
  document.body.appendChild(svg);

  const totalLen = path.getTotalLength();
  const points: Point[] = [];

  // 최소 10개 이상의 포인트 확보, 기본적으로 spacing 단위 분할
  const count = Math.max(10, Math.round(totalLen / Math.max(1, spacing)));
  for (let i = 0; i <= count; i++) {
    const pt = path.getPointAtLength((i / count) * totalLen);
    points.push({ x: pt.x, y: pt.y });
  }

  document.body.removeChild(svg);
  return points;
}

// ─── 비브라우저용 Fallback ───────────────────────────────────────
interface PathCommand {
  type: string;
  args: number[];
}

function parsePathCommands(d: string): PathCommand[] {
  const commands: PathCommand[] = [];
  const re = /([MLCQZHVSAz])\s*([-\d.,\s]*)/gi;
  let match: RegExpExecArray | null;

  while ((match = re.exec(d)) !== null) {
    const type = match[1];
    const args = match[2]
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    commands.push({ type, args });
  }

  return commands;
}

function cubicBezierPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const mt = 1 - t;
  return {
    x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
    y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y,
  };
}

function quadBezierPoint(t: number, p0: Point, p1: Point, p2: Point): Point {
  const mt = 1 - t;
  return {
    x: mt ** 2 * p0.x + 2 * mt * t * p1.x + t ** 2 * p2.x,
    y: mt ** 2 * p0.y + 2 * mt * t * p1.y + t ** 2 * p2.y,
  };
}

function samplePathFallback(pathData: string, spacing: number): Point[] {
  const commands = parsePathCommands(pathData);
  const denseSamples: Point[] = [];
  let cursor: Point = { x: 0, y: 0 };
  let start: Point = { x: 0, y: 0 };
  const DENSE = 200;

  for (const cmd of commands) {
    const { type, args } = cmd;
    switch (type.toUpperCase()) {
      case 'M':
        cursor = { x: args[0], y: args[1] };
        start = { ...cursor };
        denseSamples.push({ ...cursor });
        break;
      case 'L':
        for (let i = 1; i <= DENSE; i++) {
          const t = i / DENSE;
          denseSamples.push({
            x: cursor.x + (args[0] - cursor.x) * t,
            y: cursor.y + (args[1] - cursor.y) * t,
          });
        }
        cursor = { x: args[0], y: args[1] };
        break;
      case 'C': {
        const [cx1, cy1, cx2, cy2, ex, ey] = args;
        const p1 = { x: cx1, y: cy1 };
        const p2 = { x: cx2, y: cy2 };
        const end = { x: ex, y: ey };
        for (let i = 1; i <= DENSE; i++) {
          denseSamples.push(cubicBezierPoint(i / DENSE, cursor, p1, p2, end));
        }
        cursor = end;
        break;
      }
      case 'Q': {
        const [cx, cy, ex, ey] = args;
        const ctrl = { x: cx, y: cy };
        const end = { x: ex, y: ey };
        for (let i = 1; i <= DENSE; i++) {
          denseSamples.push(quadBezierPoint(i / DENSE, cursor, ctrl, end));
        }
        cursor = end;
        break;
      }
      case 'H':
        for (let i = 1; i <= DENSE; i++) {
          denseSamples.push({ x: cursor.x + (args[0] - cursor.x) * (i / DENSE), y: cursor.y });
        }
        cursor = { x: args[0], y: cursor.y };
        break;
      case 'V':
        for (let i = 1; i <= DENSE; i++) {
          denseSamples.push({ x: cursor.x, y: cursor.y + (args[0] - cursor.y) * (i / DENSE) });
        }
        cursor = { x: cursor.x, y: args[0] };
        break;
      case 'Z':
        for (let i = 1; i <= DENSE; i++) {
          const t = i / DENSE;
          denseSamples.push({
            x: cursor.x + (start.x - cursor.x) * t,
            y: cursor.y + (start.y - cursor.y) * t,
          });
        }
        cursor = { ...start };
        break;
    }
  }

  if (denseSamples.length < 2) return denseSamples;

  const cumulativeLengths: number[] = [0];
  for (let i = 1; i < denseSamples.length; i++) {
    const dx = denseSamples[i].x - denseSamples[i - 1].x;
    const dy = denseSamples[i].y - denseSamples[i - 1].y;
    cumulativeLengths.push(cumulativeLengths[i - 1] + Math.hypot(dx, dy));
  }

  const totalLen = cumulativeLengths[cumulativeLengths.length - 1];
  const count = Math.max(10, Math.round(totalLen / Math.max(1, spacing)));
  const result: Point[] = [];

  for (let i = 0; i <= count; i++) {
    const target = (i / count) * totalLen;
    let lo = 0;
    let hi = cumulativeLengths.length - 1;
    while (lo < hi - 1) {
      const mid = Math.floor((lo + hi) / 2);
      if (cumulativeLengths[mid] < target) lo = mid;
      else hi = mid;
    }
    const segT = (target - cumulativeLengths[lo]) / (cumulativeLengths[hi] - cumulativeLengths[lo] || 1);
    result.push({
      x: denseSamples[lo].x + (denseSamples[hi].x - denseSamples[lo].x) * segT,
      y: denseSamples[lo].y + (denseSamples[hi].y - denseSamples[lo].y) * segT,
    });
  }

  return result;
}
