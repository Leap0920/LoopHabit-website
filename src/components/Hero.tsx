'use client';

import React, { useState, useEffect } from 'react';
import { Download, Play, Settings, Timer, BarChart3, CheckSquare, ChevronRight, Flame } from 'lucide-react';

interface HeroProps {
  onScrollToDemo: () => void;
}

export default function Hero({ onScrollToDemo }: HeroProps) {
  // Mock live animation inside the phone screen
  const [completedCount, setCompletedCount] = useState(1);
  const [isSwiping, setIsSwiping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsSwiping(true);
      setTimeout(() => {
        setCompletedCount((prev) => (prev % 3) + 1);
        setIsSwiping(false);
      }, 800); // swipe transition duration
    }, 4500); // cycle every 4.5 seconds

    return () => clearInterval(interval);
  }, []);

  const progressPct = Math.round((completedCount / 3) * 100);

  return (
    <section id="hero" style={heroSectionStyle}>
      <div className="hero-content" style={heroContentStyle}>
        <div className="hero-left-col" style={leftColStyle}>
          <div style={versionBadgeStyle}>🚀 v1.0.1 Release Active</div>
          <h1 className="hero-title" style={titleStyle}>
            Master Your Habits <br />
            <span className="gradient-text">One Loop At A Time</span>
          </h1>
          <p style={descStyle}>
            LoopHabit is a modern habit tracker built for Android. Group your goals into loops, track numerical progress, log sessions with focus timers, and visualize your streaks with beautiful performance charts.
          </p>

          <div className="hero-cta-container" style={ctaContainerStyle}>
            <a 
              href="/LoopHabit-debug.apk" 
              download="LoopHabit-debug.apk"
              className="btn-primary" 
              style={mainDownloadBtnStyle}
            >
              <Download size={22} />
              <div style={btnTextContainerStyle}>
                <span style={btnLabelStyle}>Download APK</span>
                <span style={btnSubLabelStyle}>Direct Android Download (26.8 MB)</span>
              </div>
            </a>

            <button 
              onClick={onScrollToDemo}
              className="btn-secondary"
              style={tryDemoBtnStyle}
            >
              <Play size={16} fill="currentColor" />
              <span>Try Interactive Sandbox</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="hero-badge-row" style={badgeRowStyle}>
            <div style={badgeItemStyle}>✓ Ad-Free</div>
            <div style={badgeItemStyle}>✓ Local First</div>
            <div style={badgeItemStyle}>✓ Cloud Sync</div>
          </div>
        </div>

        <div style={rightColStyle}>
          {/* Smartphone CSS Mockup */}
          <div className="floating" style={phoneFrameStyle}>
            <div style={phoneSpeakerStyle} />
            <div style={phoneScreenStyle}>
              {/* Phone App Header */}
              <div style={appHeaderStyle}>
                <img 
                  src="/logo1.png" 
                  alt="LoopHabit Logo" 
                  style={{ height: '22px', width: 'auto', borderRadius: '4px' }} 
                />
                <span style={logoTextStyle}>LoopHabit</span>
                <Settings size={14} style={{ opacity: 0.6 }} />
              </div>

              {/* Phone App Progress Widget */}
              <div style={phoneProgressCardStyle}>
                <div style={{ flex: 1 }}>
                  <div style={phoneProgressTitleStyle}>Today's Loop</div>
                  <div style={phoneProgressSubStyle}>{completedCount} of 3 completed</div>
                </div>
                <div style={progressCircleContainerStyle}>
                  <svg width="46" height="46" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="21" fill="none" stroke="var(--border-color)" strokeWidth="4" />
                    <circle 
                      cx="25" 
                      cy="25" 
                      r="21" 
                      fill="none" 
                      stroke="var(--primary)" 
                      strokeWidth="4" 
                      strokeDasharray="131.9" 
                      strokeDashoffset={131.9 - (131.9 * completedCount) / 3}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                    />
                  </svg>
                  <span style={progressPercentTextStyle}>{progressPct}%</span>
                </div>
              </div>

              {/* Phone App Card Stack */}
              <div style={phoneStackContainerStyle}>
                {/* Back card */}
                {completedCount === 1 && (
                  <div style={{ ...phoneCardStyle, ...backCard1Style }} />
                )}
                {/* Middle card */}
                <div style={{ ...phoneCardStyle, ...middleCardStyle }} />
                
                {/* Active Card (Animated Swiping) */}
                <div style={{ 
                  ...phoneCardStyle, 
                  ...activeCardStyle,
                  transform: isSwiping ? 'translateX(180px) rotate(15deg) translateY(-20px)' : 'none',
                  opacity: isSwiping ? 0 : 1,
                  background: activeCardColor(completedCount),
                }}>
                  <div style={cardHeaderStyle}>
                    <span style={cardTitleStyle}>{activeCardTitle(completedCount)}</span>
                    <span style={cardCategoryStyle}>
                      <Flame size={10} style={{ display: 'inline', marginRight: '3px' }} />
                      {activeCardStreak(completedCount)}d streak
                    </span>
                  </div>
                  
                  <div style={cardProgressContainerStyle}>
                    <div style={cardGoalLabelStyle}>{activeCardGoal(completedCount)}</div>
                    <div style={mockSwipeIndicatorStyle}>
                      Swipe Right to Log →
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Indicators */}
              <div style={phoneNavBarStyle}>
                <div style={{ ...phoneNavItemStyle, color: 'var(--primary)' }}>
                  <CheckSquare size={12} style={mockNavIconStyle} />
                  <span>Today</span>
                </div>
                <div style={phoneNavItemStyle}>
                  <Timer size={12} style={mockNavIconStyle} />
                  <span>Focus</span>
                </div>
                <div style={phoneNavItemStyle}>
                  <BarChart3 size={12} style={mockNavIconStyle} />
                  <span>Stats</span>
                </div>
              </div>
            </div>
            <div style={phoneHomeButtonStyle} />
          </div>
        </div>
      </div>
    </section>
  );
}

