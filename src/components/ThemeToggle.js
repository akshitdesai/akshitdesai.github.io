import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <div className="theme-toggle">
      <label className="switch">
        <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} aria-label="Toggle theme" />
        <span className="slider">
          <span className="knob">
            {theme === 'light' ? <FiSun size={18} /> : <FiMoon size={18} />}
          </span>
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle;
