'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HabitCardStack from '../components/HabitCardStack';
import FocusTimer from '../components/FocusTimer';
import InsightsDashboard from '../components/InsightsDashboard';
import AddHabitModal from '../components/AddHabitModal';
import SettingsModal from '../components/SettingsModal';
import { Layers, Timer, BarChart3, Settings, Plus, Download } from 'lucide-react';

import {
  Habit,
  HabitCompletion,
  FocusSession,
  seedDatabase,
  getHabits,
  getCompletions,
  getFocusSessions,
  getPreferences,
  savePreferences,
  saveHabits,
  saveCompletions,
  saveFocusSessions,
  formatDateString
} from '../utils/db';

export default function Home() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  // Data States
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  
  // Sandbox State
  const [sandboxTab, setSandboxTab] = useState<'TODAY' | 'FOCUS' | 'INSIGHTS'>('TODAY');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Initialize DB and load data
  useEffect(() => {
    seedDatabase();
    refreshData();
    
    const prefs = getPreferences();
    setDarkMode(prefs.darkModeEnabled);
    if (prefs.darkModeEnabled) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    setDataLoaded(true);
  }, []);

  const refreshData = () => {
    setHabits(getHabits());
    setCompletions(getCompletions());
    setFocusSessions(getFocusSessions());
  };

  const handleToggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    const prefs = getPreferences();
    prefs.darkModeEnabled = nextVal;
    savePreferences(prefs);

    if (nextVal) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Habit CRUD Actions
  const handleAddHabit = (
    title: string,
    colorHex: string,
    targetDays: number,
    isNum: boolean,
    goal: number,
    unit: string,
    pattern: string
  ) => {
    const list = getHabits();
    const newId = list.length > 0 ? Math.max(...list.map((h) => h.id)) + 1 : 1;
    
    const newHabit: Habit = {
      id: newId,
      userId: 1,
      title,
      colorHex,
      createdAt: Date.now(),
      targetDaysPerWeek: targetDays,
      isNumerical: isNum,
      numericalGoal: goal,
      numericalUnit: unit,
      daysOfWeekPattern: pattern
    };

    const nextList = [...list, newHabit];
    saveHabits(nextList);
    setHabits(nextList);
    setShowAddModal(false);
  };

  const handleDeleteHabit = (id: number) => {
    const list = getHabits();
    const nextList = list.filter((h) => h.id !== id);
    saveHabits(nextList);
    
    const comps = getCompletions().filter((c) => c.habitId !== id);
    saveCompletions(comps);
    
    const sessions = getFocusSessions().filter((s) => s.habitId !== id);
    saveFocusSessions(sessions);

    refreshData();
  };

  const handleCompleteHabit = (habitId: number, value: number, notes: string | null) => {
    const list = getCompletions();
    const todayStr = formatDateString(new Date());

    const existingIdx = list.findIndex((c) => c.habitId === habitId && c.date === todayStr);
    
    const newId = list.length > 0 ? Math.max(...list.map((c) => c.id)) + 1 : 1;
    const completion: HabitCompletion = {
      id: newId,
      habitId,
      date: todayStr,
      notes,
      value
    };

    let nextCompletions = [...list];
    if (existingIdx !== -1) {
      nextCompletions[existingIdx] = completion;
    } else {
      nextCompletions.push(completion);
    }

    saveCompletions(nextCompletions);
    setCompletions(nextCompletions);
  };

  const handleUncompleteHabit = (habitId: number) => {
    const list = getCompletions();
    const todayStr = formatDateString(new Date());
    
    const nextCompletions = list.filter((c) => !(c.habitId === habitId && c.date === todayStr));
    saveCompletions(nextCompletions);
    setCompletions(nextCompletions);
  };

  const handleLogFocusSession = (habitId: number | null, durationSeconds: number, details: string | null) => {
    const list = getFocusSessions();
    const newId = list.length > 0 ? Math.max(...list.map((s) => s.id)) + 1 : 1;

    const newSession: FocusSession = {
      id: newId,
      userId: 1,
      habitId,
      durationSeconds,
      details,
      timestamp: Date.now()
    };

    const nextSessions = [...list, newSession];
    saveFocusSessions(nextSessions);
    setFocusSessions(nextSessions);
  };

  if (!dataLoaded) {
    return <div style={loadingStyle}>Loading Dashboard...</div>;
  }

  return (
    <main style={{ paddingBottom: '60px' }}>
      {/* 1. Header */}
      <Header 
        darkMode={darkMode} 
        onToggleDarkMode={handleToggleDarkMode} 
        onScrollTo={handleScrollToSection} 
      />

      {/* 2. Hero */}
      <Hero onScrollToDemo={() => handleScrollToSection('demo')} />

      {/* 3. Features Grid */}
      <Features />

      {/* 4. Interactive Sandbox Section */}
      <section id="demo" style={sandboxSectionStyle}>
        <div style={sandboxHeaderWrapStyle}>
          <div style={sandboxHeaderTextStyle}>
            <div style={sandboxBadgeStyle}>Live Web Demo</div>
            <h2 style={sandboxTitleStyle}>Explore the LoopHabit Sandbox</h2>
            <p style={sandboxSubtitleStyle}>
              Interact with a live demo of the Android layout. Try creating new habits, swiping card stacks, running Pomodoro focus blocks, and analyzing mock charts.
            </p>
          </div>

          <div style={sandboxActionBtnsStyle}>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="btn-primary" 
              style={{ ...sandboxActionBtnStyle, background: 'var(--success)', boxShadow: '0 4px 12px rgba(6, 214, 160, 0.2)' }}
            >
              <Plus size={16} />
              <span>Add Custom Habit</span>
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)} 
              className="btn-secondary" 
              style={sandboxActionBtnStyle}
            >
              <Settings size={16} />
              <span>Manage Settings</span>
            </button>
          </div>
        </div>

        {/* The Sandbox Body container */}
        <div className="glass" style={sandboxBodyStyle}>
          {/* Inner Navigation Tabs representing composition navigation */}
          <div style={innerNavTabsStyle}>
            <button
              onClick={() => setSandboxTab('TODAY')}
              style={{
                ...innerNavTabStyle,
                color: sandboxTab === 'TODAY' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: sandboxTab === 'TODAY' ? '3px solid var(--primary)' : '3px solid transparent'
              }}
            >
              <span style={tabLabelInnerStyle}>
                <Layers size={16} />
                <span>Today</span>
              </span>
            </button>
            <button
              onClick={() => setSandboxTab('FOCUS')}
              style={{
                ...innerNavTabStyle,
                color: sandboxTab === 'FOCUS' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: sandboxTab === 'FOCUS' ? '3px solid var(--primary)' : '3px solid transparent'
              }}
            >
              <span style={tabLabelInnerStyle}>
                <Timer size={16} />
                <span>Focus Timer</span>
              </span>
            </button>
            <button
              onClick={() => setSandboxTab('INSIGHTS')}
              style={{
                ...innerNavTabStyle,
                color: sandboxTab === 'INSIGHTS' ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: sandboxTab === 'INSIGHTS' ? '3px solid var(--primary)' : '3px solid transparent'
              }}
            >
              <span style={tabLabelInnerStyle}>
                <BarChart3 size={16} />
                <span>Performance Insights</span>
              </span>
            </button>
          </div>

          {/* Render Active Sandbox View */}
          <div style={tabContentStyle}>
            {sandboxTab === 'TODAY' && (
              <HabitCardStack 
                habits={habits}
                completions={completions}
                onCompleteHabit={handleCompleteHabit}
                onUncompleteHabit={handleUncompleteHabit}
              />
            )}
            
            {sandboxTab === 'FOCUS' && (
              <FocusTimer 
                habits={habits}
                onLogFocusSession={handleLogFocusSession}
                onCompleteHabit={handleCompleteHabit}
              />
            )}
            
            {sandboxTab === 'INSIGHTS' && (
              <InsightsDashboard 
                habits={habits}
                completions={completions}
                focusSessions={focusSessions}
              />
            )}
          </div>
        </div>
      </section>

      {/* 5. Bottom Download CTA Banner */}
      <section style={downloadBannerSectionStyle}>
        <div className="glass-card" style={downloadBannerCardStyle}>
          <div className="glow-bg" style={{ ...bannerGlowStyle, background: 'var(--accent-gradient)' }} />
          <h3 style={bannerTitleStyle}>Build Better Habits Today</h3>
          <p style={bannerDescStyle}>
            Download the official Android client to set home screen widgets, receive reminder notifications, and sync your statistics automatically via your own Supabase database.
          </p>
          <a 
            href="/LoopHabit-debug.apk" 
            download="LoopHabit-debug.apk"
            className="btn-primary" 
            style={bannerCtaBtnStyle}
          >
            <Download size={22} />
            <div style={bannerBtnTextContainerStyle}>
              <span style={bannerBtnLabelStyle}>Download LoopHabit Debug APK</span>
              <span style={bannerBtnSubLabelStyle}>Requires Android 8.0+ | File Size: 26.8 MB</span>
            </div>
          </a>
        </div>
      </section>

      {/* 6. Footer */}
      <footer style={footerStyle}>
        <div style={footerDividerStyle} />
        <p style={footerTextStyle}>
          <img 
            src="/logo1.png" 
            alt="" 
            style={footerLogoStyle} 
          />
          <span>LoopHabit Android companion landing page & sandbox demo. Created using Next.js & Vanilla CSS.</span>
        </p>
      </footer>

      {/* 7. Modals */}
      {showAddModal && (
        <AddHabitModal 
          onDismiss={() => setShowAddModal(false)}
          onAdd={handleAddHabit}
        />
      )}

      {showSettingsModal && (
        <SettingsModal 
          habits={habits}
          onDismiss={() => setShowSettingsModal(false)}
          onDeleteHabit={handleDeleteHabit}
          onDataRefresh={refreshData}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      )}
    </main>
  );
}

