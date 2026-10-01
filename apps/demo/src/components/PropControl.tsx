import React, { useState } from 'react';

// ── Section title ──────────────────────────────────────────────
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="section-title">{children}</div>;
}

// ── Slider ─────────────────────────────────────────────────────
interface SliderPropProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}

export function SliderProp({ label, value, min, max, step = 1, onChange }: SliderPropProps) {
  const pct = `${Math.round(((value - min) / (max - min)) * 100)}%`;
  return (
    <div className="prop-row">
      <div className="prop-label-row">
        <span className="prop-label">{label}</span>
        <span className="prop-value">{value}</span>
      </div>
      <input
        type="range"
        className="prop-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--pct': pct } as React.CSSProperties}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// ── Color picker ───────────────────────────────────────────────
interface ColorPropProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function ColorProp({ label, value, onChange }: ColorPropProps) {
  return (
    <div className="prop-row">
      <div className="prop-label-row">
        <span className="prop-label">{label}</span>
      </div>
      <div className="prop-color-row">
        <input
          type="color"
          className="prop-color-swatch"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <span className="prop-color-text">{value}</span>
      </div>
    </div>
  );
}

// ── Fill (none | color) ────────────────────────────────────────
interface FillPropProps {
  value: string;
  onChange: (v: string) => void;
}

export function FillProp({ value, onChange }: FillPropProps) {
  const isNone = value === 'none';
  const colorValue = isNone ? '#ffffff' : value;

  return (
    <div className="prop-row">
      <div className="fill-row">
        <span className="prop-label">fill</span>
        <div className="fill-controls">
          <button
            className={`toggle-btn${isNone ? ' active' : ''}`}
            onClick={() => onChange('none')}
          >
            none
          </button>
          <button
            className={`toggle-btn${!isNone ? ' active' : ''}`}
            onClick={() => onChange(colorValue)}
          >
            color
          </button>
          {!isNone && (
            <input
              type="color"
              className="prop-color-swatch"
              value={colorValue}
              onChange={e => onChange(e.target.value)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Textarea ───────────────────────────────────────────────────
interface TextareaPropProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}

export function TextareaProp({ label, value, onChange, rows = 4 }: TextareaPropProps) {
  return (
    <div className="prop-row">
      <span className="prop-label">{label}</span>
      <textarea
        className="prop-textarea"
        value={value}
        rows={rows}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────
interface SelectPropProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

export function SelectProp({ label, value, options, onChange }: SelectPropProps) {
  return (
    <div className="prop-row">
      <span className="prop-label">{label}</span>
      <div className="select-wrapper">
        <select
          className="prop-select"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
