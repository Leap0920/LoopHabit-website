'use client';

import React, { useState } from 'react';
import { Tag, Wrench, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface ChangeEntry {
  type: 'fix' | 'feature' | 'improvement';
  text: string;
}

interface VersionEntry {
  version: string;
  date: string;
  label?: string;
  changes: ChangeEntry[];
}

const changelog: VersionEntry[] = [
  {
    version: '1.3',
    date: 'June 10, 2026',
    label: 'Latest',
    changes: [
      {
        type: 'improvement',
        text: 'Completely redesigned Todo list UI with modern header card, gradient stats, circular checkboxes, and smooth edit/delete dialogs.',
      },
      {
        type: 'improvement',
        text: 'Major performance overhaul — replaced coroutine-per-pixel swipe handling with synchronous drag tracking, converted Today tab to LazyColumn for off-screen recycling, and added stable keys to completed habits list.',
      },
      {
        type: 'improvement',
        text: 'Polished completed habit row with consistent 34dp icon buttons, error-tinted undo button, and tighter spacing.',
      },
      {
        type: 'fix',
        text: 'Fixed bottom navigation icon sizing — all 4 icons now use consistent 24dp sizing with proper alignment.',
      },
    ],
  },
  {
    version: '1.2',
    date: 'June 9, 2026',
    changes: [
      {
        type: 'fix',
        text: 'Fixed stopwatch and timer not updating or recording focus sessions when the phone screen is turned off.',
      },
      {
        type: 'fix',
        text: 'Resolved FocusService notification management issues causing state desync on screen lock/unlock.',
      },
      {
        type: 'improvement',
        text: 'Refactored LoopPreferences for more reliable background state persistence.',
      },
      {
        type: 'improvement',
        text: 'Enhanced home screen widget (HabitWidget) with better rendering and data accuracy.',
      },
    ],
  },
  {
    version: '1.1',
    date: 'June 8, 2026',
    changes: [
      {
        type: 'feature',
        text: 'Introduced in-app update system — check, download, and install APK updates without leaving the app.',
      },
      {
        type: 'feature',
        text: 'Added Lucide-style premium outlined icons across performance stats, achievement headers, and focus widgets.',
      },
      {
        type: 'improvement',
        text: 'Polished Focus Screen UI with improved countdown visualization and stopwatch controls.',
      },
      {
        type: 'fix',
        text: 'Fixed reset button in settings not correctly clearing stored preferences.',
      },
    ],
  },
  {
    version: '1.0',
    date: 'June 7, 2026',
    changes: [
      {
        type: 'feature',
        text: 'Initial release with swipeable Today Loop card stack (swipe right to complete, left to skip).',
      },
      {
        type: 'feature',
        text: 'Focus Mode with countdown Pomodoro timer and freeform stopwatch, tied to individual habits.',
      },
      {
        type: 'feature',
        text: 'Insights dashboard with monthly calendar, year-at-a-glance heatmap, streak stats, and achievement milestones.',
      },
      {
        type: 'feature',
        text: 'Supabase cloud sync with local-first Room Database storage and offline fallback.',
      },
      {
        type: 'feature',
        text: 'Jetpack Glance home screen widget and WorkManager automated backup workflows.',
      },
    ],
  },
];

const typeConfig = {
  fix: {
    label: 'Bug Fix',
    icon: <Wrench size={12} />,
    color: '#FF6B6B',
    bg: 'rgba(255,107,107,0.12)',
    border: 'rgba(255,107,107,0.25)',
  },
  feature: {
    label: 'New Feature',
    icon: <Sparkles size={12} />,
    color: '#06D6A0',
    bg: 'rgba(6,214,160,0.12)',
    border: 'rgba(6,214,160,0.25)',
  },
  improvement: {
    label: 'Improvement',
    icon: <Tag size={12} />,
    color: '#8338EC',
    bg: 'rgba(131,56,236,0.12)',
    border: 'rgba(131,56,236,0.25)',
  },
};

export default function Changelog() {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set(['1.3']));

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  return (
    <section id="changelog" style={sectionStyle}>
      <div style={headerStyle}>
        <h2 className="features-title" style={titleStyle}>What&apos;s New</h2>
        <p className="features-subtitle" style={subtitleStyle}>
          Release history and changelog for LoopHabit Android.
        </p>
      </div>

      <div style={timelineStyle}>
        {changelog.map((entry, idx) => {
          const isExpanded = expandedVersions.has(entry.version);
          const isLatest = idx === 0;

          return (
            <div key={entry.version} style={entryWrapStyle}>
              {/* Timeline dot + line */}
              <div style={dotColStyle}>
                <div
                  style={{
                    ...dotStyle,
                    background: isLatest ? 'var(--primary)' : 'var(--border-color)',
                    boxShadow: isLatest ? '0 0 0 4px rgba(131,56,236,0.2)' : 'none',
                  }}
                />
                {idx < changelog.length - 1 && <div style={lineStyle} />}
              </div>

              {/* Version card */}
              <div className="glass-card" style={{ ...cardStyle, marginBottom: idx < changelog.length - 1 ? '0' : '0' }}>
                <button style={cardHeaderStyle} onClick={() => toggleVersion(entry.version)}>
                  <div style={cardHeaderLeftStyle}>
                    <div style={versionRowStyle}>
                      <span style={{ ...versionBadgeStyle, background: isLatest ? 'var(--primary)' : 'var(--surface-variant)', color: isLatest ? '#fff' : 'var(--text-muted)', border: isLatest ? 'none' : '1px solid var(--border-color)' }}>
                        v{entry.version}
                      </span>
                      {entry.label && (
                        <span style={latestPillStyle}>✦ {entry.label}</span>
                      )}
                    </div>
                    <span style={dateStyle}>{entry.date}</span>
                  </div>
                  <div style={chevronStyle}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isExpanded && (
                  <div style={changesListStyle}>
                    {entry.changes.map((change, cIdx) => {
                      const cfg = typeConfig[change.type];
                      return (
                        <div key={cIdx} style={changeRowStyle}>
                          <span style={{ ...typePillStyle, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                            {cfg.icon}
                            {cfg.label}
                          </span>
                          <span style={changeTextStyle}>{change.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Styles
const sectionStyle: React.CSSProperties = {
  padding: '80px 24px',
  maxWidth: '800px',
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
  maxWidth: '500px',
  margin: '0 auto',
};

const timelineStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0',
};

const entryWrapStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
  alignItems: 'flex-start',
};

const dotColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexShrink: 0,
  paddingTop: '18px',
};

const dotStyle: React.CSSProperties = {
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  flexShrink: 0,
};

const lineStyle: React.CSSProperties = {
  width: '2px',
  flex: 1,
  minHeight: '32px',
  background: 'var(--border-color)',
  marginTop: '6px',
};

const cardStyle: React.CSSProperties = {
  flex: 1,
  marginBottom: '20px',
  overflow: 'hidden',
  padding: '0',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '18px 20px',
  width: '100%',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  color: 'var(--text-primary)',
};

const cardHeaderLeftStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const versionRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const versionBadgeStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 800,
  padding: '3px 12px',
  borderRadius: '50px',
  letterSpacing: '0.3px',
};

const latestPillStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--primary)',
  background: 'rgba(131,56,236,0.1)',
  border: '1px solid rgba(131,56,236,0.25)',
  padding: '2px 10px',
  borderRadius: '50px',
  letterSpacing: '0.5px',
};

const dateStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontWeight: 500,
};

const chevronStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  flexShrink: 0,
};

const changesListStyle: React.CSSProperties = {
  padding: '0 20px 18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '16px',
};

const changeRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
};

const typePillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '10px',
  fontWeight: 700,
  padding: '2px 8px',
  borderRadius: '50px',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  marginTop: '1px',
  letterSpacing: '0.3px',
};

const changeTextStyle: React.CSSProperties = {
  fontSize: '14px',
  lineHeight: 1.5,
  color: 'var(--text-muted)',
};
