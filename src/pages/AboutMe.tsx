import React from 'react';
import './shared.css';
import './history.css';
import './aboutme.css';

const AboutMe = () => (
  <div className="section-content">
    <h1><span className="secondary-text">akshit</span>desai</h1>
    <h2><span className="secondary-text">I</span> am...</h2>
    <p>Well I don't know, I'll let you decide who you think I am. 
      {/* In-person TCP connection can be established over masala chai 🫖 if you're in Vancouver, BC contact for details. */}
    </p>

    <h2><span className="secondary-text">Work</span></h2>
    <p>
      For work, I specialize in backend development with Go, Python, and Java, while also building frontend experiences with React. On the DevOps side, I enjoy automating workflows and keeping systems reliable. Automation is table stakes (I am <a
        href="https://quoteinvestigator.com/2014/02/26/lazy-job/"
        className="primary-link"
        target="_blank"
        rel="noopener noreferrer"
      > lazy...</a>).
    </p>

    {/* <h2><span className="secondary-text">Around</span> the Internet 🌎</h2>
    <p>
      This site is the center of my online presence. 
    </p> */}

    <h2><span className="secondary-text">If</span> not in front of a terminal, I’m,</h2>
    <p>
      <ul className="activities-list">
        <li className="activity-item">
          <span className="secondary-text activity-icon">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Hiking and exploring trails ⛰️.
        </li>
        <li className="activity-item">
          <span className="secondary-text activity-icon">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Chasing sunsets 🌅.
        </li>
        <li className="activity-item">
          <span className="secondary-text activity-icon">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          Getting lost in nature with a camera 📷.
        </li>
      </ul>
    </p>

    <h3><span className="secondary-text">No promises</span> I'm actually good at anything.</h3>
  </div>
);

export default AboutMe;
