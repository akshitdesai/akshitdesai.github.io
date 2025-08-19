import React from 'react';
import './shared.css';

const AboutMe = () => (
  <div className="section-content">
    <h1><span className="secondary-text">akshit</span>desai</h1>
    <h2><span className="secondary-text">I</span> am... 🤔</h2>
    <p>Well I don't know, I'll let you decide who you think I am. In-person TCP connection can be established over masala chai 🫖 if you're in Vancouever, BC contact for details.</p>

    <h2><span className="secondary-text">Around</span> the Internet 🌎</h2>
    <p>
      This site is the center of my online presence. The <a className="holocene-calendar" href="https://medium.com/@akshitdesai">blog page</a> contains write ups of experiments and experiences.
      Occasionally, I experiment with different technologies, and post on LinkedIn.
    </p>

    <h2><span className="secondary-text">If</span> not in front of a terminal, I’m,</h2>
    <p>
      <ul style={{ marginTop: '0.5em', marginBottom: '0.5em' }}>
        <li style={{ listStyleType: 'none' }}><span className="secondary-text">&gt;</span> Hiking and exploring trails ⛰️</li>
        <li style={{ listStyleType: 'none' }}><span className="secondary-text">&gt;</span> Chasing sunsets 🌅</li>
        <li style={{ listStyleType: 'none' }}><span className="secondary-text">&gt;</span> Getting lost in nature with a camera 📷</li>
      </ul>
    </p>

    <h3><span className="secondary-text">No promises</span> I'm actually good at anything</h3>
  </div>
);

export default AboutMe;