// Helpers for cycling phone screen content
function activeCardTitle(count: number) {
  if (count === 1) return 'Daily Hydration';
  if (count === 2) return 'Mindfulness Meditation';
  return 'Read a Book';
}

function activeCardStreak(count: number) {
  if (count === 1) return '12';
  if (count === 2) return '8';
  return '5';
}

function activeCardGoal(count: number) {
  if (count === 1) return 'Goal: 8 glasses (numerical)';
  if (count === 2) return 'Goal: 15 mins daily';
  return 'Goal: 30 pages daily';
}

function activeCardColor(count: number) {
  if (count === 1) return '#118AB2';
  if (count === 2) return '#06D6A0';
  return '#8338EC';
}

// Layout Styles
const heroSectionStyle: React.CSSProperties = {
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  padding: '120px 24px 80px 24px',
  maxWidth: '1200px',
  margin: '0 auto',
  overflow: 'hidden',
};

const glow1Style: React.CSSProperties = {
  width: '300px',
  height: '300px',
  left: '-50px',
  top: '20%',
};

const glow2Style: React.CSSProperties = {
  width: '400px',
  height: '400px',
  right: '-100px',
  bottom: '10%',
};

const heroContentStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.2fr 0.8fr',
  gap: '64px',
  alignItems: 'center',
  width: '100%',
};

const leftColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const versionBadgeStyle: React.CSSProperties = {
  alignSelf: 'flex-start',
  background: 'var(--surface-variant)',
  border: '1px solid var(--border-color)',
  padding: '6px 16px',
  borderRadius: '50px',
  fontSize: '13px',
  fontWeight: 700,
  color: 'var(--primary)',
};

const titleStyle: React.CSSProperties = {
  fontSize: '56px',
  fontWeight: 900,
  lineHeight: 1.15,
  letterSpacing: '-1.5px',
};

const descStyle: React.CSSProperties = {
  fontSize: '18px',
  lineHeight: 1.6,
  color: 'var(--text-muted)',
};

const ctaContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  marginTop: '12px',
};

const mainDownloadBtnStyle: React.CSSProperties = {
  padding: '16px 32px',
  borderRadius: '20px',
  boxShadow: 'var(--shadow-primary)',
};

const btnTextContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const btnLabelStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 800,
  lineHeight: 1.2,
};

const btnSubLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  opacity: 0.8,
  fontWeight: 500,
};

const tryDemoBtnStyle: React.CSSProperties = {
  padding: '16px 28px',
  borderRadius: '20px',
  fontSize: '15px',
};

const badgeRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '24px',
  marginTop: '12px',
};

const badgeItemStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: 'var(--text-muted)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const rightColStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

/* Smartphone Mockup CSS Styles */
const phoneFrameStyle: React.CSSProperties = {
  width: '280px',
  height: '560px',
  borderRadius: '40px',
  background: '#15171e',
  border: '12px solid #000000',
  boxShadow: 'var(--shadow-lg), inset 0 2px 4px rgba(255,255,255,0.05)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  padding: '10px 4px',
};

const phoneSpeakerStyle: React.CSSProperties = {
  width: '50px',
  height: '4px',
  background: '#2d3139',
  borderRadius: '2px',
  margin: '0 auto 10px auto',
};

const phoneScreenStyle: React.CSSProperties = {
  flex: 1,
  background: 'var(--surface-color)',
  borderRadius: '28px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

const phoneHomeButtonStyle: React.CSSProperties = {
  width: '100px',
  height: '4px',
  background: '#2d3139',
  borderRadius: '2px',
  margin: '10px auto 0 auto',
};

// Mock App elements inside the phone screen
const appHeaderStyle: React.CSSProperties = {
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  borderBottom: '1px solid var(--border-color)',
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 800,
  flex: 1,
  marginLeft: '8px',
};

const phoneProgressCardStyle: React.CSSProperties = {
  background: 'var(--surface-variant)',
  margin: '12px',
  padding: '12px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
};

const phoneProgressTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
};

const phoneProgressSubStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-muted)',
};

const progressCircleContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const progressPercentTextStyle: React.CSSProperties = {
  position: 'absolute',
  fontSize: '10px',
  fontWeight: 800,
};

// Card Stack inside app mockup
const phoneStackContainerStyle: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  margin: '16px 20px',
};

const phoneCardStyle: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: '240px',
  borderRadius: '20px',
  padding: '16px',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  transition: 'transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.8s ease',
};

const backCard1Style: React.CSSProperties = {
  transform: 'scale(0.9) translateY(24px)',
  background: '#8338EC',
  opacity: 0.4,
  zIndex: 1,
};

const middleCardStyle: React.CSSProperties = {
  transform: 'scale(0.95) translateY(12px)',
  background: '#06D6A0',
  opacity: 0.7,
  zIndex: 2,
};

const activeCardStyle: React.CSSProperties = {
  zIndex: 3,
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
};

const cardCategoryStyle: React.CSSProperties = {
  fontSize: '11px',
  background: 'rgba(255,255,255,0.2)',
  padding: '2px 8px',
  borderRadius: '20px',
  alignSelf: 'flex-start',
  fontWeight: 600,
  display: 'inline-flex',
  alignItems: 'center',
};

const cardProgressContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const cardGoalLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  opacity: 0.9,
};

const mockSwipeIndicatorStyle: React.CSSProperties = {
  fontSize: '10px',
  alignSelf: 'center',
  opacity: 0.6,
  fontWeight: 600,
  animation: 'pulse 1.5s infinite',
};

const phoneNavBarStyle: React.CSSProperties = {
  height: '48px',
  borderTop: '1px solid var(--border-color)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  background: 'var(--surface-color)',
  padding: '0 8px',
};

const phoneNavItemStyle: React.CSSProperties = {
  fontSize: '9px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2px',
};

const mockNavIconStyle: React.CSSProperties = {
  opacity: 0.8,
};
