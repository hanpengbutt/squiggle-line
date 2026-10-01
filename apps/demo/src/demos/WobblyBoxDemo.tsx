import React, { useState } from 'react';
import { WobblyBox } from '@squiggle-line/react';
import { SliderProp, ColorProp, FillProp, TextareaProp, SectionTitle } from '../components/PropControl';

export function WobblyBoxDemo() {
  const [frequency, setFrequency] = useState(200);
  const [wiggle, setWiggle] = useState(16);
  const [smoothen, setSmoothen] = useState(74);
  const [strokeWidth, setStrokeWidth] = useState(2.5);
  const [stroke, setStroke] = useState('#1a1a1a');
  const [fill, setFill] = useState('none');
  const [borderRadius, setBorderRadius] = useState(12);
  const [seed, setSeed] = useState(42);
  const [text, setText] = useState('WobblyBox\n손으로 그린 테두리 ✏️');

  return (
    <div className="demo-layout">
      <div className="preview-panel light">
        <WobblyBox
          frequency={frequency}
          wiggle={wiggle}
          smoothen={smoothen}
          strokeWidth={strokeWidth}
          stroke={stroke}
          fill={fill}
          borderRadius={borderRadius}
          seed={seed}
        >
          <div style={{ padding: '24px 32px', fontSize: 22, fontWeight: 600, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#1a1a1a', fontFamily: 'inherit' }}>
            {text}
          </div>
        </WobblyBox>
      </div>

      <div className="props-panel">
        <SectionTitle>Squiggle</SectionTitle>
        <SliderProp label="frequency" value={frequency} min={10} max={500} onChange={setFrequency} />
        <SliderProp label="wiggle" value={wiggle} min={0} max={100} onChange={setWiggle} />
        <SliderProp label="smoothen" value={smoothen} min={0} max={100} onChange={setSmoothen} />

        <SectionTitle>Stroke</SectionTitle>
        <SliderProp label="strokeWidth" value={strokeWidth} min={0.5} max={10} step={0.5} onChange={setStrokeWidth} />
        <ColorProp label="stroke" value={stroke} onChange={setStroke} />
        <FillProp value={fill} onChange={setFill} />

        <SectionTitle>Shape</SectionTitle>
        <SliderProp label="borderRadius" value={borderRadius} min={0} max={80} onChange={setBorderRadius} />
        <SliderProp label="seed" value={seed} min={0} max={999} onChange={setSeed} />

        <SectionTitle>Content</SectionTitle>
        <TextareaProp label="text" value={text} onChange={setText} />
      </div>
    </div>
  );
}
