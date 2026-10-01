import React, { useState } from 'react';
import { WobblyShape } from '@squiggle-line/react';
import { SliderProp, ColorProp, FillProp, SelectProp, SectionTitle } from '../components/PropControl';

const PRESETS: Record<string, { d: string; width: number; height: number }> = {
  circle: {
    d: 'M 150 10 C 232 10 290 68 290 150 C 290 232 232 290 150 290 C 68 290 10 232 10 150 C 10 68 68 10 150 10 Z',
    width: 300,
    height: 300,
  },
  heart: {
    d: 'M 150 260 C 60 200 10 155 10 100 C 10 55 45 25 90 25 C 118 25 138 40 150 58 C 162 40 182 25 210 25 C 255 25 290 55 290 100 C 290 155 240 200 150 260 Z',
    width: 300,
    height: 300,
  },
  star: {
    d: 'M 150 10 L 179 105 L 280 105 L 197 163 L 225 255 L 150 202 L 75 255 L 103 163 L 20 105 L 121 105 Z',
    width: 300,
    height: 300,
  },
  triangle: {
    d: 'M 150 20 L 280 245 L 20 245 Z',
    width: 300,
    height: 280,
  },
  wave: {
    d: 'M 10 100 C 50 30 100 170 150 100 C 200 30 250 170 290 100',
    width: 300,
    height: 200,
  },
};

const PRESET_OPTIONS = Object.keys(PRESETS).map(k => ({ value: k, label: k }));

export function WobblyShapeDemo() {
  const [preset, setPreset] = useState('circle');
  const [frequency, setFrequency] = useState(200);
  const [wiggle, setWiggle] = useState(16);
  const [smoothen, setSmoothen] = useState(74);
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [stroke, setStroke] = useState('#a78bfa');
  const [fill, setFill] = useState('none');
  const [seed, setSeed] = useState(42);

  const { d, width, height } = PRESETS[preset];

  return (
    <div className="demo-layout">
      <div className="preview-panel dark">
        <WobblyShape
          d={d}
          width={width}
          height={height}
          frequency={frequency}
          wiggle={wiggle}
          smoothen={smoothen}
          strokeWidth={strokeWidth}
          stroke={stroke}
          fill={fill}
          seed={seed}
        />
      </div>

      <div className="props-panel">
        <SectionTitle>Shape</SectionTitle>
        <SelectProp label="preset" value={preset} options={PRESET_OPTIONS} onChange={setPreset} />

        <SectionTitle>Squiggle</SectionTitle>
        <SliderProp label="frequency" value={frequency} min={10} max={500} onChange={setFrequency} />
        <SliderProp label="wiggle" value={wiggle} min={0} max={100} onChange={setWiggle} />
        <SliderProp label="smoothen" value={smoothen} min={0} max={100} onChange={setSmoothen} />

        <SectionTitle>Stroke</SectionTitle>
        <SliderProp label="strokeWidth" value={strokeWidth} min={0.5} max={10} step={0.5} onChange={setStrokeWidth} />
        <ColorProp label="stroke" value={stroke} onChange={setStroke} />
        <FillProp value={fill} onChange={setFill} />

        <SectionTitle>Other</SectionTitle>
        <SliderProp label="seed" value={seed} min={0} max={999} onChange={setSeed} />
      </div>
    </div>
  );
}
