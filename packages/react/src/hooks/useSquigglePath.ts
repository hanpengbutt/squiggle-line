import { useMemo } from 'react';
import { applySquiggle } from '@squiggle-line/core';
import type { SquiggleParams } from '@squiggle-line/core';

/**
 * SVG path 문자열에 Squiggle 효과를 적용한 wobbly path를 반환하는 hook.
 * 파라미터가 바뀔 때만 재계산 (memoized).
 *
 * @example
 * const wobblyD = useSquigglePath('M 0 0 L 100 100', { frequency: 200, wiggle: 16, smoothen: 74 });
 */
export function useSquigglePath(pathData: string, params: SquiggleParams): string {
  return useMemo(() => {
    if (!pathData) return '';
    try {
      return applySquiggle(pathData, params);
    } catch {
      return pathData;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pathData,
    params.frequency,
    params.wiggle,
    params.smoothen,
    params.strokeWidth,
    params.seed,
  ]);
}

/** @deprecated Use useSquigglePath instead */
export const useWobblyPath = useSquigglePath;
