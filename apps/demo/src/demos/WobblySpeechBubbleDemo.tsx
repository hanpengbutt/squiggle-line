import React, { useState } from 'react';
import { WobblySpeechBubble } from '@squiggle-line/react';
import { SliderProp, ColorProp, FillProp, TextareaProp, SectionTitle } from '../components/PropControl';

export function WobblySpeechBubbleDemo() {
  const [frequency, setFrequency] = useState(200);
  const [wiggle, setWiggle] = useState(12);
  const [smoothen, setSmoothen] = useState(74);
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [stroke, setStroke] = useState('#1a1a1a');
  const [fill, setFill] = useState('#ffffff');
  const [maxWidth, setMaxWidth] = useState(320);
  const [padding, setPadding] = useState(20);
  const [borderRadius, setBorderRadius] = useState(16);
  const [tailType, setTailType] = useState<'pointed' | 'dot'>('pointed');
  const [tailWidth, setTailWidth] = useState(28);
  const [tailHeight, setTailHeight] = useState(24);
  const [seed, setSeed] = useState(42);
  const [text, setText] = useState('안녕하세요!\n반갑습니다 😊');

  return (
    <div className="demo-layout">
      <div className="preview-panel beige">
        <WobblySpeechBubble
          frequency={frequency}
          wiggle={wiggle}
          smoothen={smoothen}
          strokeWidth={strokeWidth}
          stroke={stroke}
          fill={fill}
          maxWidth={maxWidth}
          padding={padding}
          borderRadius={borderRadius}
          tailType={tailType}
          tailWidth={tailWidth}
          tailHeight={tailHeight}
          seed={seed}
        >
          <div style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#1a1a1a', fontFamily: 'inherit' }}>
            {text}
          </div>
        </WobblySpeechBubble>
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

        <SectionTitle>Layout</SectionTitle>
        <SliderProp label="maxWidth" value={maxWidth} min={100} max={600} onChange={setMaxWidth} />
        <SliderProp label="padding" value={padding} min={4} max={60} onChange={setPadding} />
        <SliderProp label="borderRadius" value={borderRadius} min={0} max={40} onChange={setBorderRadius} />

        <SectionTitle>Tail</SectionTitle>
        <div className="prop-row">
          <label>tailType</label>
          <select value={tailType} onChange={e => setTailType(e.target.value as 'pointed' | 'dot')} style={{ marginLeft: 'auto', padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}>
            <option value="pointed">pointed</option>
            <option value="dot">dot</option>
          </select>
        </div>
        {tailType === 'pointed' && (
          <SliderProp label="tailWidth" value={tailWidth} min={10} max={80} onChange={setTailWidth} />
        )}
        <SliderProp label="tailHeight" value={tailHeight} min={8} max={60} onChange={setTailHeight} />

        <SectionTitle>Other</SectionTitle>
        <SliderProp label="seed" value={seed} min={0} max={999} onChange={setSeed} />

        <SectionTitle>Content</SectionTitle>
        <TextareaProp label="text" value={text} onChange={setText} />
      </div>
    </div>
  );
}