// Styles
const loadingStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '20px',
  fontWeight: 700,
  color: 'var(--primary)',
};

const sandboxSectionStyle: React.CSSProperties = {
  padding: '60px 24px',
  maxWidth: '1000px',
  margin: '0 auto',
};

const sandboxHeaderWrapStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  gap: '24px',
  marginBottom: '32px',
};

const sandboxHeaderTextStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '300px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const sandboxBadgeStyle: React.CSSProperties = {
  alignSelf: 'flex-start',
  background: 'rgba(131, 56, 236, 0.1)',
  color: 'var(--primary)',
  padding: '4px 12px',
  borderRadius: '50px',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const sandboxTitleStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 800,
  letterSpacing: '-0.5px',
};

const sandboxSubtitleStyle: React.CSSProperties = {
  fontSize: '15px',
  color: 'var(--text-muted)',
  lineHeight: 1.5,
};

const sandboxActionBtnsStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
};

const sandboxActionBtnStyle: React.CSSProperties = {
  padding: '10px 18px',
  fontSize: '13px',
  fontWeight: 700,
  borderRadius: '12px',
  height: '40px',
  boxShadow: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

const sandboxBodyStyle: React.CSSProperties = {
  borderRadius: '24px',
  padding: '0',
  overflow: 'hidden',
  border: '1px solid var(--border-color)',
};

const innerNavTabsStyle: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid var(--border-color)',
  background: 'var(--surface-variant)',
  opacity: 0.9,
};

