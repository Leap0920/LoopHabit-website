'use client';

import React, { useRef } from 'react';
import { X, Trash2, Download, Upload } from 'lucide-react';
import { Habit, resetDatabase, getHabits, getCompletions, getFocusSessions, saveHabits, saveCompletions, saveFocusSessions } from '../utils/db';

interface SettingsModalProps {
  habits: Habit[];
  onDismiss: () => void;
  onDeleteHabit: (id: number) => void;
  onDataRefresh: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function SettingsModal({
  habits,
  onDismiss,
  onDeleteHabit,
  onDataRefresh,
  darkMode,
  onToggleDarkMode
}: SettingsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // JSON Export Backup
  const handleExportBackup = () => {
    const backupData = {
      habits: getHabits(),
      completions: getCompletions(),
      focusSessions: getFocusSessions()
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'loophabit_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // JSON Import Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const backup = JSON.parse(result);

        if (backup.habits && backup.completions && backup.focusSessions) {
          saveHabits(backup.habits);
          saveCompletions(backup.completions);
          saveFocusSessions(backup.focusSessions);
          alert('Backup restored successfully!');
          onDataRefresh();
          onDismiss();
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON.');
        console.error(err);
      }
    };
    fileReader.readAsText(files[0]);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data? This will overwrite your current progress with default mock data.')) {
      resetDatabase();
      onDataRefresh();
      onDismiss();
    }
  };

  return (
    <div style={overlayStyle} onClick={onDismiss}>
      <div 
        className="glass" 
        style={modalStyle} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={headerStyle}>
          <h3 style={titleStyle}>App Settings</h3>
          <button onClick={onDismiss} style={closeBtnStyle} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div style={scrollContainerStyle}>
          {/* Preferences Section */}
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Appearance</h4>
            <div style={settingRowStyle}>
              <div>
                <div style={settingLabelStyle}>Dark Mode</div>
                <div style={settingDescStyle}>Toggle dark or light theme interface</div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={darkMode}
                  onChange={onToggleDarkMode}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          {/* Manage Habits List */}
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Manage Habits ({habits.length})</h4>
            {habits.length === 0 ? (
              <p style={emptyTextStyle}>No habits added yet.</p>
            ) : (
              <div style={habitListStyle}>
                {habits.map((habit) => (
                  <div key={habit.id} style={habitRowStyle}>
                    <div style={habitInfoStyle}>
                      <span 
                        style={{
                          ...colorDotStyle,
                          backgroundColor: habit.colorHex
                        }} 
                      />
                      <span style={habitNameStyle}>{habit.title}</span>
                      {habit.isNumerical && (
                        <span style={numericalBadgeStyle}>
                          {habit.numericalGoal} {habit.numericalUnit}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => onDeleteHabit(habit.id)}
                      style={deleteBtnStyle}
                      title="Delete Habit"
                    >
                      <Trash2 size={16} style={{ color: 'var(--secondary)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Backup and Restore */}
          <div style={sectionStyle}>
            <h4 style={sectionTitleStyle}>Backup & Recovery</h4>
            <p style={{ ...settingDescStyle, marginBottom: '12px' }}>
              Import or export your database content (habits, completions, and timers) as JSON.
            </p>
            <div style={btnGroupStyle}>
              <button 
                onClick={handleExportBackup} 
                className="btn-secondary" 
                style={actionBtnStyle}
              >
                <Download size={14} />
                <span>Export Backup</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="btn-secondary" 
                style={actionBtnStyle}
              >
                <Upload size={14} />
                <span>Import Backup</span>
              </button>
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportBackup}
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ ...sectionStyle, border: 'none', paddingBottom: 0 }}>
            <h4 style={{ ...sectionTitleStyle, color: 'var(--secondary)' }}>Danger Zone</h4>
            <div style={dangerRowStyle}>
              <div>
                <div style={settingLabelStyle}>Reset Application Data</div>
                <div style={settingDescStyle}>Wipe custom entries and restore to default dashboard data</div>
              </div>
              <button 
                onClick={handleResetData}
                style={dangerBtnStyle}
              >
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles
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
  maxWidth: '500px',
  borderRadius: '24px',
  padding: '24px',
  maxHeight: '85vh',
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid var(--border-color)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  flexShrink: 0,
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

const scrollContainerStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  paddingRight: '4px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const sectionStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--border-color)',
  paddingBottom: '20px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '16px',
};

const settingRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const settingLabelStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
};

const settingDescStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  lineHeight: 1.4,
};

const emptyTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--text-light)',
  fontStyle: 'italic',
};

const habitListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  maxHeight: '160px',
  overflowY: 'auto',
  paddingRight: '4px',
};

const habitRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  background: 'var(--surface-variant)',
  borderRadius: '12px',
};

const habitInfoStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const colorDotStyle: React.CSSProperties = {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  display: 'block',
};

const habitNameStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
};

const numericalBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  background: 'var(--border-color)',
  padding: '2px 8px',
  borderRadius: '8px',
  color: 'var(--text-muted)',
  fontWeight: 600,
};

const deleteBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  padding: '4px',
  borderRadius: '6px',
  transition: 'background 0.2s',
};

const btnGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
};

const actionBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 16px',
  fontSize: '13px',
  height: '38px',
  borderRadius: '12px',
};

const dangerRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: 'rgba(239, 71, 111, 0.05)',
  border: '1px dashed var(--secondary)',
  padding: '16px',
  borderRadius: '16px',
};

const dangerBtnStyle: React.CSSProperties = {
  backgroundColor: 'var(--secondary)',
  color: 'white',
  border: 'none',
  padding: '10px 18px',
  fontSize: '13px',
  fontWeight: 700,
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'transform 0.15s ease',
};
