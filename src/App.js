import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import AboutMe from './pages/AboutMe';
import History from './pages/History';
import Projectree from './pages/Projectree';
import Ping from './pages/Ping';
import Photolog from './pages/Photolog';
import MobileMenu from './components/MobileMenu';
import ThemeToggle from './components/ThemeToggle';
import Now from './pages/Now';


function AppRoutes({ theme, isDropdownOpen, setIsDropdownOpen, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const validSections = ['now', 'whoami', 'history', 'projectree', 'photolog', 'ping'];
  // Determine current section from path
  const section = (() => {
    const path = location.pathname.replace(/^\//, '');
    return validSections.includes(path) ? path : 'whoami';
  })();

  // Update section by navigating
  const updateSection = (newSection) => {
    // Preserve ?uh=true if present
    const params = new URLSearchParams(location.search);
    const uh = params.get('uh');
    const search = uh === 'true' ? '?uh=true' : '';
    navigate(newSection === 'whoami' ? '/' : `/${newSection}${search}`);
  };

  return (
    <div className={`App ${theme}`}>
      <nav className="top-menu">
        <div className="menu-buttons">
          <button className={section === 'now' ? 'active' : ''} onClick={() => updateSection('now')}>now</button>
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
        <Routes>
          <Route path="/" element={<AboutMe />} />
          <Route path="/whoami" element={<AboutMe />} />
          <Route path="/history" element={<History theme={theme} />} />
          <Route path="/projectree" element={<Projectree />} />
          <Route path="/photolog" element={<Photolog theme={theme} />} />
          <Route path="/ping" element={<Ping theme={theme} />} />
          <Route path="/now" element={<Now />} />
          <Route path="*" element={<AboutMe />} />
        </Routes>
      </main>
    </div>
  );
}


function App() {
  const [theme, setTheme] = useState('dark');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) {
      favicon.href = theme === 'dark' ? '/favicon.ico' : '/favicon-light.ico';
    }
  }, [theme]);

  return (
    <Router>
      <AppRoutes
        theme={theme}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        toggleTheme={toggleTheme}
      />
    </Router>
  );
}

export default App;
