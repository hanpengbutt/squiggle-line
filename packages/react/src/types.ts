import type { SquiggleParams } from '@squiggle-line/core';
import type { CSSProperties } from 'react';

/**
 * WobblyBox / WobblyShape 공통 스타일 props
 *
 * 우선순위: 기본값 < `pathClassName` (예: Tailwind `stroke-red-500`) < `stroke` / `fill` / `strokeWidth` props
 */
export interface SquiggleStyleProps {
  /** 선 색상 */
  stroke?: string;
  /**
   * 선 굵기 (px).
   * wiggle 진폭과 SVG 여백 계산에도 사용되므로, 두께는 `pathClassName`(예: `stroke-1`)보다 이 prop으로 지정하는 것을 권장.
   * 클래스로 지정하면 화면에는 적용되지만 계산은 이 prop(미지정 시 기본값 2) 기준으로 이루어져 선 모양이 어색하거나 잘릴 수 있음.
   */
  strokeWidth?: number;
  /** 채우기 색상 (기본 'none') */
  fill?: string;
  /** 내부 `<path>` 요소에 적용할 className. `stroke-*`, `fill-*` 등으로 기본값을 덮어쓸 수 있음 (props가 지정되면 props가 우선) */
  pathClassName?: string;
}

/** WobblyBox props */
export interface WobblyBoxProps extends Partial<SquiggleParams>, SquiggleStyleProps {
  children?: React.ReactNode;
  /** 모서리 반지름 (px). 0이면 직각 사각형 */
  borderRadius?: number;
  /** SVG가 컨텐츠 바깥으로 넘어가는 여백 (기본: wiggle 기반 자동 계산) */
  padding?: number;
  className?: string;
  style?: CSSProperties;
}

/** WobblyShape props */
export interface WobblyShapeProps extends Partial<SquiggleParams>, SquiggleStyleProps {
  /** 기준이 되는 SVG path 문자열 */
  d: string;
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
}

/** @deprecated Use SquiggleStyleProps instead */
export type WobblyStyleProps = SquiggleStyleProps;

/** WobblySpeechBubble props */
export interface WobblySpeechBubbleProps extends Partial<SquiggleParams>, SquiggleStyleProps {
  children?: React.ReactNode;
  /** 말풍선 꼬리 형태 (기본: 'pointed') */
  tailType?: 'pointed' | 'dot';
  /** 말풍선 최대 너비 (px). 미지정 시 제한 없음 */
  maxWidth?: number;
  /** 내용과 테두리 사이 여백 (px, 기본: 16) */
  padding?: number;
  /** body 모서리 반지름 (px, 기본: 16) */
  borderRadius?: number;
  /** 꼬리 밑변 너비 (px, 기본: 24) */
  tailWidth?: number;
  /** 꼬리 높이 (px, 기본: 20) */
  tailHeight?: number;
  className?: string;
  style?: CSSProperties;
}
