
import React, { useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import './App.css';
import AboutMe from './pages/AboutMe.tsx';
import History from './pages/History.tsx';
import Projects from './pages/Projects.tsx';

function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const [section, setSection] = useState('whoami');

  const renderSection = () => {
    switch (section) {
      case 'whoami':
        return <AboutMe />;
      case 'history':
        return <History theme={theme} />;
      case 'projectree':
        return <Projects />;
      default:
        return null;
    }
  }

  return (
    <div className={`App ${theme}`}>
      
      <nav className="top-menu">
        <button className={section === 'whoami' ? 'active' : ''} onClick={() => setSection('whoami')}>whoami</button>
        <button className={section === 'history' ? 'active' : ''} onClick={() => setSection('history')}>history</button>
        <button className={section === 'projectree' ? 'active' : ''} onClick={() => setSection('projectree')}>projectree</button>
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
      </nav>
      <main className="content">
        {renderSection()}
      </main>
    </div>
  );
}

export default App;