const innerNavTabStyle: React.CSSProperties = {
  flex: 1,
  padding: '16px 8px',
  background: 'none',
  border: 'none',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textAlign: 'center',
};

const tabLabelInnerStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  justifyContent: 'center',
};

const tabContentStyle: React.CSSProperties = {
  padding: '24px',
};

// Download Banner styles
const downloadBannerSectionStyle: React.CSSProperties = {
  padding: '40px 24px',
  maxWidth: '960px',
  margin: '0 auto',
};

const downloadBannerCardStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '48px 24px',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  alignItems: 'center',
};

const bannerGlowStyle: React.CSSProperties = {
  width: '300px',
  height: '300px',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  opacity: 0.1,
};

const bannerTitleStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 900,
  letterSpacing: '-0.5px',
};

const bannerDescStyle: React.CSSProperties = {
  fontSize: '15px',
  color: 'var(--text-muted)',
  maxWidth: '560px',
  lineHeight: 1.5,
  marginBottom: '10px',
};

const bannerCtaBtnStyle: React.CSSProperties = {
  padding: '16px 32px',
  borderRadius: '20px',
  boxShadow: 'var(--shadow-primary)',
};

const bannerBtnTextContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
};

const bannerBtnLabelStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 800,
  lineHeight: 1.2,
};

const bannerBtnSubLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  opacity: 0.8,
  fontWeight: 500,
};

// Footer styles
const footerStyle: React.CSSProperties = {
  padding: '40px 24px 0 24px',
  textAlign: 'center',
  maxWidth: '1000px',
  margin: '0 auto',
};

const footerDividerStyle: React.CSSProperties = {
  height: '1px',
  backgroundColor: 'var(--border-color)',
  marginBottom: '24px',
};

const footerTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--text-light)',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  flexWrap: 'wrap',
};

const footerLogoStyle: React.CSSProperties = {
  height: '20px',
  width: 'auto',
  borderRadius: '4px',
  opacity: 0.7,
  verticalAlign: 'middle',
};
