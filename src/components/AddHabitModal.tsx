'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Habit } from '../utils/db';

interface AddHabitModalProps {
  onDismiss: () => void;
  onAdd: (
    title: string,
    colorHex: string,
    targetDays: number,
    isNum: boolean,
    goal: number,
    unit: string,
    pattern: string
  ) => void;
}

const PRESET_COLORS = [
  '#8338EC', // Purple
  '#EF476F', // Pink
  '#118AB2', // Teal
  '#06D6A0', // Green
  '#FF9F1C', // Orange
  '#FFD166', // Yellow
  '#2196F3'  // Blue
];

export default function AddHabitModal({ onDismiss, onAdd }: AddHabitModalProps) {
  const [title, setTitle] = useState('');
  const [colorHex, setColorHex] = useState(PRESET_COLORS[0]);
  const [isNumerical, setIsNumerical] = useState(false);
  const [numericalGoal, setNumericalGoal] = useState(8);
  const [numericalUnit, setNumericalUnit] = useState('times');
  
  // Weekly pattern checkboxes: Mon, Tue, Wed, Thu, Fri, Sat, Sun
  const [daysPattern, setDaysPattern] = useState([true, true, true, true, true, true, true]);

  const toggleDay = (idx: number) => {
    const nextPattern = [...daysPattern];
    nextPattern[idx] = !nextPattern[idx];
    setDaysPattern(nextPattern);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert pattern array to string like "1111111"
    const patternStr = daysPattern.map((day) => (day ? '1' : '0')).join('');
    // Calculate target days based on pattern
    const targetDays = daysPattern.filter(Boolean).length;

    onAdd(
      title,
      colorHex,
      targetDays,
      isNumerical,
      isNumerical ? Number(numericalGoal) : 0,
      isNumerical ? numericalUnit : '',
      patternStr
    );
  };

  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div style={overlayStyle} onClick={onDismiss}>
      <div 
        className="glass" 
        style={modalStyle} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyle}>
          <h3 style={titleStyle}>Create New Habit</h3>
          <button onClick={onDismiss} style={closeBtnStyle} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div className="form-group">
            <label>Habit Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Read a Book" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Color Theme</label>
            <div style={colorRowStyle}>
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  style={{
                    ...colorDotStyle,
                    backgroundColor: color,
                    border: colorHex === color ? '3px solid var(--text-color)' : 'none',
                    transform: colorHex === color ? 'scale(1.15)' : 'none'
                  }}
                  onClick={() => setColorHex(color)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Days of Week Pattern</label>
            <div style={weekdayRowStyle}>
              {weekdays.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  style={{
                    ...weekdayBtnStyle,
                    backgroundColor: daysPattern[idx] ? colorHex : 'var(--surface-variant)',
                    color: daysPattern[idx] ? 'white' : 'var(--text-muted)'
                  }}
                  onClick={() => toggleDay(idx)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={switchGroupStyle}>
            <div>
              <label style={{ display: 'block', fontWeight: 700 }}>Numerical Habit</label>
              <span style={hintStyle}>Track exact inputs (e.g. glasses of water, gym duration)</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={isNumerical}
                onChange={(e) => setIsNumerical(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>

          {isNumerical && (
            <div style={numericalRowStyle}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Daily Goal</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={numericalGoal}
                  onChange={(e) => setNumericalGoal(Number(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 1.5 }}>
                <label>Unit Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={numericalUnit}
                  onChange={(e) => setNumericalUnit(e.target.value)}
                  placeholder="e.g. glasses, push-ups"
                  required
                />
              </div>
            </div>
          )}

          <div style={footerStyle}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onDismiss}
              style={footerBtnStyle}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              style={{ ...footerBtnStyle, background: colorHex }}
            >
              Save Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal CSS
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: '16px',
};

const modalStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '460px',
  borderRadius: '24px',
  padding: '24px',
  maxHeight: '90vh',
  overflowY: 'auto',
  border: '1px solid var(--border-color)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 800,
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  fontSize: '18px',
  cursor: 'pointer',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const colorRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  margin: '4px 0',
};

const colorDotStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  cursor: 'pointer',
  transition: 'transform 0.15s ease',
};

const weekdayRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '6px',
  margin: '4px 0',
};

const weekdayBtnStyle: React.CSSProperties = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: 'none',
  fontSize: '12px',
  fontWeight: 800,
  cursor: 'pointer',
  transition: 'background-color 0.2s, transform 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const switchGroupStyle: React.CSSProperties = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  background: 'var(--surface-variant)',
  borderRadius: '16px',
  marginTop: '8px',
};

const hintStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-muted)',
};

const numericalRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '20px',
};

const footerBtnStyle: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '14px',
  height: '42px',
};
