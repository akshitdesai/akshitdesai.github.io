import React, { useEffect, useState } from 'react';
import './Photolog.css';
import './shared.css';
import './history.css';
import photologData from '../data/photolog.json';
import visitedData from '../data/visited.json';
import TerminalMap from '../components/TerminalMap';
import PhotoGallery from '../components/PhotoGallery';

interface PhotologProps {
  theme: 'light' | 'dark';
}

interface PhotologLocation {
  location: string;
  colorN: number;
  coordinates: { lat: number; lng: number }[];
  dates: { date: string; basedOutOf: boolean }[];
}

const Photolog = ({ theme }: PhotologProps) => {
  const [locations, setLocations] = useState<PhotologLocation[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [previousIdx, setPreviousIdx] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(true);

  useEffect(() => {
    setLocations(photologData as PhotologLocation[]);
  }, []);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll for header visibility
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      const shouldHideHeader = isScrollingDown && currentScrollY > 100;
      
      setIsHeaderVisible(!shouldHideHeader);
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isMobile = windowWidth <= 768;

  // Animation duration should match CSS transition (180ms)
  const ANIMATION_DURATION = 180;

  const handleToggle = (idx: number) => {
    if (openIdx !== null && openIdx !== idx) {
      // Switching from one location to another
      setIsTransitioning(true);
      setPreviousIdx(openIdx); // Keep track of current selection
      setOpenIdx(null);
      
      setTimeout(() => {
        setOpenIdx(idx);
        setIsTransitioning(false);
        setPreviousIdx(null);
      }, ANIMATION_DURATION);
    } else {
      // Opening for first time or closing current
      if (openIdx === idx) {
        // Closing current selection
        setPreviousIdx(openIdx);
        setOpenIdx(null);
        setTimeout(() => {
          setPreviousIdx(null);
        }, ANIMATION_DURATION);
      } else {
        // Opening for first time
        setOpenIdx(idx);
      }
    }
  };

  // Utility to color first N chars
  const colorFirstN = (text: string, n: number) => (
    <>
      <span className="secondary">{text.slice(0, n)}</span>{text.slice(n)}
    </>
  );

  // Utility to render dates with primary color first character for basedOutOf dates
  const renderDates = (dates: { date: string; basedOutOf: boolean }[], className: string) => (
    <span className={className}>
      {dates.map((dateObj, index) => (
        <span key={index}>
          {dateObj.basedOutOf ? 
            <><span className="secondary">{dateObj.date.charAt(0)}</span>{dateObj.date.slice(1)}</> 
            : dateObj.date}
          {index < dates.length - 1 ? ', ' : ''}
        </span>
      ))}
    </span>
  );

  // Check if location has any basedOutOf dates
  const hasBasedOutOfDates = (dates: { date: string; basedOutOf: boolean }[]) => 
    dates.some(dateObj => dateObj.basedOutOf);

  return (
    <div className={`photolog-container ${theme}`}>
      <h2 className={`section-title ${isHeaderVisible ? 'visible' : 'hidden'}`}>
        travel &gt; <span className="secondary">photos.log</span>
      </h2>
      <div className="section-content">
        <div className="photolog-layout">
          {/* Full Screen Map Section */}
          <div className="photolog-map-section">
            <div className="location-map-container" style={{ position: 'relative' }}>
              <TerminalMap
                coordinates={
                  (openIdx !== null || (isTransitioning && previousIdx !== null)) && 
                  locations[openIdx !== null ? openIdx : previousIdx!] 
                    ? locations[openIdx !== null ? openIdx : previousIdx!].coordinates || []
                    : []
                }
                visitedCountries={
                  (openIdx === null && !isTransitioning && previousIdx === null)
                    ? visitedData.visitedCountries as any
                    : undefined
                }
                theme={theme}
                zoom={
                  (openIdx !== null || (isTransitioning && previousIdx !== null)) && 
                  locations[openIdx !== null ? openIdx : previousIdx!] 
                    ? 11 
                    : 1.4
                }
                height={isMobile ? 300 : 400}
                width={isMobile ? Math.min(windowWidth - 40, 350) : 800}
                forceWorldView={
                  (openIdx === null && !isTransitioning && previousIdx === null)
                }
              />
              {(isTransitioning || (openIdx === null && previousIdx !== null)) && (
                <div className="map-loading-overlay" style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(var(--bg-secondary-rgb), 0.9)',
                  zIndex: 10
                }}>
                  <span className="secondary">Loading...</span>
                </div>
              )}
              {!isTransitioning && (openIdx === null && previousIdx === null) && (
                <div className="map-overlay-text" style={{
                  position: 'absolute',
                  bottom: '30px',
                  left: '80px',
                  color: 'var(--text-color)',
                  fontSize: '14px',
                  zIndex: 5
                }}>
                  Countries I've been to. <span className="secondary">■</span>
                </div>
              )}
            </div>
            <div className="location-dates-container">
            </div>
          </div>

          {/* Location List Section */}
          <div className="photolog-list-section">
            <ul className="history-list">
              {locations.map((loc, idx) => (
                <>
                  <li
                    key={idx}
                    className={`history-item ${openIdx === idx ? 'expanded' : ''}`}
                    onClick={() => handleToggle(idx)}
                  >
                    <span
                      className={`secondary history-arrow ${openIdx === idx ? 'rotated' : ''}`}
                    >
                      {isMobile ? (
                        // Mobile: Single chevron that rotates when selected
                        <svg width="16" height="16" viewBox="0 0 20 20">
                          <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        // Desktop: Different chevrons for selected/unselected
                        openIdx === idx ? (
                          // Double chevron for selected location
                          <svg width="16" height="16" viewBox="0 0 20 20">
                            <polyline points="6 6 10 10 6 14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <polyline points="10 6 14 10 10 14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          // Single chevron for unselected locations
                          <svg width="16" height="16" viewBox="0 0 20 20">
                            <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )
                      )}
                    </span>
                    <span className={`history-company ${hasBasedOutOfDates(loc.dates) ? 'based-out-of' : ''}`}>
                      {isMobile ? (
                        // Mobile: Show only location name, dates in expandable section
                        openIdx === idx
                          ? <>{colorFirstN(loc.location, loc.colorN)}</>
                          : loc.location
                      ) : (
                        // Desktop: Show location and dates inline
                        openIdx === idx
                          ? <>{colorFirstN(loc.location, loc.colorN)} - {renderDates(loc.dates, "location-dates-selected")}</>
                          : <>{loc.location} - {renderDates(loc.dates, "location-dates-unselected")}</>
                      )}
                    </span>
                  </li>
                  {isMobile && (
                    <li className={`history-details${openIdx === idx ? ' open' : ''}`}>
                      <ul className="history-details-list">
                        {loc.dates.map((dateObj, dateIdx) => (
                          <li key={dateIdx} className="history-details-item">
                            <span className="secondary history-bullet">•</span>
                            <span className={dateObj.basedOutOf ? 'based-out-of' : ''}>
                              {dateObj.basedOutOf ? 
                                <><span className="secondary">{dateObj.date.charAt(0)}</span>{dateObj.date.slice(1)}</> 
                                : dateObj.date}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}
                </>
              ))}
            </ul>
            {/* Legend for based out of locations */}
            <div className="location-legend">
                <>
                    Dates use the <a className="holocene-calendar" href="https://en.wikipedia.org/wiki/Holocene_calendar"> Holocene Calendar</a> — <a className="holocene-calendar" href="https://www.youtube.com/web?v=czgOWmtGVGs">the Human Era</a>.
                </> 
                <br/>
                <br/>
                <strong>bold</strong>: dates I've been based out of.{' '}
                <span className="secondary">■</span>
            </div>
          </div>
        </div>
        
        {/* Photos Gallery */}
        <PhotoGallery theme={theme} />
      </div>
    </div>
  );
};

export { Photolog };
export default Photolog;
