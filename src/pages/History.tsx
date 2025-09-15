import React, { useEffect, useState } from 'react';
import './shared.css';
import './history.css';

import workexpData from '../data/workexp.json';
import eduData from '../data/edu.json';

interface HistoryProps {
  theme: string;
}

interface WorkExp {
  startDate: string;
  endDate: string;
  company: string;
  colorN: number;
  position: string;
  description?: string[];
  subExp?: {
    startDate: string;
    endDate: string;
    company: string;
    colorN: number;
    position: string;
    description?: string[];
  };
}

interface Edu {
  startDate: string;
  endDate: string;
  institute: string;
  colorN: number;
  degree: string;
  description?: string[];
  subDescription?: {
    title: string;
    description?: string[];
  }[];
}

const History = ({ theme }: HistoryProps) => {
  const [workexp, setWorkexp] = useState<WorkExp[]>([]);
  const [edu, setEdu] = useState<Edu[]>([]);

  useEffect(() => {
    setWorkexp(workexpData);
    setEdu(eduData);
  }, []);

  // single toggle state: { type: 'workexp' | 'edu', idx: number } | null
  const [openIdx, setOpenIdx] = useState<null | { type: 'workexp' | 'edu'; idx: number }>(null);

  // Animation duration should match CSS transition (180ms)
  const ANIMATION_DURATION = 180;

  const handleToggle = (idx: number) => {
    if (openIdx && (openIdx.type !== 'workexp' || openIdx.idx !== idx)) {
      setOpenIdx(null);
      setTimeout(() => {
        setOpenIdx({ type: 'workexp', idx });
      }, ANIMATION_DURATION);
    } else {
      setOpenIdx(openIdx ? null : { type: 'workexp', idx });
    }
  };

  const handleEduToggle = (idx: number) => {
    if (openIdx && (openIdx.type !== 'edu' || openIdx.idx !== idx)) {
      setOpenIdx(null);
      setTimeout(() => {
        setOpenIdx({ type: 'edu', idx });
      }, ANIMATION_DURATION);
    } else {
      setOpenIdx(openIdx ? null : { type: 'edu', idx });
    }
  };

    // Utility to color first N chars
    const colorFirstN = (text: string, n: number) => (
      <>
        <span className="secondary-text">{text.slice(0, n)}</span>{text.slice(n)}
      </>
    );

  return (
    <div className="section-content history-container">
      <p className="history-intro">
        Dates use the <a className="holocene-calendar" href="https://en.wikipedia.org/wiki/Holocene_calendar"> Holocene Calendar</a> — <a className="holocene-calendar" href="https://www.youtube.com/watch?v=czgOWmtGVGs">the Human Era</a>
      </p>
      <h2 className="section-title"><span className="secondary-text">history</span> | grep workexp</h2>
      <ul className="history-list">
        {workexp.map((exp, idx) => (
          <>
            <li
              className={`history-item ${openIdx && openIdx.type === 'workexp' && openIdx.idx === idx ? 'expanded' : ''}`}
              onClick={() => handleToggle(idx)}
            >
              <span
                className={`secondary-text history-arrow ${openIdx && openIdx.type === 'workexp' && openIdx.idx === idx ? 'open' : 'closed'}`}
              >
                <svg width="16" height="16" viewBox="0 0 20 20">
                  <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="history-date">
                {openIdx && openIdx.type === 'workexp' && openIdx.idx === idx
                  ? <>{colorFirstN(exp.startDate, 8)}</>
                  : exp.startDate}
                -{exp.endDate}
              </span>
              <span className="history-company">
                {openIdx && openIdx.type === 'workexp' && openIdx.idx === idx
                  ? <>{colorFirstN(exp.company, exp.colorN)}</>
                  : exp.company}
              </span>
              <span className="history-position">{exp.position}</span>
            </li>
            <li
              className={`history-details${openIdx && openIdx.type === 'workexp' && openIdx.idx === idx ? ' open' : ''}`}
            >
              {(exp.description && exp.description.length > 0) || exp.subExp ? (
                <ul className="history-details-list">
                  {exp.description && exp.description.map((desc: string, dIdx: number) => (
                    <li key={dIdx} className="history-details-item">
                      <span className="secondary-text history-bullet">&#8226;</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                  {exp.subExp && (
                    <>
                      <li key="subexp" className="history-subexp">
                        <span className="history-date">
                          {openIdx && openIdx.type === 'workexp' && openIdx.idx === idx
                            ? <>{colorFirstN(exp.subExp.startDate, 8)}</>
                            : exp.subExp.startDate}
                          -{exp.subExp.endDate}
                        </span>
                        <span className="history-company">
                          {openIdx && openIdx.type === 'workexp' && openIdx.idx === idx
                            ? <>{colorFirstN(exp.subExp.company, exp.subExp.colorN)}</>
                            : exp.subExp.company}
                        </span>
                        <span className="history-position">{exp.subExp.position}</span>
                      </li>
                      {exp.subExp.description && exp.subExp.description.length > 0 && exp.subExp.description.map((desc: string, sdIdx: number) => (
                        <li key={`subdesc-${sdIdx}`} className="history-details-item history-subdesc">
                          <span className="secondary-text history-bullet">&#8226;</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </>
                  )}
                </ul>
              ) : null}
            </li>
          </>
        ))}
      </ul>
      <h2 className="section-title"><span className="secondary-text">history</span> | grep edu</h2>
      <ul className="history-list">
        {edu.map((ed, idx) => (
          <>
            <li
              className={`history-item ${openIdx && openIdx.type === 'edu' && openIdx.idx === idx ? 'expanded' : ''}`}
              onClick={() => handleEduToggle(idx)}
            >
              <span
                className={`secondary-text history-arrow ${openIdx && openIdx.type === 'edu' && openIdx.idx === idx ? 'open' : 'closed'}`}
              >
                <svg width="16" height="16" viewBox="0 0 20 20">
                  <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="history-date">
                {openIdx && openIdx.type === 'edu' && openIdx.idx === idx
                  ? <>{colorFirstN(ed.startDate, 8)}</>
                  : ed.startDate}
                -{ed.endDate}
              </span>
              <span className="history-company">
                {openIdx && openIdx.type === 'edu' && openIdx.idx === idx
                  ? <>{colorFirstN(ed.institute,  ed.colorN)}</>
                  : ed.institute}
                <span className="edu-degree">, {openIdx && openIdx.type === 'edu' && openIdx.idx === idx
                  ? <>{colorFirstN(ed.degree, ed.colorND)}</>
                  : ed.degree}</span>
              </span>
            </li>
            <li
              className={`history-details${openIdx && openIdx.type === 'edu' && openIdx.idx === idx ? ' open' : ''}`}
            >
              {ed.description && ed.description.length > 0 ? (
                <ul className="history-details-list">
                  {ed.description.map((desc, dIdx) => (
                    <li key={dIdx} className="history-details-item">
                      <span className="secondary-text history-bullet">&#8226;</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                  {ed.subDescription && Array.isArray(ed.subDescription) && ed.subDescription.length > 0 && (
                    ed.subDescription.map((sub, subIdx) => (
                      <>
                        <li key={`sub-title-${subIdx}`} style={{ marginTop: '1em', marginBottom: '0.2em' }}>
                          <span className="edu-subdesc-title">{sub.title}</span>
                        </li>
                        {sub.description && sub.description.length > 0 && sub.description.map((desc, sdIdx) => (
                          <li key={`subdesc-item-${sdIdx}`} className="history-details-item history-subdesc">
                            <span className="secondary-text history-bullet">&#8226;</span>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </>
                    ))
                  )}
                </ul>
              ) : null}
            </li>
          </>
        ))}
      </ul>
    </div>
  );
};

export default History;
