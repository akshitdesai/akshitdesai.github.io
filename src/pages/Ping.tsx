import React from 'react';
import pingData from '../data/ping.json';
import PingPong from './PingPong.tsx';


const Ping: React.FC = ({ theme }) => {
  return (
    <div className="section-content">
      <h2><span className="secondary-text">ping</span> me</h2>
      <ul style={{ marginTop: '0.1em', marginBottom: '1em', listStyle: 'none', paddingLeft: 0 }}>
        {pingData.map((item, idx) => (
          <li key={idx} style={{ marginBottom: '0.7em' }}>
            <a className="holocene-calendar" href={item.link} target="_blank" rel="noopener noreferrer">
              {item.platform}
            </a>
          </li>
        ))}
      </ul>
      
      <h2><span className="secondary-text">ping</span> pong!</h2>
      <PingPong theme={theme} />
    </div>
  );
};

export default Ping;
