'use client';

import React from 'react';
import { Sun, Moon, Download } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onScrollTo: (id: string) => void;
}

export default function Header({ darkMode, onToggleDarkMode, onScrollTo }: HeaderProps) {
  return (
    <header className="glass" style={headerStyle}>
      <div style={logoContainerStyle}>
        <img 
          src={darkMode ? "/logo2.png" : "/logo1.png"} 
          alt="LoopHabit Logo" 
          style={logoImageStyle}
          onError={(e) => {
            // Fallback if logo loading fails
            (e.target as HTMLImageElement).src = "/logo1.png";
          }}
        />
        <span style={logoTextStyle}>LoopHabit</span>
      </div>

      <nav style={navStyle}>
        <button onClick={() => onScrollTo('hero')} style={navLinkStyle}>Home</button>
        <button onClick={() => onScrollTo('features')} style={navLinkStyle}>Features</button>
        <button onClick={() => onScrollTo('demo')} style={navLinkStyle}>Try Demo</button>
      </nav>

      <div style={actionsStyle}>
        <button 
          onClick={onToggleDarkMode} 
          className="icon-btn" 
          title="Toggle Theme"
          style={{ width: '40px', height: '40px', borderRadius: '12px' }}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <a 
          href="/LoopHabit-debug.apk" 
          download="LoopHabit-debug.apk"
          className="btn-primary" 
          style={downloadBtnStyle}
        >
          <Download size={16} />
          <span>Download APK</span>
          <span style={badgeStyle}>v1.0</span>
        </a>
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '70px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  zIndex: 1000,
  borderTop: 'none',
  borderLeft: 'none',
  borderRight: 'none',
  borderRadius: '0 0 20px 20px',
};

const logoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

const logoImageStyle: React.CSSProperties = {
  height: '36px',
  width: 'auto',
  borderRadius: '10px',
  objectFit: 'contain',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

const logoTextStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 800,
  letterSpacing: '-0.5px',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
};

const navLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  padding: '8px 16px',
  borderRadius: '10px',
  transition: 'all 0.2s',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const downloadBtnStyle: React.CSSProperties = {
  padding: '8px 18px',
  fontSize: '13px',
  height: '40px',
  borderRadius: '12px',
};

const badgeStyle: React.CSSProperties = {
  fontSize: '10px',
  background: 'rgba(255, 255, 255, 0.2)',
  padding: '2px 6px',
  borderRadius: '4px',
  marginLeft: '4px',
};
