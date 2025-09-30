import React, { useState, useEffect } from 'react';
import './App.css';
import AboutMe from './pages/AboutMe';
import History from './pages/History';
import Projectree from './pages/Projectree';
import Ping from './pages/Ping';
import Photolog from './pages/Photolog';
import MobileMenu from './components/MobileMenu';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Get initial section from URL query parameter or default to 'whoami'
  const getInitialSection = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const sectionParam = urlParams.get('section');
    const validSections = ['whoami', 'history', 'projectree', 'photolog', 'ping'];
    return validSections.includes(sectionParam) ? sectionParam : 'whoami';
  };

  const [section, setSection] = useState(getInitialSection);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update URL when section changes and remove only the 'section' query param
  const updateSection = (newSection) => {
    setSection(newSection);
    const url = new URL(window.location);
    url.searchParams.delete('section');
    window.history.pushState({}, '', url);
  };

  // Remove only the 'section' query parameter on initial load, keep others
  useEffect(() => {
    const url = new URL(window.location);
    if (url.searchParams.has('section')) {
      url.searchParams.delete('section');
      window.history.replaceState({}, '', url);
    }
  }, []);

  const renderSection = () => {
    switch (section) {
      case 'whoami':
        return <AboutMe />;
      case 'history':
        return <History theme={theme} />;
      case 'projectree':
        return <Projectree />;
      case 'photolog':
        return <Photolog theme={theme} />;
      case 'ping':
        return <Ping theme={theme} />;
      default:
        return null;
    }
  }

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      favicon.href = theme === 'dark' ? '/favicon.ico' : '/favicon-light.ico';
    }
  }, [theme]);



  return (
    <div className={`App ${theme}`}>
      
      <nav className="top-menu">
        <div className="menu-buttons">
          <button className={section === 'whoami' ? 'active' : ''} onClick={() => updateSection('whoami')}>whoami</button>
          <button className={section === 'history' ? 'active' : ''} onClick={() => updateSection('history')}>history</button>
          <button className={section === 'projectree' ? 'active' : ''} onClick={() => updateSection('projectree')}>projectree</button>
          <button className={section === 'photolog' ? 'active' : ''} onClick={() => updateSection('photolog')}>photolog</button>
          <button className={section === 'ping' ? 'active' : ''} onClick={() => updateSection('ping')}>ping</button>
        </div>
        <MobileMenu
          section={section}
          setSection={updateSection}
          isDropdownOpen={isDropdownOpen}
          setIsDropdownOpen={setIsDropdownOpen}
          theme={theme}
        />
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </nav>
      <main className="content">
        {renderSection()}
      </main>
    </div>
  );
}

export default App;
