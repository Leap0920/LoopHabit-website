'use client';

import React from 'react';
import { Layers, Timer, BarChart3, Trophy, Hash, Cloud } from 'lucide-react';

export default function Features() {
  const featuresList = [
    {
      icon: <Layers size={26} style={{ color: 'var(--primary)' }} />,
      title: 'Loop Card Stack',
      desc: 'No more cluttered checklists. Focus on one habit at a time using our swipeable 3D card stack. Swipe right to complete, left to skip.'
    },
    {
      icon: <Timer size={26} style={{ color: 'var(--tertiary)' }} />,
      title: 'Integrated Focus Timer',
      desc: 'Dedicate deep work blocks to your habits. Features both countdown Pomodoro timers and active stopwatches tied directly to your custom habits.'
    },
    {
      icon: <BarChart3 size={26} style={{ color: 'var(--secondary)' }} />,
      title: 'Performance Charts',
      desc: 'Visualize your progress with custom 14-day history activity grids, day-of-week consistency charts, and detailed focus session breakdown bars.'
    },
    {
      icon: <Trophy size={26} style={{ color: 'var(--warning)' }} />,
      title: 'Achievement Milestones',
      desc: 'Stay motivated with 6 unique unlockable trophies. Reach 3, 7, 14, and 30-day streaks or maintain high consistency percentages.'
    },
    {
      icon: <Hash size={26} style={{ color: 'var(--orange)' }} />,
      title: 'Numerical Logging',
      desc: 'Track habits with numerical units. Set goals like "Drink 8 glasses of water" or "Do 50 push-ups" and log exact values each day.'
    },
    {
      icon: <Cloud size={26} style={{ color: 'var(--accent-blue)' }} />,
      title: 'Supabase Cloud Sync',
      desc: 'Sync your habits, completions, and sessions instantly across devices. Supports local-first storage and automatic offline-mode sync.'
    }
  ];

  return (
    <section id="features" style={sectionStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>Engineered For Habit Formation</h2>
        <p style={subtitleStyle}>LoopHabit combines simple gestures with powerful analytics to keep you consistent.</p>
      </div>

      <div className="grid-container">
        {featuresList.map((feature, idx) => (
          <div key={idx} className="glass-card" style={cardStyle}>
            <div style={iconBoxStyle}>{feature.icon}</div>
            <h3 style={cardTitleStyle}>{feature.title}</h3>
            <p style={cardDescStyle}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  padding: '80px 24px',
  maxWidth: '1200px',
  margin: '0 auto',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '50px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '38px',
  fontWeight: 800,
  letterSpacing: '-0.5px',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '16px',
  color: 'var(--text-muted)',
  maxWidth: '600px',
  margin: '0 auto',
};

const cardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  alignItems: 'flex-start',
};

const iconBoxStyle: React.CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  background: 'var(--surface-variant)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)',
  border: '1px solid var(--border-color)',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
};

const cardDescStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: 1.5,
  color: 'var(--text-muted)',
};
