/**
 * LCG 기반의 간단하고 재현 가능한 Seeded Random Generator
 */
export function createPRNG(seed: number): () => number {
  let value = Math.abs(seed) || 1;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

/**
 * 성긴 컨트롤 포인트를 부드러운 1D Hermite Interpolation (Smoothstep)으로 연결하여
 * 자연스러운 비규칙적 굴곡(Irregular Noise)을 생성한다.
 *
 * @param count   생성할 노이즈 포인트 개수
 * @param rng     Seeded random generator
 * @param scaleOrFreq  주파수(Frequency, 10~500%).
 *                     수치가 높을수록 내부의 '물리적 주기 넓이(scale)'는 반비례하여 줄어들어 굴곡이 조밀해진다.
 */
export function createIrregularNoise(
  count: number,
  rng: () => number,
  scaleOrFreq: number
): number[] {
  // frequency 수치가 커질수록 노이즈 스텝 넓이(scale)는 좁아져야(12 -> 1.5) 주파수가 촘촘해짐
  const scale = Math.max(1.2, 12 - (scaleOrFreq / 500) * 10.5);
  const controlCount = Math.max(4, Math.round(count / scale));

  const controls = Array.from(
    { length: controlCount },
    () => rng() * 2 - 1
  );

  const result: number[] = [];

  for (let i = 0; i < count; i++) {
    const position = (i / count) * controlCount;
    const index = Math.floor(position);
    const t = position - index;

    // Smoothstep 보간
    const smoothT = t * t * (3 - 2 * t);

    const a = controls[index % controlCount];
    const b = controls[(index + 1) % controlCount];

    result.push(a + (b - a) * smoothT);
  }

  return result;
}
