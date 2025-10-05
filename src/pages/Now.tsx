import React from 'react';
import './shared.css';
import './history.css';
import './aboutme.css';

const Now = () => (
  <div className="section-content">
    <p className="history-intro">
      This page is follows guidelines from <a className="holocene-calendar" href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer">nownownow.com/about</a> page
    </p>
    <h2><span className="secondary-text">What</span> I am up to these days?</h2>

    <div>
      <ul className="activities-list">
        <li className="activity-item">
          <span className="secondary-text" style={{display: 'inline-flex', alignItems: 'center', height: '1em', marginRight: '0.7em'}}>
            <svg width="7" height="7" viewBox="0 0 10 10" style={{display: 'block', transform: 'translateY(2px)'}}>
              <circle cx="5" cy="5" r="4" fill="currentColor" />
            </svg>
          </span>
          Learning to build AI agents.
        </li>
        <li className="activity-item">
          <span className="secondary-text" style={{display: 'inline-flex', alignItems: 'center', height: '1em', marginRight: '0.7em'}}>
            <svg width="7" height="7" viewBox="0 0 10 10" style={{display: 'block', transform: 'translateY(2px)'}}>
              <circle cx="5" cy="5" r="4" fill="currentColor" />
            </svg>
          </span>
          Improving the UI of this website.
        </li>
        <li className="activity-item">
          <span className="secondary-text" style={{display: 'inline-flex', alignItems: 'center', height: '1em', marginRight: '0.7em'}}>
            <svg width="7" height="7" viewBox="0 0 10 10" style={{display: 'block', transform: 'translateY(2px)'}}>
              <circle cx="5" cy="5" r="4" fill="currentColor" />
            </svg>
          </span>
          Experimenting with different LLM models and openllm on MAC M4 mini.
        </li>
      </ul>

    </div>

  <p style={{ fontSize: '0.9em', fontStyle: 'italic', marginTop: `2em` }}> Last updated at :-<span className="secondary-text"> 12025-10-05</span></p>

  </div>
);

export default Now;
