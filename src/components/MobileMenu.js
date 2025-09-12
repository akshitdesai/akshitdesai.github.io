import React, { useRef, useEffect } from 'react';

const MobileMenu = ({ section, setSection, isDropdownOpen, setIsDropdownOpen, theme }) => {
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, setIsDropdownOpen]);

  const handleSectionChange = (newSection) => {
    setSection(newSection);
    setIsDropdownOpen(false);
  };

  return (
    <div className="mobile-menu" ref={mobileMenuRef}>
      <button className="dropdown-toggle" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : 'closed'} secondary-text`}>
          <svg width="1.1rem" height="1.1rem" viewBox="0 0 20 20">
            <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        {section}
      </button>
      {isDropdownOpen && (
        <ul className="dropdown-list">
          <li onClick={() => handleSectionChange('whoami')} className={section === 'whoami' ? 'active' : ''}>whoami</li>
          <li onClick={() => handleSectionChange('history')} className={section === 'history' ? 'active' : ''}>history</li>
          <li onClick={() => handleSectionChange('projectree')} className={section === 'projectree' ? 'active' : ''}>projectree</li>
          <li onClick={() => handleSectionChange('ping')} className={section === 'ping' ? 'active' : ''}>ping</li>
        </ul>
      )}
    </div>
  );
};

export default MobileMenu;
