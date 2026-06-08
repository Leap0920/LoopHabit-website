'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Check, Timer as TimerIcon } from 'lucide-react';
import { Habit, FocusSession } from '../utils/db';

interface FocusTimerProps {
  habits: Habit[];
  onLogFocusSession: (habitId: number | null, durationSeconds: number, details: string | null) => void;
  onCompleteHabit: (habitId: number, value: number, notes: string | null) => void;
}

export default function FocusTimer({
  habits,
  onLogFocusSession,
  onCompleteHabit
}: FocusTimerProps) {
  // Timer States
  const [mode, setMode] = useState<'TIMER' | 'STOPWATCH'>('TIMER');
  const [isRunning, setIsRunning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);

  // Success Dialog State
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [loggedSeconds, setLoggedSeconds] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Find selected habit
  const selectedHabit = habits.find((h) => h.id === selectedHabitId) || habits[0] || null;

  // Initialize selected habit id
  useEffect(() => {
    if (habits.length > 0 && selectedHabitId === null) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  // Set Timer Countdown when minutes selector changes
  useEffect(() => {
    if (mode === 'TIMER' && !isRunning) {
      setSecondsLeft(initialMinutes * 60);
    }
  }, [initialMinutes, mode, isRunning]);

  // Unified ticking effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (mode === 'TIMER') {
          setSecondsLeft((prev) => {
            if (prev <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setSecondsElapsed((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  // Web Audio Synth Pleasant Chime
  const playPleasantChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playNode = (freq: number, timeOffset: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + duration);
        
        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + duration);
      };

      playNode(523.25, 0, 0.15);     // C5
      playNode(659.25, 0.15, 0.15);  // E5
      playNode(783.99, 0.30, 0.35);  // G5
    } catch (e) {
      console.warn('Audio synthesis failed', e);
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    playPleasantChime();
    setLoggedSeconds(initialMinutes * 60);
    setShowSuccessDialog(true);
    setSecondsLeft(initialMinutes * 60);
  };

  const handlePlayPause = () => {
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'TIMER') {
      setSecondsLeft(initialMinutes * 60);
    } else {
      setSecondsElapsed(0);
    }
  };

  const handleFinishEarly = () => {
    setIsRunning(false);
    const duration = mode === 'TIMER' 
      ? (initialMinutes * 60 - secondsLeft) 
      : secondsElapsed;

    if (duration > 0) {
      setLoggedSeconds(duration);
      setShowSuccessDialog(true);
    }
    
    if (mode === 'TIMER') {
      setSecondsLeft(initialMinutes * 60);
    } else {
      setSecondsElapsed(0);
    }
  };

  const handleLogOverlaySubmit = (shouldLogHabit: boolean) => {
    onLogFocusSession(selectedHabitId, loggedSeconds, `Focus timer logged`);
    
    if (shouldLogHabit && selectedHabitId) {
      onCompleteHabit(selectedHabitId, 1, 'Logged after completing focus session');
    }
    
    setShowSuccessDialog(false);
  };

  // Progress metrics
  const displaySeconds = mode === 'TIMER' ? secondsLeft : secondsElapsed;
  const progressPct = mode === 'TIMER'
    ? (initialMinutes > 0 ? (secondsLeft / (initialMinutes * 60)) : 0)
    : ((secondsElapsed % 60) / 60);

  const mins = Math.floor(displaySeconds / 60);
  const secs = displaySeconds % 60;
  const timeString = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const themeColor = selectedHabit ? selectedHabit.colorHex : 'var(--primary)';

  return (
    <div style={containerStyle}>
      {/* Tab Slices */}
      <div className="sandbox-tabs">
        <button 
          className={`sandbox-tab ${mode === 'TIMER' ? 'active' : ''}`}
          onClick={() => { if (!isRunning) { setMode('TIMER'); } }}
          disabled={isRunning}
          style={{ opacity: isRunning && mode !== 'TIMER' ? 0.5 : 1 }}
        >
          Countdown Timer
        </button>
        <button 
          className={`sandbox-tab ${mode === 'STOPWATCH' ? 'active' : ''}`}
          onClick={() => { if (!isRunning) { setMode('STOPWATCH'); } }}
          disabled={isRunning}
          style={{ opacity: isRunning && mode !== 'STOPWATCH' ? 0.5 : 1 }}
        >
          Stopwatch Mode
        </button>
      </div>

      {/* Circle Clock */}
      <div style={timerWrapStyle}>
        <div style={circleOutlineStyle} className={isRunning ? "pulse-timer" : ""}>
          <svg width="220" height="220" viewBox="0 0 220 220" style={svgCircleStyle}>
            <circle cx="110" cy="110" r="100" fill="none" stroke="var(--border-color)" strokeWidth="6" />
            <circle 
              cx="110" 
              cy="110" 
              r="100" 
              fill="none" 
              stroke={themeColor} 
              strokeWidth="8" 
              strokeDasharray="628.3" 
              strokeDashoffset={628.3 * (1 - progressPct)}
              strokeLinecap="round"
              style={{ 
                transform: 'rotate(-90deg)', 
                transformOrigin: '50% 50%',
                transition: isRunning ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease'
              }}
            />
          </svg>

          {/* Clock Text inside circle */}
          <div style={clockCenterStyle}>
            <span style={timeStyle}>{timeString}</span>
            <span style={{ 
              ...statusLabelStyle, 
              color: isRunning ? themeColor : 'var(--text-muted)' 
            }}>
              {isRunning ? 'STAY FOCUSED' : 'PAUSED'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div style={controlsRowStyle}>
        {/* Reset */}
        <button 
          onClick={handleReset} 
          className="icon-btn"
          style={{ width: '48px', height: '48px', borderRadius: '14px' }}
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>

        {/* Play/Pause */}
        <button 
          onClick={handlePlayPause} 
          className="btn-primary"
          style={{ 
            background: themeColor, 
            boxShadow: `0 4px 15px ${themeColor}40`,
            padding: '12px 32px',
            borderRadius: '16px',
            fontSize: '15px',
            height: '48px',
            minWidth: '140px'
          }}
        >
          {isRunning ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>

        {/* Save / Finish early */}
        <button 
          onClick={handleFinishEarly}
          className="icon-btn"
          disabled={mode === 'TIMER' ? secondsLeft === initialMinutes * 60 : secondsElapsed === 0}
          style={{ 
            width: '48px', 
            height: '48px',
            borderRadius: '14px',
            backgroundColor: 'rgba(6, 214, 160, 0.1)', 
            borderColor: 'var(--success)',
            color: 'var(--success)',
            opacity: (mode === 'TIMER' ? secondsLeft === initialMinutes * 60 : secondsElapsed === 0) ? 0.3 : 1
          }}
          title="Finish and Log Session"
        >
          <Check size={18} />
        </button>
      </div>

      {/* Duration Selectors (TIMER MODE ONLY) */}
      {mode === 'TIMER' && (
        <div className="glass-card" style={settingGroupCardStyle}>
          <h4 style={settingGroupTitleStyle}>Session Duration</h4>
          <div style={durationPillsRowStyle}>
            {[1, 15, 25, 45, 60].map((mins) => (
              <button
                key={mins}
                onClick={() => { if (!isRunning) setInitialMinutes(mins); }}
                disabled={isRunning}
                style={{
                  ...durationPillStyle,
                  backgroundColor: initialMinutes === mins ? themeColor : 'var(--surface-variant)',
                  color: initialMinutes === mins ? 'white' : 'var(--text-color)',
                  opacity: isRunning ? 0.5 : 1
                }}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Habits Association Dropdown */}
      <div className="glass-card" style={settingGroupCardStyle}>
        <h4 style={settingGroupTitleStyle}>Associate with Habit</h4>
        {habits.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-light)', fontStyle: 'italic' }}>
            No habits available. Create one to associate focus sessions.
          </p>
        ) : (
          <div style={dropdownWrapperStyle}>
            <select
              value={selectedHabitId || ''}
              onChange={(e) => setSelectedHabitId(Number(e.target.value))}
              disabled={isRunning}
              className="form-input"
              style={{ 
                width: '100%', 
                borderLeft: `5px solid ${themeColor}`,
                opacity: isRunning ? 0.6 : 1
              }}
            >
              {habits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 5. Success Log Dialog Overlay */}
      {showSuccessDialog && (
        <div style={overlayStyle}>
          <div className="glass" style={dialogStyle}>
            <TimerIcon size={40} style={{ color: themeColor, margin: '0 auto 16px auto', display: 'block' }} className="floating" />
            <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>Focus Session Finished!</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              Congratulations! You finished{' '}
              <strong>
                {Math.floor(loggedSeconds / 60) > 0 
                  ? `${Math.floor(loggedSeconds / 60)}m ${loggedSeconds % 60}s` 
                  : `${loggedSeconds}s`}
              </strong>{' '}
              of focused effort. 
              {selectedHabit && ` Would you like to check off a completion for '${selectedHabit.title}' today as well?`}
            </p>

            <div style={dialogBtnGroupStyle}>
              <button 
                className="btn-secondary" 
                onClick={() => handleLogOverlaySubmit(false)}
                style={dialogBtnStyle}
              >
                Just Log Session
              </button>
              {selectedHabit && (
                <button 
                  className="btn-primary" 
                  onClick={() => handleLogOverlaySubmit(true)}
                  style={{ ...dialogBtnStyle, background: themeColor }}
                >
                  Log Habit Completion
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowSuccessDialog(false)}
              style={dialogCloseBtnStyle}
            >
              Discard Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  width: '100%',
};

const timerWrapStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  margin: '20px 0',
};

const circleOutlineStyle: React.CSSProperties = {
  position: 'relative',
  width: '220px',
  height: '220px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
};

const svgCircleStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 1,
};

const clockCenterStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  zIndex: 2,
};

const timeStyle: React.CSSProperties = {
  fontSize: '44px',
  fontWeight: 900,
  letterSpacing: '-1px',
};

const statusLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '1.5px',
  marginTop: '4px',
};

const controlsRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '16px',
};

const settingGroupCardStyle: React.CSSProperties = {
  padding: '16px',
  borderRadius: '20px',
};

const settingGroupTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  marginBottom: '10px',
  color: 'var(--text-muted)',
};

const durationPillsRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const durationPillStyle: React.CSSProperties = {
  flex: 1,
  height: '34px',
  borderRadius: '10px',
  border: 'none',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'background-color 0.2s, color 0.2s',
};

const dropdownWrapperStyle: React.CSSProperties = {
  width: '100%',
};

// Overlay Dialog styles
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

const dialogStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '440px',
  borderRadius: '24px',
  padding: '32px 24px',
  textAlign: 'center',
  border: '1px solid var(--border-color)',
};

const dialogBtnGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  marginBottom: '12px',
};

const dialogBtnStyle: React.CSSProperties = {
  padding: '12px',
  fontSize: '14px',
  fontWeight: 700,
  borderRadius: '12px',
  width: '100%',
  boxShadow: 'none',
};

const dialogCloseBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '8px',
  textDecoration: 'underline',
};
