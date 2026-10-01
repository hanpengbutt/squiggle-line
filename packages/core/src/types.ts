/** 2D 좌표 */
export interface Point {
  x: number;
  y: number;
}

/** Cubic Bezier 세그먼트: 끝점 + 두 제어점 */
export interface BezierSegment {
  point: Point;
  cp1: Point;
  cp2: Point;
}

/** Dynamic Stroke 파라미터 */
export interface SquiggleParams {
  /**
   * 샘플링 밀도 + noise 해상도 제어.
   * 높을수록 점이 촘촘해져 굴곡이 세밀해짐.
   * 범위: 10~500%, 기본 200
   */
  frequency: number;
  /** 변위 진폭 (%). strokeWidth 기준. 범위: 0~100%, 기본 16 */
  wiggle: number;
  /**
   * Gaussian blur sigma 제어.
   * 0%: 거친 noise (들쭉날쭉), 100%: 완만한 굴곡.
   * 범위: 0~100%, 기본 74
   */
  smoothen: number;
  /** 선 굵기 — wiggle amplitude 계산 기준 */
  strokeWidth?: number;
  /**
   * Seeded PRNG 시드.
   * 같은 seed → 항상 동일한 결과 (재현성 보장).
   * 기본 42
   */
  seed?: number;
}

/** @deprecated Use SquiggleParams instead */
export type DoodleParams = SquiggleParams;
