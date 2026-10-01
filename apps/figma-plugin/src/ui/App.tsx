import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { applySquiggle } from '@squiggle-line/core';

interface SelectionInfo {
  hasSelection: boolean;
  isCustomPath?: boolean;
  name?: string;
  pathData?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cornerRadius?: number;
  message?: string;
}

type ModeTab = 'stroke' | 'bubble';

export default function App() {
  const [tab, setTab] = useState<ModeTab>('stroke');
  const [selection, setSelection] = useState<SelectionInfo>({ hasSelection: false });

  // 공통 옵션
  const [frequency, setFrequency] = useState(200);
  const [wiggle, setWiggle] = useState(16);
  const [smoothen, setSmoothen] = useState(52);
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [seed, setSeed] = useState(1234);
  const [strokeColor, setStrokeColor] = useState('#1a1a1a');
  const [fillColor, setFillColor] = useState('none'); // 'none' 또는 HEX 색상

  // Speech Bubble 전용 옵션
  const [bubbleWidth, setBubbleWidth] = useState(200);
  const [bubbleHeight, setBubbleHeight] = useState(120);
  const [bubblePadding, setBubblePadding] = useState(16);
  const [bubbleBorderRadius, setBubbleBorderRadius] = useState(16);
  const [bubbleTailWidth, setBubbleTailWidth] = useState(28);
  const [bubbleTailHeight, setBubbleTailHeight] = useState(24);
  const [bubbleTailType, setBubbleTailType] = useState<'pointed' | 'dot'>('pointed');

  const [copied, setCopied] = useState(false);

  // Figma 선택 노드 변화 감지
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;
      if (msg.type === 'SELECTION_CHANGE') {
        setSelection(msg);
        
        // 말풍선 모드일 때 선택된 피그마 요소가 있으면, 패딩을 고려하여 크기 세팅
        if (msg.hasSelection && msg.width && msg.height) {
          setBubbleWidth(Math.round(msg.width + bubblePadding * 2));
          setBubbleHeight(Math.round(msg.height + bubblePadding * 2));
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [bubblePadding]);

  // 피그마 선택 변경 시 Wobbly Speech Bubble 크기 자동업데이트 트리거
  useEffect(() => {
    if (tab === 'bubble' && selection.hasSelection && selection.width && selection.height) {
      setBubbleWidth(Math.round(selection.width + bubblePadding * 2));
      setBubbleHeight(Math.round(selection.height + bubblePadding * 2));
    }
  }, [tab, selection, bubblePadding]);

  // 말풍선 베이스 패스 빌더
  const bubbleBaseD = useMemo(() => {
    const w = bubbleWidth;
    const h = bubbleHeight;
    const r = Math.min(bubbleBorderRadius, w / 2, (h - bubbleTailHeight) / 2);
    const bodyHeight = h - bubbleTailHeight;

    if (w <= 0 || h <= 0 || bodyHeight <= 0) return '';

    const tailCenter = w / 2;
    const tailLeft = tailCenter - bubbleTailWidth / 2;
    const tailRight = tailCenter + bubbleTailWidth / 2;
    const tipY = h;

    const basePath = [
      `M ${r} 0`,
      `L ${w - r} 0`,
      `Q ${w} 0 ${w} ${r}`,
      `L ${w} ${bodyHeight - r}`,
      `Q ${w} ${bodyHeight} ${w - r} ${bodyHeight}`,
    ];

    if (bubbleTailType === 'pointed') {
      basePath.push(
        `L ${tailRight} ${bodyHeight}`,
        `L ${tailCenter} ${tipY}`,
        `L ${tailLeft} ${bodyHeight}`
      );
    }

    basePath.push(
      `L ${r} ${bodyHeight}`,
      `Q 0 ${bodyHeight} 0 ${bodyHeight - r}`,
      `L 0 ${r}`,
      `Q 0 0 ${r} 0`,
      'Z'
    );

    let result = basePath.join(' ');

    if (bubbleTailType === 'dot') {
      const cx = tailCenter;
      const r1 = bubbleTailHeight * 0.22;
      const cy1 = bodyHeight + bubbleTailHeight * 0.40;
      const r2 = bubbleTailHeight * 0.12;
      const cy2 = bodyHeight + bubbleTailHeight * 0.88;

      const makeCircle = (cx: number, cy: number, radius: number) => {
        return `M ${cx - radius} ${cy} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 -${radius * 2} 0 Z`;
      };

      result += ` ${makeCircle(cx, cy1, r1)} ${makeCircle(cx, cy2, r2)}`;
    }

    return result;
  }, [bubbleWidth, bubbleHeight, bubbleBorderRadius, bubbleTailWidth, bubbleTailHeight, bubbleTailType]);

  // 최종 삐뚤빼뚤 패스 계산
  const previewD = useMemo(() => {
    if (tab === 'stroke') {
      if (!selection.hasSelection || !selection.pathData) return '';
      try {
        return applySquiggle(selection.pathData, { frequency, wiggle, smoothen, strokeWidth, seed });
      } catch {
        return '';
      }
    } else {
      if (!bubbleBaseD) return '';
      try {
        return applySquiggle(bubbleBaseD, { frequency, wiggle, smoothen, strokeWidth, seed });
      } catch {
        return '';
      }
    }
  }, [tab, selection, bubbleBaseD, frequency, wiggle, smoothen, strokeWidth, seed]);

  const randomSeed = () => setSeed(Math.floor(Math.random() * 999999) + 1);

  // 피그마 전송
  const applyToFigma = () => {
    if (!previewD) return;

    if (tab === 'stroke') {
      const radius = selection.cornerRadius ? Math.round(selection.cornerRadius) : 0;
      const componentName = selection.isCustomPath ? 'WobblyShape' : 'WobblyBox';
      const label = selection.isCustomPath
        ? `${componentName}(wiggle=${wiggle} smoothen=${smoothen} sw=${strokeWidth} seed=${seed})`
        : `${componentName}(wiggle=${wiggle} smoothen=${smoothen} sw=${strokeWidth} r=${radius} seed=${seed})`;

      parent.postMessage(
        {
          pluginMessage: {
            type: 'APPLY_SQUIGGLE_TO_FIGMA',
            wobblyD: previewD,
            strokeColor,
            strokeWidth,
            fillColor,
            label,
          },
        },
        '*'
      );
    } else {
      const label = `WobblySpeechBubble(wiggle=${wiggle} smoothen=${smoothen} sw=${strokeWidth} r=${bubbleBorderRadius} tail=${bubbleTailType} seed=${seed})`;
      parent.postMessage(
        {
          pluginMessage: {
            type: 'APPLY_SPEECH_BUBBLE_TO_FIGMA',
            wobblyD: previewD,
            strokeColor,
            strokeWidth,
            fillColor: fillColor === 'none' ? '#ffffff' : fillColor, // 말풍선 기본 fill 흰색
            label,
            width: bubbleWidth,
            height: bubbleHeight,
            hasSelection: selection.hasSelection,
          },
        },
        '*'
      );
    }
  };

  // 클립보드 복사 코드 생성
  const codeSnippet = useMemo(() => {
    if (tab === 'stroke') {
      if (!selection.pathData) return '// 피그마에서 Vector, Rectangle 또는 Frame 레이어를 선택하세요.';
      if (selection.isCustomPath) {
        return `import { WobblyShape } from '@squiggle-line/react';\n\n<WobblyShape\n  d="${selection.pathData}"\n  frequency={${frequency}}\n  wiggle={${wiggle}}\n  smoothen={${smoothen}}\n  strokeWidth={${strokeWidth}}\n  seed={${seed}}\n  stroke="${strokeColor}"\n  fill="${fillColor}"\n  width={${Math.round(selection.width || 100)}}\n  height={${Math.round(selection.height || 100)}}\n/>`;
      } else {
        const radius = selection.cornerRadius ? Math.round(selection.cornerRadius) : 0;
        return `import { WobblyBox } from '@squiggle-line/react';\n\n<WobblyBox\n  frequency={${frequency}}\n  wiggle={${wiggle}}\n  smoothen={${smoothen}}\n  strokeWidth={${strokeWidth}}\n  seed={${seed}}\n  stroke="${strokeColor}"\n  fill="${fillColor}"${radius > 0 ? `\n  borderRadius={${radius}}` : ''}\n>\n  {/* 여기에 컨텐츠가 들어갑니다 */}\n</WobblyBox>`;
      }
    } else {
      return `import { WobblySpeechBubble } from '@squiggle-line/react';\n\n<WobblySpeechBubble\n  frequency={${frequency}}\n  wiggle={${wiggle}}\n  smoothen={${smoothen}}\n  strokeWidth={${strokeWidth}}\n  seed={${seed}}\n  stroke="${strokeColor}"\n  fill="${fillColor}"\n  padding={${bubblePadding}}\n  borderRadius={${bubbleBorderRadius}}\n  tailWidth={${bubbleTailWidth}}\n  tailHeight={${bubbleTailHeight}}\n  tailType="${bubbleTailType}"\n>\n  {/* 여기에 텍스트가 들어갑니다 */}\n</WobblySpeechBubble>`;
    }
  }, [tab, selection, frequency, wiggle, smoothen, strokeWidth, seed, strokeColor, fillColor, bubblePadding, bubbleBorderRadius, bubbleTailWidth, bubbleTailHeight, bubbleTailType]);

  const copyCode = useCallback(async () => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = codeSnippet;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('클립보드 복사 실패', err);
    }
  }, [codeSnippet]);

  // 프리뷰 렌더링에 적합한 viewBox 구하기
  const viewBox = useMemo(() => {
    if (tab === 'stroke') {
      return `0 0 ${selection.width || 100} ${selection.height || 100}`;
    } else {
      return `0 0 ${bubbleWidth || 100} ${bubbleHeight || 100}`;
    }
  }, [tab, selection, bubbleWidth, bubbleHeight]);

  return (
    <div className="plugin-container">
      {/* 탭 네비게이션 */}
      <nav className="plugin-tabs">
        <button
          className={`plugin-tab-btn ${tab === 'stroke' ? 'active' : ''}`}
          onClick={() => setTab('stroke')}
        >
          Wobbly Stroke
        </button>
        <button
          className={`plugin-tab-btn ${tab === 'bubble' ? 'active' : ''}`}
          onClick={() => setTab('bubble')}
        >
          Speech Bubble
        </button>
      </nav>

      {/* 상태 헤더 */}
      <header className="plugin-header">
        {selection.hasSelection ? (
          <div>
            <div className="header-status select-active">
              ● {tab === 'stroke' ? '선택됨' : '선택 래핑 모드'} ({selection.isCustomPath ? '벡터' : '레이아웃'})
            </div>
            <div className="header-name">{selection.name}</div>
          </div>
        ) : (
          <div>
            <div className="header-status select-empty">○ 선택 없음</div>
            <div className="header-msg">
              {tab === 'stroke' ? '레이어를 선택해 주세요.' : '선택 시 크기가 말풍선에 자동 반영됩니다.'}
            </div>
          </div>
        )}
      </header>

      {/* 아이보리 도트 프리뷰 박스 */}
      <section className="preview-box">
        {previewD ? (
          <svg
            viewBox={viewBox}
            width="100%"
            height="100%"
            style={{ overflow: 'visible' }}
          >
            <path
              d={previewD}
              stroke={strokeColor}
              strokeWidth={Math.min(strokeWidth, 8)}
              fill={fillColor === 'none' ? 'none' : fillColor}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <div className="preview-placeholder">미리보기 영역</div>
        )}
      </section>

      {/* 컨트롤 영역 */}
      <section className="controls-form">
        {tab === 'bubble' && (
          <>
            <div className="control-group-title">Speech Bubble Layout</div>
            
            {/* 선택된 레이어가 없을 때만 너비/높이 조절 활성화 */}
            <div className="props-row-grid">
              <div className="input-field-box">
                <label>Width (px)</label>
                <input
                  type="number"
                  value={bubbleWidth}
                  disabled={selection.hasSelection}
                  onChange={(e) => setBubbleWidth(Number(e.target.value) || 100)}
                />
              </div>
              <div className="input-field-box">
                <label>Height (px)</label>
                <input
                  type="number"
                  value={bubbleHeight}
                  disabled={selection.hasSelection}
                  onChange={(e) => setBubbleHeight(Number(e.target.value) || 100)}
                />
              </div>
            </div>

            <div className="control-row">
              <label>Padding <span>{bubblePadding}px</span></label>
              <input type="range" min="4" max="48" value={bubblePadding} step="1"
                onChange={(e) => setBubblePadding(Number(e.target.value))} />
            </div>

            <div className="control-row">
              <label>Corner Radius <span>{bubbleBorderRadius}px</span></label>
              <input type="range" min="0" max="40" value={bubbleBorderRadius} step="1"
                onChange={(e) => setBubbleBorderRadius(Number(e.target.value))} />
            </div>

            <div className="props-row-grid">
              <div className="control-row">
                <label>Tail Width <span>{bubbleTailWidth}</span></label>
                <input type="range" min="10" max="60" value={bubbleTailWidth} step="1"
                  onChange={(e) => setBubbleTailWidth(Number(e.target.value))} />
              </div>
              <div className="control-row">
                <label>Tail Height <span>{bubbleTailHeight}</span></label>
                <input type="range" min="8" max="50" value={bubbleTailHeight} step="1"
                  onChange={(e) => setBubbleTailHeight(Number(e.target.value))} />
              </div>
            </div>

            <div className="fill-toggle-row">
              <label className="prop-label">Tail Type</label>
              <div className="toggle-group">
                <button
                  className={`toggle-btn ${bubbleTailType === 'pointed' ? 'active' : ''}`}
                  onClick={() => setBubbleTailType('pointed')}
                >
                  Pointed
                </button>
                <button
                  className={`toggle-btn ${bubbleTailType === 'dot' ? 'active' : ''}`}
                  onClick={() => setBubbleTailType('dot')}
                >
                  Dot
                </button>
              </div>
            </div>
          </>
        )}

        <div className="control-group-title">Squiggle Effect</div>

        <div className="control-row">
          <label>Frequency <span>{frequency}%</span></label>
          <input type="range" min="10" max="500" value={frequency} step="10"
            onChange={(e) => setFrequency(Number(e.target.value))} />
        </div>

        <div className="control-row">
          <label>Wiggle <span>{wiggle}%</span></label>
          <input type="range" min="0" max="100" value={wiggle} step="1"
            onChange={(e) => setWiggle(Number(e.target.value))} />
        </div>

        <div className="control-row">
          <label>Smoothen <span>{smoothen}%</span></label>
          <input type="range" min="0" max="100" value={smoothen} step="1"
            onChange={(e) => setSmoothen(Number(e.target.value))} />
        </div>

        <div className="control-row">
          <label>Stroke Width <span>{strokeWidth}px</span></label>
          <input type="range" min="1" max="24" value={strokeWidth} step="0.5"
            onChange={(e) => setStrokeWidth(Number(e.target.value))} />
        </div>

        {/* Fill Toggle */}
        <div className="fill-toggle-row">
          <label className="prop-label">Fill Type</label>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${fillColor === 'none' ? 'active' : ''}`}
              onClick={() => setFillColor('none')}
            >
              None
            </button>
            <button
              className={`toggle-btn ${fillColor !== 'none' ? 'active' : ''}`}
              onClick={() => setFillColor(fillColor === 'none' ? '#ffffff' : fillColor)}
            >
              Solid
            </button>
            {fillColor !== 'none' && (
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                style={{ width: '22px', height: '18px', border: '1px solid #444', padding: 0, cursor: 'pointer', background: 'none' }}
              />
            )}
          </div>
        </div>

        {/* Seed & Color */}
        <div className="seed-row">
          <div className="seed-field">
            <label>Seed</label>
            <input type="number" value={seed}
              onChange={(e) => setSeed(Number(e.target.value) || 1234)} />
          </div>
          <button className="seed-btn" onClick={randomSeed}>🎲 랜덤</button>

          <div className="color-field">
            <label>Stroke Color</label>
            <input type="color" value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)} />
          </div>
        </div>
      </section>

      {/* 푸터 버튼 */}
      <footer className="plugin-footer">
        <button
          className="btn btn-secondary"
          onClick={copyCode}
          disabled={tab === 'stroke' && !selection.hasSelection}
        >
          {copied ? '✓ 복사됨' : 'React 코드 복사'}
        </button>

        <button
          className="btn btn-primary"
          onClick={applyToFigma}
          disabled={tab === 'stroke' && !selection.hasSelection}
        >
          Figma에 적용
        </button>
      </footer>
    </div>
  );
}
