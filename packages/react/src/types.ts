import type { SquiggleParams } from '@squiggle-line/core';
import type { CSSProperties } from 'react';

/** WobblyBox / WobblyShape 공통 스타일 props */
export interface SquiggleStyleProps {
  /** 선 색상 */
  stroke?: string;
  /** 선 굵기 (px) */
  strokeWidth?: number;
  /** 채우기 색상 (기본 'none') */
  fill?: string;
}

/** WobblyBox props */
export interface WobblyBoxProps extends SquiggleParams, SquiggleStyleProps {
  children?: React.ReactNode;
  /** 모서리 반지름 (px). 0이면 직각 사각형 */
  borderRadius?: number;
  /** SVG가 컨텐츠 바깥으로 넘어가는 여백 (기본: wiggle 기반 자동 계산) */
  padding?: number;
  className?: string;
  style?: CSSProperties;
}

/** WobblyShape props */
export interface WobblyShapeProps extends SquiggleParams, SquiggleStyleProps {
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
export interface WobblySpeechBubbleProps extends SquiggleParams, SquiggleStyleProps {
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
