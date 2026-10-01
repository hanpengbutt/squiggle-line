# squiggle

SVG 경로를 손으로 그린 것처럼 구불구불한 선(wobbly stroke)으로 변환하는 라이브러리 + Figma 플러그인.

## Packages

| Package | Description | Version |
|---------|-------------|---------|
| [`@squiggle-line/core`](./packages/core) | Zero-dependency 핵심 알고리즘 엔진 | ![npm](https://img.shields.io/npm/v/@squiggle-line/core) |
| [`@squiggle-line/react`](./packages/react) | React 바인딩 (WobblyBox, WobblyShape, useSquigglePath) | ![npm](https://img.shields.io/npm/v/@squiggle-line/react) |

## Apps

| App | Description |
|-----|-------------|
| [`figma-plugin`](./apps/figma-plugin) | Figma Community 플러그인 — "Squiggle — Hand-drawn Stroke" |

## Quick Start

### @squiggle-line/core

```ts
import { applySquiggle } from '@squiggle-line/core';

const wobblyPath = applySquiggle('M 0 0 L 100 0 L 100 100 L 0 100 Z', {
  frequency: 200,  // 굴곡 밀도 (10~500%)
  wiggle: 16,      // 변위 진폭 (0~100%)
  smoothen: 74,    // 평활화 강도 (0~100%)
  seed: 42,        // 재현 가능한 시드
});
```

### @squiggle-line/react

```tsx
import { WobblyBox, WobblyShape, useSquigglePath } from '@squiggle-line/react';

// 컨텐츠를 감싸는 wobbly border
<WobblyBox frequency={200} wiggle={16} smoothen={74} stroke="#1a1a1a" borderRadius={8}>
  <p>어떤 컨텐츠든 자동으로 맞춰짐</p>
</WobblyBox>

// 커스텀 SVG path에 효과 적용
<WobblyShape
  d="M 0 50 C 100 0 200 100 300 50"
  frequency={200} wiggle={16} smoothen={74}
  stroke="#1a1a1a" strokeWidth={2}
  width={300} height={100}
/>
```

## Development

```bash
# 의존성 설치
pnpm install

# 전체 개발 서버 실행
pnpm dev

# 전체 빌드
pnpm build

# 특정 패키지만 실행
pnpm -F @squiggle-line/core dev
pnpm -F @squiggle-line/figma-plugin dev
```

## Release

```bash
# 변경사항 기록
pnpm changeset

# 버전 bump + CHANGELOG 생성
pnpm version

# npm publish
pnpm release
```

## Algorithm

```
SVG path 문자열
  → samplePath()           등간격 포인트 샘플링
  → createIrregularNoise() Seeded PRNG + Smoothstep 노이즈 생성
  → calculateNormals()     법선 벡터 계산
  → applyWiggle()          노이즈 × 법선 변위 + Corner Damping
  → smoothPoints()         Catmull-Rom → Cubic Bezier 변환
  → buildPath()            SVG path 문자열 직렬화
```

## License

MIT
