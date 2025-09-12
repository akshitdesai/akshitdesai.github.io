import React, { useState, useEffect } from 'react';
import './App.css';
import AboutMe from './pages/AboutMe.tsx';
import History from './pages/History.tsx';
import Projectree from './pages/Projectree.tsx';
import Ping from './pages/Ping.tsx'; // import new page
import MobileMenu from './components/MobileMenu';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const [section, setSection] = useState('whoami');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const renderSection = () => {
    switch (section) {
      case 'whoami':
        return <AboutMe />;
      case 'history':
        return <History theme={theme} />;
      case 'projectree':
        return <Projectree />;
      case 'ping':
        return <Ping theme={theme} />; // pass theme prop
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
          <button className={section === 'whoami' ? 'active' : ''} onClick={() => setSection('whoami')}>whoami</button>
          <button className={section === 'history' ? 'active' : ''} onClick={() => setSection('history')}>history</button>
          <button className={section === 'projectree' ? 'active' : ''} onClick={() => setSection('projectree')}>projectree</button>
          <button className={section === 'ping' ? 'active' : ''} onClick={() => setSection('ping')}>ping</button>
        </div>
        <MobileMenu
          section={section}
          setSection={setSection}
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
