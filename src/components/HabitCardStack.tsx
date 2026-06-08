'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';
import { Habit, HabitCompletion, formatDateString } from '../utils/db';

interface HabitCardStackProps {
  habits: Habit[];
  completions: HabitCompletion[];
  onCompleteHabit: (habitId: number, value: number, notes: string | null) => void;
  onUncompleteHabit: (habitId: number) => void;
}

export default function HabitCardStack({
  habits,
  completions,
  onCompleteHabit,
  onUncompleteHabit
}: HabitCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [numValue, setNumValue] = useState<string>('');
  const [showLogInput, setShowLogInput] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const todayStr = formatDateString(new Date());

  // Filter habits applicable for today based on daysOfWeekPattern
  const todayDate = new Date();
  const dayOfWeek = todayDate.getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // map Mon=0 ... Sun=6

  const todayHabits = habits.filter((habit) => {
    return habit.daysOfWeekPattern[dayIndex] === '1';
  });

  const completedTodayIds = completions
    .filter((c) => c.date === todayStr)
    .map((c) => c.habitId);

  const incompleteHabits = todayHabits.filter((h) => !completedTodayIds.includes(h.id));
  const completedHabits = todayHabits.filter((h) => completedTodayIds.includes(h.id));

  // Reset index if it gets out of bounds
  useEffect(() => {
    if (currentIndex >= incompleteHabits.length && incompleteHabits.length > 0) {
      setCurrentIndex(0);
    }
  }, [incompleteHabits.length, currentIndex]);

  const activeHabit = incompleteHabits[currentIndex];

  // Pre-fill numerical goal when active habit changes
  useEffect(() => {
    if (activeHabit?.isNumerical) {
      setNumValue(String(activeHabit.numericalGoal));
    } else {
      setNumValue('');
    }
    setShowLogInput(false);
  }, [activeHabit]);

  // Drag Gesture Handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    if (showLogInput) return; // Disable swipe when typing numerical logs
    setIsDragging(true);
    dragStart.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - dragStart.current.x;
    const deltaY = clientY - dragStart.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 120;
    if (dragOffset.x > threshold) {
      triggerCompletion();
    } else if (dragOffset.x < -threshold) {
      handleNextCard();
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const triggerCompletion = () => {
    if (!activeHabit) return;

    if (activeHabit.isNumerical && !showLogInput) {
      setDragOffset({ x: 0, y: 0 });
      setShowLogInput(true);
    } else {
      setDragOffset({ x: 400, y: 0 });
      setTimeout(() => {
        onCompleteHabit(activeHabit.id, 1, null);
        setDragOffset({ x: 0, y: 0 });
        handleNextCardAfterSwipe();
      }, 200);
    }
  };

  const handleNumericalLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHabit) return;
    const valueStr = numValue.trim();
    if (!valueStr) return;

    onCompleteHabit(activeHabit.id, Number(valueStr), 'Logged via Web Dashboard');
    setShowLogInput(false);
    handleNextCard();
  };

  const handleNextCard = () => {
    if (incompleteHabits.length <= 1) return;
    setDragOffset({ x: -400, y: 0 });
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % incompleteHabits.length);
      setDragOffset({ x: 0, y: 0 });
    }, 200);
  };

  const handleNextCardAfterSwipe = () => {
    if (incompleteHabits.length > 1) {
      setCurrentIndex((prev) => prev % (incompleteHabits.length - 1));
    }
  };

  const handlePrevCard = () => {
    if (incompleteHabits.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + incompleteHabits.length) % incompleteHabits.length);
  };

  const totalCount = todayHabits.length;
  const completedCount = completedHabits.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const swipeOpacity = Math.min(Math.abs(dragOffset.x) / 100, 0.9);
  const swipeIndicatorColor = dragOffset.x > 0 
    ? `rgba(6, 214, 160, ${swipeOpacity})`
    : `rgba(239, 71, 111, ${swipeOpacity})`;

  const activeColor = activeHabit ? activeHabit.colorHex : 'var(--primary)';

  return (
    <div style={containerStyle}>
      {/* 1. Progress Indicator */}
      <div className="glass-card" style={progressCardStyle}>
        <div style={progressInfoStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Today's Loop</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {totalCount === 0 
              ? 'No habits scheduled for today' 
              : `${completedCount} of ${totalCount} completed`}
          </p>
        </div>
        <div style={progressCircleContainerStyle}>
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r="28" fill="none" stroke="var(--border-color)" strokeWidth="6" />
            <circle 
              cx="34" 
              cy="34" 
              r="28" 
              fill="none" 
              stroke="var(--primary)" 
              strokeWidth="6" 
              strokeDasharray="175.9" 
              strokeDashoffset={175.9 - (175.9 * progressPct) / 100}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
            />
          </svg>
          <span style={progressPctTextStyle}>{progressPct}%</span>
        </div>
      </div>

      {/* 2. Card Stack */}
      {incompleteHabits.length > 0 && activeHabit ? (
        <div style={stackOuterStyle}>
          <div style={stackViewportStyle}>
            {/* Background layered card 2 */}
            {incompleteHabits.length > 2 && (
              <div 
                className="glass-card" 
                style={{
                  ...stackedCardStyle,
                  transform: 'scale(0.9) translateY(24px)',
                  opacity: 0.35,
                  zIndex: 8,
                  borderColor: 'var(--border-color)'
                }}
              />
            )}

            {/* Background layered card 1 */}
            {incompleteHabits.length > 1 && (
              <div 
                className="glass-card" 
                style={{
                  ...stackedCardStyle,
                  transform: 'scale(0.95) translateY(12px)',
                  opacity: 0.65,
                  zIndex: 9,
                  borderColor: 'var(--border-color)'
                }}
              >
                <div style={stackedCardInnerStyle}>
                  <span style={{ fontWeight: 700 }}>
                    {incompleteHabits[(currentIndex + 1) % incompleteHabits.length].title}
                  </span>
                </div>
              </div>
            )}

            {/* Top Interactive Card */}
            <div
              ref={cardRef}
              className="glass-card"
              style={{
                ...stackedCardStyle,
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.04}deg)`,
                zIndex: 10,
                cursor: showLogInput ? 'default' : (isDragging ? 'grabbing' : 'grab'),
                transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.15)',
                border: `2px solid ${activeColor}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
              onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={handleDragEnd}
            >
              {/* Swipe directional feedback overlays */}
              {Math.abs(dragOffset.x) > 20 && (
                <div style={{ ...swipeOverlayStyle, backgroundColor: swipeIndicatorColor }}>
                  <span style={swipeLabelStyle}>
                    {dragOffset.x > 0 ? 'COMPLETE ✓' : 'SKIP ➔'}
                  </span>
                </div>
              )}

              {/* Card Header */}
              <div style={cardHeaderStyle}>
                <div style={cardHeaderRowStyle}>
                  <span style={{ ...colorDotStyle, backgroundColor: activeColor }} />
                  <span style={cardCategoryTextStyle}>Today's Loop Task</span>
                </div>
                <h4 style={cardTitleTextStyle}>{activeHabit.title}</h4>
              </div>

              {/* Card Body (Numerical logger form OR default swipe instruction) */}
              {showLogInput ? (
                <form onSubmit={handleNumericalLogSubmit} style={loggerFormStyle} onClick={(e) => e.stopPropagation()}>
                  <p style={loggerLabelStyle}>Log input value ({activeHabit.numericalUnit}):</p>
                  <div style={loggerInputRowStyle}>
                    <input
                      type="number"
                      className="form-input"
                      style={loggerInputStyle}
                      value={numValue}
                      onChange={(e) => setNumValue(e.target.value)}
                      min="1"
                      required
                      autoFocus
                    />
                    <button type="submit" className="btn-primary" style={{ ...loggerSubmitBtnStyle, background: activeColor }}>
                      Log Entry
                    </button>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setShowLogInput(false)}
                    style={loggerCancelStyle}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div style={cardBodyStyle}>
                  {activeHabit.isNumerical ? (
                    <div style={goalBadgeStyle}>
                      🎯 Target: {activeHabit.numericalGoal} {activeHabit.numericalUnit}
                    </div>
                  ) : (
                    <div style={goalBadgeStyle}>🎯 Complete Loop</div>
                  )}
                  <p style={cardStreakStyle}>
                    <Flame size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Habit Streak: Active
                  </p>
                </div>
              )}

              {/* Card Footer Gestures Info */}
              {!showLogInput && (
                <div style={cardFooterStyle}>
                  <span>← Swipe Left to Skip</span>
                  <span>Swipe Right to Log →</span>
                </div>
              )}
            </div>
          </div>

          {/* Cards Stack Control Buttons */}
          <div style={stackControlsStyle}>
            <button 
              onClick={handlePrevCard} 
              className="icon-btn" 
              disabled={incompleteHabits.length <= 1}
              style={{ opacity: incompleteHabits.length <= 1 ? 0.4 : 1, borderRadius: '12px', width: '38px', height: '38px' }}
              title="Previous Habit"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={cardCounterTextStyle}>
              Card {currentIndex + 1} of {incompleteHabits.length}
            </span>
            <button 
              onClick={handleNextCard} 
              className="icon-btn"
              disabled={incompleteHabits.length <= 1}
              style={{ opacity: incompleteHabits.length <= 1 ? 0.4 : 1, borderRadius: '12px', width: '38px', height: '38px' }}
              title="Next Habit / Skip"
            >
              <ChevronRight size={16} />
            </button>
            <button 
              onClick={triggerCompletion} 
              className="icon-btn"
              style={{ 
                backgroundColor: 'rgba(6, 214, 160, 0.1)', 
                borderColor: 'var(--success)',
                color: 'var(--success)',
                borderRadius: '12px', 
                width: '38px', 
                height: '38px'
              }}
              title="Complete Habit"
            >
              <Check size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={allDoneCardStyle}>
          <Sparkles size={48} style={{ color: 'var(--warning)', margin: '0 auto 16px auto', display: 'block' }} />
          <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>All Done for Today!</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>
            {totalCount === 0 
              ? 'Add some habits and schedule them for today to start tracking.' 
              : 'Amazing! You have completed all scheduled habits in your loop today.'}
          </p>
        </div>
      )}

      {/* 3. Completed Today List */}
      {completedHabits.length > 0 && (
        <div style={completedSectionStyle}>
          <h4 style={completedTitleStyle}>Completed Today</h4>
          <div style={completedListStyle}>
            {completedHabits.map((habit) => {
              const comp = completions.find((c) => c.habitId === habit.id && c.date === todayStr);
              return (
                <div key={habit.id} className="glass" style={completedRowStyle}>
                  <div style={completedRowInfoStyle}>
                    <span style={{ ...colorDotStyle, backgroundColor: habit.colorHex }} />
                    <span style={completedHabitNameStyle}>{habit.title}</span>
                    {habit.isNumerical && comp && (
                      <span style={completedValueBadgeStyle}>
                        Logged: {comp.value} / {habit.numericalGoal} {habit.numericalUnit}
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => onUncompleteHabit(habit.id)}
                    style={undoBtnStyle}
                    title="Undo Completion"
                  >
                    <RotateCcw size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    <span>Undo</span>
                  </button>
                </div>
              );
            })}
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
  gap: '24px',
  width: '100%',
};

const progressCardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '24px',
};

const progressInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const progressCircleContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const progressPctTextStyle: React.CSSProperties = {
  position: 'absolute',
  fontSize: '13px',
  fontWeight: 800,
};

const stackOuterStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  alignItems: 'center',
  width: '100%',
};

const stackViewportStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '320px',
  display: 'flex',
  justifyContent: 'center',
};

const stackedCardStyle: React.CSSProperties = {
  position: 'absolute',
  width: '100%',
  maxWidth: '420px',
  height: '300px',
  userSelect: 'none',
  transformOrigin: 'bottom center',
};

const stackedCardInnerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.2,
};

const swipeOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  pointerEvents: 'none',
};

const swipeLabelStyle: React.CSSProperties = {
  color: 'white',
  fontWeight: 900,
  fontSize: '24px',
  letterSpacing: '1px',
  background: 'rgba(0,0,0,0.5)',
  padding: '8px 20px',
  borderRadius: '12px',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const cardHeaderRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const colorDotStyle: React.CSSProperties = {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
};

const cardCategoryTextStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const cardTitleTextStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 800,
  lineHeight: 1.25,
};

const cardBodyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  alignItems: 'flex-start',
};

const goalBadgeStyle: React.CSSProperties = {
  background: 'var(--surface-variant)',
  padding: '6px 14px',
  borderRadius: '50px',
  fontSize: '13px',
  fontWeight: 700,
};

const cardStreakStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontWeight: 600,
};

const cardFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '11px',
  color: 'var(--text-light)',
  fontWeight: 600,
  borderTop: '1px solid var(--border-color)',
  paddingTop: '12px',
};

const stackControlsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginTop: '8px',
};

const cardCounterTextStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: 'var(--text-muted)',
};

const allDoneCardStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px 24px',
  borderRadius: '24px',
};

// Numerical logger layout styles
const loggerFormStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  width: '100%',
  alignItems: 'flex-start',
};

const loggerLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: 'var(--text-muted)',
};

const loggerInputRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  width: '100%',
};

const loggerInputStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 12px',
  fontSize: '15px',
  height: '38px',
};

const loggerSubmitBtnStyle: React.CSSProperties = {
  padding: '0 16px',
  fontSize: '13px',
  height: '38px',
  borderRadius: '12px',
  boxShadow: 'none',
};

const loggerCancelStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontWeight: 600,
  cursor: 'pointer',
  padding: '4px 0',
};

// Completed List styles
const completedSectionStyle: React.CSSProperties = {
  marginTop: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const completedTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--text-muted)',
};

const completedListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const completedRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  borderRadius: '16px',
  border: '1px solid var(--border-color)',
};

const completedRowInfoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const completedHabitNameStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'line-through',
  opacity: 0.6,
};

const completedValueBadgeStyle: React.CSSProperties = {
  fontSize: '11px',
  background: 'rgba(6, 214, 160, 0.1)',
  color: 'var(--success)',
  padding: '2px 8px',
  borderRadius: '8px',
  fontWeight: 600,
};

const undoBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--primary)',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer',
};
