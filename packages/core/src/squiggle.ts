import { samplePath } from './samplePath.js';
import { applyWiggle } from './applyWiggle.js';
import { smoothPoints } from './smoothPoints.js';
import { buildPath } from './buildPath.js';
import type { SquiggleParams } from './types.js';

/**
 * SVG path 문자열에 Squiggle 효과를 적용해 새로운 wobbly path를 반환한다.
 *
 * @example
 * const result = applySquiggle('M 0 0 L 100 100', { frequency: 200, wiggle: 16, smoothen: 74 });
 */
export function applySquiggle(pathData: string, params: SquiggleParams): string {
  if (!pathData) return '';
  const { frequency, wiggle, smoothen, seed = 42 } = params;
  const spacing = 10;

  // 여러 개의 서브 패스(M으로 시작하는 분리된 도형)를 지원하기 위해 분리
  // 정규식: M 또는 m 명령어 앞에서 분리
  const subPaths = pathData.split(/(?=[Mm]\s*[-\d.])/).filter(p => p.trim());

  if (subPaths.length > 1) {
    return subPaths.map((subPath, index) => {
      // 각 서브 패스마다 시드를 다르게 줘서 패턴이 달라지도록 함
      return applySquiggle(subPath, { ...params, seed: seed + index });
    }).join(' ');
  }

  // 둥근 모서리가 찌그러지지 않도록 촘촘한 간격(10px)으로 균일하게 샘플링
  const points = samplePath(pathData, spacing);
  if (points.length < 2) return pathData;

  // Wiggle 적용 (Seeded noise + box-scale amplitude + laplacian smoothen + corner protection)
  const displaced = applyWiggle(points, { frequency, wiggle, smoothen, seed });

  // Catmull-Rom Bezier 재구성
  const segments = smoothPoints(displaced, smoothen);

  // SVG path 문자열화
  return buildPath(segments);
}

/** @deprecated Use applySquiggle instead */
export const applyDynamicStroke = applySquiggle;
