import React, { useEffect, useState } from 'react';
import './Photolog.css';
import './shared.css';
import './history.css';
import photologData from '../data/photolog.json';
import visitedData from '../data/visited.json';
import TerminalMap from '../components/TerminalMap.tsx';
import PhotoGallery from '../components/PhotoGallery.tsx';

interface PhotologProps {
  theme: 'light' | 'dark';
}

interface PhotologLocation {
  location: string;
  colorN: number;
  coordinates: { lat: number; lng: number }[];
  dates: string[];
}

const Photolog = ({ theme }: PhotologProps) => {
  const [locations, setLocations] = useState<PhotologLocation[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [previousIdx, setPreviousIdx] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setLocations(photologData as PhotologLocation[]);
  }, []);

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

  return (
    <div className={`photolog-container ${theme}`}>
      <h2 className="section-title">travel &gt; <span className="secondary">photo.log</span></h2>
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
                height={400}
                width={800}
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
            </div>
            {!isTransitioning && (openIdx === null && previousIdx === null) && (
              <div className="location-dates-container">
                <p className="holocene-info">
                  Countries I've been to{' '}
                  <span className="secondary">■</span>
                </p>
              </div>
            )}
            {(openIdx !== null || (isTransitioning && previousIdx !== null)) && (
              <div className="location-dates-container">
                <p className="holocene-info">
                  Dates use the <a className="holocene-calendar" href="https://en.wikipedia.org/wiki/Holocene_calendar"> Holocene Calendar</a> — <a className="holocene-calendar" href="https://www.youtube.com/web?v=czgOWmtGVGs">the Human Era</a>.
                </p>
              </div>
            )}
          </div>

          {/* Location List Section */}
          <div className="photolog-list-section">
            <ul className="history-list">
              {locations.map((loc, idx) => (
                <li
                  key={idx}
                  className={`history-item ${openIdx === idx ? 'expanded' : ''}`}
                  onClick={() => handleToggle(idx)}
                >
                  <span
                    className={`secondary history-arrow`}
                  >
                    {openIdx === idx ? (
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
                    )}
                  </span>
                  <span className="history-company">
                    {openIdx === idx
                      ? <>{colorFirstN(loc.location, loc.colorN)} - {loc.dates.join(', ')}</>
                      : loc.location}
                  </span>
                </li>
              ))}
            </ul>
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
