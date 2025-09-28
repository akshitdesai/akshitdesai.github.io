import React, { useState, useMemo, useEffect } from 'react';
import pingData from '../data/ping.json';
import PingPong from './PingPong';
import './Ping.css';

interface PingProps {
  theme: 'light' | 'dark';
}

const Ping: React.FC<PingProps> = ({ theme }) => {
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check if the screen is mobile size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Create multiple randomized lists once on initial load
  const randomizedLists = useMemo(() => {
    const createShuffledList = () => [...pingData].sort(() => Math.random() - 0.5);
    const length = isMobile ? 2 : 6;
    return Array.from({ length }, () => createShuffledList());
  }, [isMobile]);

  const renderPlatformLinks = (listIndex: number, showSpacing: boolean = true) => {
    const shuffledData = randomizedLists[listIndex];
    
    return (
      <>
        {shuffledData.map((item, idx) => (
          <span key={`${listIndex}-${item.platform}-${idx}`}>
            <a 
              className={`holocene-calendar platform-link-unselected ${hoveredPlatform === item.platform.toLowerCase() ? 'hovered' : ''}`}
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              onMouseEnter={() => setHoveredPlatform(item.platform.toLowerCase())}
              onMouseLeave={() => setHoveredPlatform(null)}
              style={{
                textDecoration: hoveredPlatform === item.platform.toLowerCase() ? 'underline' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {item.platform.toLowerCase()}
            </a>
            {idx < shuffledData.length - 1 && showSpacing && ' '}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="section-content">
      <h2 className="ping-heading"><span className="secondary-text">ping</span> me</h2>
      <p className="platform-links-paragraph" style={{ marginTop: '0.5em', marginBottom: '1.5em', lineHeight: 1.6 }}>
        {Array.from({ length: randomizedLists.length }, (_, n) => (
          <span key={`first-loop-${n}`}>
            {n === Math.floor(randomizedLists.length / 2) && <strong>{' '}<span className="secondary-text">ak</span>$hit</strong>}
            {' '}
            {renderPlatformLinks(n)}
          </span>
        ))}
      </p>
      
      <h2><span className="secondary-text">ping</span> pong!</h2>
      <PingPong theme={theme} />
    </div>
  );
};

export default Ping;
