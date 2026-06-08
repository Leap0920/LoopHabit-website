'use client';

import React from 'react';
import { 
  Award, 
  Sprout, 
  Flame, 
  Trophy, 
  Gem, 
  Zap, 
  Lock, 
  Timer, 
  BarChart3, 
  CalendarRange 
} from 'lucide-react';
import { Habit, HabitCompletion, FocusSession, formatDateString } from '../utils/db';

interface InsightsDashboardProps {
  habits: Habit[];
  completions: HabitCompletion[];
  focusSessions: FocusSession[];
}

export default function InsightsDashboard({
  habits,
  completions,
  focusSessions
}: InsightsDashboardProps) {
  const today = new Date();
  const todayStr = formatDateString(today);

  // 1. Calculations:
  const totalCompletions = completions.length;

  // Last 30 days overall consistency metric
  const last30Days: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    last30Days.push(formatDateString(d));
  }

  const completionsInLast30 = completions.filter((c) => last30Days.includes(c.date)).length;
  const maxPossibleCompletions = habits.length * 30;
  const overallConsistency = maxPossibleCompletions > 0 
    ? Math.round((completionsInLast30 / maxPossibleCompletions) * 100) 
    : 0;

  // Calculate Streaks
  const calculateStreaks = (dates: string[]): { current: number; best: number } => {
    if (dates.length === 0) return { current: 0, best: 0 };
    
    const sortedDates = Array.from(new Set(dates)).sort();
    let best = 1;
    let current = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        current += 1;
        best = Math.max(best, current);
      } else if (diffDays > 1) {
        current = 1;
      }
    }

    const lastDateStr = sortedDates[sortedDates.length - 1];
    const lastDate = new Date(lastDateStr);
    const timeDiff = Math.abs(today.getTime() - lastDate.getTime());
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    const isCurrentActive = daysDiff <= 1;
    const finalCurrent = isCurrentActive ? current : 0;

    return { current: finalCurrent, best };
  };

  const habitStreaks = habits.map((habit) => {
    const habitCompletions = completions.filter((c) => c.habitId === habit.id).map((c) => c.date);
    const { current, best } = calculateStreaks(habitCompletions);
    return { habit, current, best };
  }).sort((a, b) => b.current - a.current);

  const maxBestStreak = habitStreaks.reduce((max, hs) => Math.max(max, hs.best), 0);

  // 14-day history activity list
  const last14DaysDates: Date[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    last14DaysDates.push(d);
  }

  const completionsPerDay = last14DaysDates.map((date) => {
    const dateStr = formatDateString(date);
    const count = completions.filter((c) => c.date === dateStr).length;
    return { date, count };
  });

  const max14DayCompletions = completionsPerDay.reduce((max, d) => Math.max(max, d.count), 0) || 1;

  // Day of Week Frequency Heatmap
  const weekdayCounts = [0, 0, 0, 0, 0, 0, 0];
  completions.forEach((c) => {
    const date = new Date(c.date);
    const day = date.getDay();
    const idx = day === 0 ? 6 : day - 1;
    if (idx >= 0 && idx < 7) {
      weekdayCounts[idx]++;
    }
  });

  const maxWeekdayCount = weekdayCounts.reduce((max, c) => Math.max(max, c), 0) || 1;

  // Achievements Trophy Data (Lucide React nodes)
  const achievements = [
    {
      id: 'first_step',
      title: 'First Step',
      desc: 'Complete 1 habit',
      icon: <Sprout size={22} />,
      isUnlocked: totalCompletions >= 1,
      progressText: `${Math.min(totalCompletions, 1)}/1`,
      color: '#06D6A0'
    },
    {
      id: 'streak_3',
      title: '3-Day Streak',
      desc: 'Reach a 3-day streak',
      icon: <Flame size={22} />,
      isUnlocked: maxBestStreak >= 3,
      progressText: `${maxBestStreak}/3`,
      color: '#FF9F1C'
    },
    {
      id: 'streak_7',
      title: '7-Day Streak',
      desc: 'Reach a 7-day streak',
      icon: <Trophy size={22} />,
      isUnlocked: maxBestStreak >= 7,
      progressText: `${maxBestStreak}/7`,
      color: '#EF476F'
    },
    {
      id: 'streak_14',
      title: '14-Day Champion',
      desc: 'Reach a 14-day streak',
      icon: <Award size={22} />,
      isUnlocked: maxBestStreak >= 14,
      progressText: `${maxBestStreak}/14`,
      color: '#8338EC'
    },
    {
      id: 'streak_30',
      title: '30-Day Legend',
      desc: 'Reach a 30-day streak',
      icon: <Gem size={22} />,
      isUnlocked: maxBestStreak >= 30,
      progressText: `${maxBestStreak}/30`,
      color: '#118AB2'
    },
    {
      id: 'consistency_80',
      title: 'Consistency Champ',
      desc: 'Maintain 80%+ consistency',
      icon: <Zap size={22} />,
      isUnlocked: overallConsistency >= 80 && habits.length > 0,
      progressText: `${overallConsistency}%/80%`,
      color: '#FFD166'
    }
  ];

  // Focus Stats
  const totalFocusSeconds = focusSessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalFocusMinutes = Math.round(totalFocusSeconds / 60);
  const avgFocusMinutes = focusSessions.length > 0 
    ? Math.round(totalFocusMinutes / focusSessions.length) 
    : 0;

  // Focus Breakdown per Habit
  const focusByHabitMap: { [id: number]: number } = {};
  let generalFocusSeconds = 0;

  focusSessions.forEach((s) => {
    if (s.habitId) {
      focusByHabitMap[s.habitId] = (focusByHabitMap[s.habitId] || 0) + s.durationSeconds;
    } else {
      generalFocusSeconds += s.durationSeconds;
    }
  });

  const focusBreakdown = Object.keys(focusByHabitMap).map((idStr) => {
    const id = Number(idStr);
    const habit = habits.find((h) => h.id === id);
    const seconds = focusByHabitMap[id];
    const mins = Math.round(seconds / 60);
    const pct = totalFocusSeconds > 0 ? (seconds / totalFocusSeconds) : 0;
    return {
      title: habit ? habit.title : 'Deleted Habit',
      color: habit ? habit.colorHex : 'var(--text-light)',
      mins,
      pct
    };
  });

  if (generalFocusSeconds > 0) {
    focusBreakdown.push({
      title: 'General Focus',
      color: '#8e9aaf',
      mins: Math.round(generalFocusSeconds / 60),
      pct: totalFocusSeconds > 0 ? (generalFocusSeconds / totalFocusSeconds) : 0
    });
  }

  focusBreakdown.sort((a, b) => b.mins - a.mins);

  return (
    <div style={containerStyle}>
      {/* 1. Core Analytics Cards */}
      <div style={grid2ColStyle}>
        <div className="glass-card" style={{ ...cardGradientStyle, background: 'rgba(131, 56, 236, 0.03)' }}>
          <span style={cardLabelStyle}>Consistency (30d)</span>
          <span style={{ ...cardValueStyle, color: 'var(--primary)' }}>{overallConsistency}%</span>
        </div>
        <div className="glass-card" style={{ ...cardGradientStyle, background: 'rgba(17, 138, 178, 0.03)' }}>
          <span style={cardLabelStyle}>Total Completions</span>
          <span style={{ ...cardValueStyle, color: 'var(--tertiary)' }}>{totalCompletions}</span>
        </div>
      </div>

      {/* 2. Achievements Milestones */}
      <div>
        <h4 style={sectionHeaderStyle}>
          <Award size={18} style={headerIconStyle} />
          <span>Achievements & Milestones</span>
        </h4>
        
        <div style={achievementRowStyle}>
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className="glass-card" 
              style={{
                ...achievementCardStyle,
                border: achievement.isUnlocked ? `1.5px solid ${achievement.color}40` : '1px solid var(--border-color)',
                opacity: achievement.isUnlocked ? 1 : 0.5
              }}
            >
              <div 
                style={{ 
                  ...achievementIconWrapStyle, 
                  backgroundColor: achievement.isUnlocked ? `${achievement.color}15` : 'var(--surface-variant)',
                  color: achievement.isUnlocked ? achievement.color : 'var(--text-light)'
                }}
              >
                {achievement.isUnlocked ? achievement.icon : <Lock size={18} />}
              </div>
              <span style={achievementTitleStyle}>{achievement.title}</span>
              <span style={achievementDescStyle}>{achievement.desc}</span>
              <span 
                style={{ 
                  ...achievementProgressStyle, 
                  color: achievement.isUnlocked ? achievement.color : 'var(--text-light)' 
                }}
              >
                {achievement.progressText}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 14-Day Activity Chart */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h4 style={chartTitleStyle}>
          <CalendarRange size={16} style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline' }} />
          <span>Activity (Last 14 Days)</span>
        </h4>
        <div style={chartContainerStyle}>
          {completionsPerDay.map((item, idx) => {
            const ratio = item.count / max14DayCompletions;
            const barHeight = Math.max(ratio * 70, 4);
            const isToday = formatDateString(item.date) === todayStr;

            return (
              <div key={idx} style={chartColumnStyle}>
                <span style={barValueStyle}>{item.count}</span>
                <div 
                  style={{
                    ...chartBarStyle,
                    height: `${barHeight}px`,
                    backgroundColor: isToday ? 'var(--primary)' : 'rgba(131, 56, 236, 0.4)'
                  }}
                  title={`${item.count} completions on ${formatDateString(item.date)}`}
                />
                <span style={barLabelStyle}>
                  {item.date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Weekday Distribution */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h4 style={chartTitleStyle}>
          <BarChart3 size={16} style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline' }} />
          <span>Consistency by Weekday</span>
        </h4>
        <div style={chartContainerStyle}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
            const count = weekdayCounts[idx];
            const ratio = count / maxWeekdayCount;
            const barHeight = Math.max(ratio * 70, 4);

            return (
              <div key={idx} style={chartColumnStyle}>
                <span style={barValueStyle}>{count}</span>
                <div 
                  style={{
                    ...chartBarStyle,
                    height: `${barHeight}px`,
                    backgroundColor: 'var(--secondary)'
                  }}
                  title={`${count} completions on ${day}s`}
                />
                <span style={barLabelStyle}>{day[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Focus Analytics */}
      <div>
        <h4 style={sectionHeaderStyle}>
          <Timer size={18} style={headerIconStyle} />
          <span>Focus Session Analytics</span>
        </h4>
        
        <div style={grid2ColStyle}>
          <div className="glass-card" style={focusStatsCardStyle}>
            <span style={focusStatsLabelStyle}>Total Focused Time</span>
            <span style={focusStatsValueStyle}>{totalFocusMinutes} mins</span>
          </div>
          <div className="glass-card" style={focusStatsCardStyle}>
            <span style={focusStatsLabelStyle}>Avg Session Duration</span>
            <span style={focusStatsValueStyle}>{avgFocusMinutes} mins</span>
          </div>
        </div>

        {/* Focus Breakdown Bars */}
        {focusSessions.length > 0 && (
          <div className="glass-card" style={{ padding: '20px', marginTop: '16px' }}>
            <h5 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              FOCUS DISTRIBUTION PER HABIT
            </h5>
            <div style={breakdownListStyle}>
              {focusBreakdown.map((item, idx) => (
                <div key={idx} style={breakdownRowStyle}>
                  <div style={breakdownHeaderStyle}>
                    <span style={breakdownTitleStyle}>{item.title}</span>
                    <span style={breakdownMinutesStyle}>
                      {item.mins}m ({Math.round(item.pct * 100)}%)
                    </span>
                  </div>
                  <div style={trackBarStyle}>
                    <div 
                      style={{
                        ...fillBarStyle,
                        width: `${item.pct * 100}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 6. Habits Leaderboard */}
      <div>
        <h4 style={sectionHeaderStyle}>
          <Trophy size={18} style={headerIconStyle} />
          <span>Habits Leaderboard</span>
        </h4>
        
        <div className="glass-card" style={{ padding: '8px' }}>
          {habitStreaks.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
              No habits created to rank.
            </p>
          ) : (
            <div style={leaderboardListStyle}>
              {habitStreaks.map(({ habit, current, best }) => {
                // Completions this week (Mon-Sun)
                const startOfWeek = new Date(today);
                const day = startOfWeek.getDay();
                const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
                startOfWeek.setDate(diff);

                const weekDays: string[] = [];
                for (let i = 0; i < 7; i++) {
                  const d = new Date(startOfWeek);
                  d.setDate(startOfWeek.getDate() + i);
                  weekDays.push(formatDateString(d));
                }

                const thisWeekCompletions = completions.filter(
                  (c) => c.habitId === habit.id && weekDays.includes(c.date)
                ).length;

                return (
                  <div key={habit.id} style={leaderboardRowStyle}>
                    <div style={leaderboardLeftStyle}>
                      <span style={{ ...colorDotStyle, backgroundColor: habit.colorHex }} />
                      <div style={leaderboardTitleGroupStyle}>
                        <span style={leaderboardNameStyle}>{habit.title}</span>
                        <span style={leaderboardGoalStyle}>
                          Goal: {thisWeekCompletions}/{habit.targetDaysPerWeek} this week
                        </span>
                      </div>
                    </div>
                    <div style={leaderboardRightStyle}>
                      {current > 0 && (
                        <span style={{ ...streakLabelStyle, color: habit.colorHex }}>
                          <Flame size={12} style={{ display: 'inline', marginRight: '3px', verticalAlign: 'middle' }} />
                          {current}d streak
                        </span>
                      )}
                      <span style={bestStreakLabelStyle}>
                        🏆 Best: {best}d
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
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

const grid2ColStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const cardGradientStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  borderRadius: '20px',
  padding: '16px',
  border: '1px solid var(--border-color)',
};

const cardLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const cardValueStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 900,
};

const sectionHeaderStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--text-muted)',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
};

const headerIconStyle: React.CSSProperties = {
  marginRight: '8px',
};

// Achievements
const achievementRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  overflowX: 'auto',
  paddingBottom: '10px',
  scrollbarWidth: 'thin',
};

const achievementCardStyle: React.CSSProperties = {
  flexShrink: 0,
  width: '135px',
  borderRadius: '20px',
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

const achievementIconWrapStyle: React.CSSProperties = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '8px',
};

const achievementTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 800,
  marginBottom: '2px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '100%',
};

const achievementDescStyle: React.CSSProperties = {
  fontSize: '10px',
  color: 'var(--text-muted)',
  lineHeight: 1.25,
  height: '24px',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  marginBottom: '6px',
};

const achievementProgressStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 800,
};

// Chart
const chartTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
};

const chartContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  height: '100px',
  gap: '8px',
  overflowX: 'auto',
  paddingBottom: '4px',
};

const chartColumnStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  minWidth: '24px',
};

const barValueStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  marginBottom: '4px',
};

const chartBarStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '4px 4px 0 0',
  transition: 'height 0.5s ease',
};

const barLabelStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--text-light)',
  marginTop: '4px',
};

// Focus sessions list
const focusStatsCardStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  border: '1px solid var(--border-color)',
};

const focusStatsLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--text-muted)',
};

const focusStatsValueStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 800,
};

const breakdownListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const breakdownRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const breakdownHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
};

const breakdownTitleStyle: React.CSSProperties = {
  fontWeight: 700,
};

const breakdownMinutesStyle: React.CSSProperties = {
  color: 'var(--text-muted)',
  fontWeight: 600,
};

const trackBarStyle: React.CSSProperties = {
  height: '8px',
  background: 'var(--surface-variant)',
  borderRadius: '4px',
  overflow: 'hidden',
  width: '100%',
};

const fillBarStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.5s ease',
};

// Leaderboard
const leaderboardListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const leaderboardRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  borderBottom: '1px solid var(--border-color)',
};

const leaderboardLeftStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const colorDotStyle: React.CSSProperties = {
  width: '10px',
  height: '10px',
  borderRadius: '50%',
};

const leaderboardTitleGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const leaderboardNameStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
};

const leaderboardGoalStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-muted)',
};

const leaderboardRightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const streakLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 800,
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px'
};

const bestStreakLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  fontWeight: 700,
};
