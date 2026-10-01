import React, { useState } from 'react';
import { WobblyBoxDemo } from './demos/WobblyBoxDemo';
import { WobblyShapeDemo } from './demos/WobblyShapeDemo';
import { WobblySpeechBubbleDemo } from './demos/WobblySpeechBubbleDemo';

type Tab = 'WobblyBox' | 'WobblyShape' | 'WobblySpeechBubble';
const TABS: Tab[] = ['WobblyBox', 'WobblyShape', 'WobblySpeechBubble'];

export default function App() {
  const [tab, setTab] = useState<Tab>('WobblyBox');

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none">
            <path
              d="M1 7 C3 3 5 11 7 7 C9 3 11 11 13 7 C15 3 17 11 19 7 C20 5 21 7 21 7"
              stroke="#8b5cf6"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Squiggle Demo</span>
        </div>
        <nav className="tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="header-right" />
      </header>

      <main className="main">
        {tab === 'WobblyBox' && <WobblyBoxDemo />}
        {tab === 'WobblyShape' && <WobblyShapeDemo />}
        {tab === 'WobblySpeechBubble' && <WobblySpeechBubbleDemo />}
      </main>
    </div>
  );
}
