// figma-plugin main thread logic

// UI 패널 열기
figma.showUI(__html__, { width: 320, height: 540 });

/**
 * 둥근 사각형 패스 데이터 문자열 생성 (Figma cornerRadius 반영)
 */
function getRoundRectPath(width: number, height: number, rx: number): string {
  const r = Math.min(rx, width / 2, height / 2);
  if (r <= 0) {
    return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
  }
  return [
    `M ${r} 0`,
    `L ${width - r} 0`,
    `Q ${width} 0 ${width} ${r}`,
    `L ${width} ${height - r}`,
    `Q ${width} ${height} ${width - r} ${height}`,
    `L ${r} ${height}`,
    `Q 0 ${height} 0 ${height - r}`,
    `L 0 ${r}`,
    `Q 0 0 ${r} 0`,
    'Z',
  ].join(' ');
}

// 현재 선택 상태를 감지하여 UI에 전달
function sendSelectionToUI() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: 'SELECTION_CHANGE', hasSelection: false });
    return;
  }

  const node = selection[0];

  if (
    node.type === 'VECTOR' ||
    node.type === 'RECTANGLE' ||
    node.type === 'ELLIPSE' ||
    node.type === 'POLYGON' ||
    node.type === 'STAR' ||
    node.type === 'BOOLEAN_OPERATION' ||
    node.type === 'FRAME' ||
    node.type === 'COMPONENT' ||
    node.type === 'INSTANCE' ||
    node.type === 'TEXT'
  ) {
    let cornerRadius = 0;
    if ('cornerRadius' in node && typeof node.cornerRadius === 'number') {
      cornerRadius = node.cornerRadius;
    } else if ('topLeftRadius' in node && typeof node.topLeftRadius === 'number') {
      cornerRadius = node.topLeftRadius;
    }

    if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') {
      node.exportAsync({ format: 'SVG' }).then((bytes) => {
        const svgString = String.fromCharCode.apply(null, Array.from(bytes));
        const match = svgString.match(/d="([^"]+)"/);
        const pathData = match ? match[1] : '';

        figma.ui.postMessage({
          type: 'SELECTION_CHANGE',
          hasSelection: true,
          isCustomPath: true,
          name: node.name,
          pathData,
          width: node.width,
          height: node.height,
          x: node.x,
          y: node.y,
          cornerRadius,
        });
      }).catch(() => {
        figma.ui.postMessage({ type: 'ERROR', message: '도형에서 패스를 추출할 수 없습니다.' });
      });
    } else {
      const pathData = getRoundRectPath(node.width, node.height, cornerRadius);
      figma.ui.postMessage({
        type: 'SELECTION_CHANGE',
        hasSelection: true,
        isCustomPath: false,
        name: node.name,
        pathData,
        width: node.width,
        height: node.height,
        x: node.x,
        y: node.y,
        cornerRadius,
      });
    }
  } else {
    figma.ui.postMessage({
      type: 'SELECTION_CHANGE',
      hasSelection: false,
      message: '지원하지 않는 레이어 타입입니다. (Vector, Rectangle, Frame, Text 등을 선택하세요)',
    });
  }
}

sendSelectionToUI();
figma.on('selectionchange', sendSelectionToUI);

// HEX -> RGB 변환 도우미
function hexToFigmaColor(hex: string) {
  if (hex === 'none') return null;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
}

// UI로부터의 메시지 수신 및 레이어 조작
figma.ui.onmessage = (msg) => {
  // 1. 일반 테두리 스트로크 모드
  if (msg.type === 'APPLY_SQUIGGLE_TO_FIGMA') {
    const { wobblyD, strokeColor, strokeWidth, fillColor, label } = msg;
    const selection = figma.currentPage.selection;
    if (selection.length === 0) return;

    const originalNode = selection[0];
    const parent = originalNode.parent;
    if (!parent) return;

    const vectorNode = figma.createVector();
    vectorNode.name = label; // 요청된 형태로 라벨 설정

    vectorNode.vectorPaths = [
      {
        windingRule: 'NONE',
        data: wobblyD,
      },
    ];

    const strokeRGB = hexToFigmaColor(strokeColor);
    if (strokeRGB) {
      vectorNode.strokes = [{ type: 'SOLID', color: strokeRGB }];
    }
    vectorNode.strokeWeight = strokeWidth;
    vectorNode.strokeCap = 'ROUND';
    vectorNode.strokeJoin = 'ROUND';

    // Solid Fill 설정
    const fillRGB = hexToFigmaColor(fillColor);
    if (fillRGB) {
      vectorNode.fills = [{ type: 'SOLID', color: fillRGB }];
    } else {
      vectorNode.fills = [];
    }

    vectorNode.x = originalNode.x;
    vectorNode.y = originalNode.y;

    if ('strokes' in originalNode && originalNode.strokes.length > 0) {
      originalNode.strokes = [];
    }

    parent.appendChild(vectorNode);
    const group = figma.group([originalNode, vectorNode], parent);
    group.name = `${originalNode.name} + Wobbly`;

    figma.currentPage.selection = [group];
    figma.notify('Wobbly Stroke 테두리가 적용되었습니다!');
  }

  // 2. 말풍선 생성 모드
  if (msg.type === 'APPLY_SPEECH_BUBBLE_TO_FIGMA') {
    const { wobblyD, strokeColor, strokeWidth, fillColor, label, width, height, hasSelection } = msg;
    const selection = figma.currentPage.selection;

    const vectorNode = figma.createVector();
    vectorNode.name = label;

    vectorNode.vectorPaths = [
      {
        windingRule: 'NONE',
        data: wobblyD,
      },
    ];

    const strokeRGB = hexToFigmaColor(strokeColor);
    if (strokeRGB) {
      vectorNode.strokes = [{ type: 'SOLID', color: strokeRGB }];
    }
    vectorNode.strokeWeight = strokeWidth;
    vectorNode.strokeCap = 'ROUND';
    vectorNode.strokeJoin = 'ROUND';

    const fillRGB = hexToFigmaColor(fillColor);
    if (fillRGB) {
      vectorNode.fills = [{ type: 'SOLID', color: fillRGB }];
    } else {
      vectorNode.fills = [];
    }

    if (hasSelection && selection.length > 0) {
      // 선택된 요소를 감싸도록 배치 및 그룹핑
      const originalNode = selection[0];
      const parent = originalNode.parent;
      if (parent) {
        // 말풍선의 꼬리가 아래로 튀어나오므로 content 기준으로 말풍선 body의 top-left 좌표를 잡아줌
        const bubblePadding = (width - originalNode.width) / 2;
        vectorNode.x = originalNode.x - bubblePadding;
        vectorNode.y = originalNode.y - bubblePadding;

        parent.appendChild(vectorNode);

        // 원본 텍스트/레이어가 앞으로 오도록 순서 조정
        const group = figma.group([vectorNode, originalNode], parent);
        group.name = `${originalNode.name} + SpeechBubble`;

        figma.currentPage.selection = [group];
        figma.notify('말풍선이 선택된 요소를 감싸도록 생성되었습니다!');
      }
    } else {
      // 선택이 없는 경우 뷰포트 중앙에 단독 생성
      vectorNode.x = figma.viewport.center.x - width / 2;
      vectorNode.y = figma.viewport.center.y - height / 2;
      figma.currentPage.appendChild(vectorNode);
      figma.currentPage.selection = [vectorNode];
      figma.notify('말풍선이 중앙에 생성되었습니다!');
    }
  }
};
