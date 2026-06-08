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
    <header className="glass header-container">
      <div className="logo-container">
        <img 
          src={darkMode ? "/logo2.png" : "/logo1.png"} 
          alt="LoopHabit Logo" 
          className="logo-image"
          onError={(e) => {
            // Fallback if logo loading fails
            (e.target as HTMLImageElement).src = "/logo1.png";
          }}
        />
        <span className="logo-text">LoopHabit</span>
      </div>

      <nav className="header-nav">
        <button onClick={() => onScrollTo('hero')} className="nav-link">Home</button>
        <button onClick={() => onScrollTo('features')} className="nav-link">Features</button>
        <button onClick={() => onScrollTo('demo')} className="nav-link">Try Demo</button>
      </nav>

      <div className="actions-container">
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
          className="btn-primary download-btn"
        >
          <Download size={16} />
          <span className="download-btn-text">
            <span>Download</span>
            <span>APK</span>
          </span>
          <span className="download-badge">v1.1</span>
        </a>
      </div>
    </header>
  );
}




