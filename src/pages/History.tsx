import React, { useEffect, useState } from 'react';
import './shared.css';

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
    <div className="section-content">
      <p>
        Dates use the <a className="holocene-calendar" href="https://en.wikipedia.org/wiki/Holocene_calendar"> Holocene Calendar</a> — <a className="holocene-calendar" href="https://www.youtube.com/watch?v=czgOWmtGVGs">the Human Era</a>
      </p>
      <h2><span className="secondary-text">history</span> | grep workexp</h2>
      <ul className="workexp-list" style={{ marginTop: '0.5em', marginBottom: '0.5em', paddingLeft: 0 }}>
        {workexp.map((exp, idx) => (
          <>
            <li
              style={{
                listStyleType: 'none',
                cursor: 'pointer',
                alignItems: 'center',
                display: 'flex',
                fontWeight: openIdx && openIdx.type === 'workexp' && openIdx.idx === idx ? 'bold' : 'normal'
              }}
              onClick={() => handleToggle(idx)}
            >
              <span
                className={`secondary-text workexp-arrow ${openIdx && openIdx.type === 'workexp' && openIdx.idx === idx ? 'open' : 'closed'}`}
                style={{ minWidth: '2em', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', height: '2em' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" style={{ display: 'block' }}>
                  <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
                <span style={{ minWidth: '12em', display: 'inline-block' }}>
                  {openIdx && openIdx.type === 'workexp' && openIdx.idx === idx
                    ? <>{colorFirstN(exp.startDate, 8)}</>
                    : exp.startDate}
                  -{exp.endDate}
                </span>
                <span style={{ minWidth: '13em', display: 'inline-block' }}>
                  {openIdx && openIdx.type === 'workexp' && openIdx.idx === idx
                    ? <>{colorFirstN(exp.company, exp.colorN)}</>
                    : exp.company}
                </span>
                <span className="workexp-position">{exp.position}</span>
            </li>
            <li
              className={`workexp-details${openIdx && openIdx.type === 'workexp' && openIdx.idx === idx ? ' open' : ''}`}
              style={{
                listStyleType: 'none',
                paddingLeft: '2em',
                marginBottom: '0.5em'
              }}
            >
              {(exp.description && exp.description.length > 0) || exp.subExp ? (
                <ul style={{ margin: '0 0 0.7em 0', paddingLeft: '1.5em' }}>
                  {exp.description && exp.description.map((desc: string, dIdx: number) => (
                    <li key={dIdx} style={{ marginBottom: '0.2em', lineHeight: 1.5, display: 'flex', alignItems: 'center' }}>
                      <span className="secondary-text" style={{ marginRight: '0.6em', fontWeight: 'bold', fontSize: '1.1em' }}>&#8226;</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                  {exp.subExp && (
                    <>
                      <li key="subexp" style={{ marginTop: '1em', marginBottom: '0.2em', fontWeight: 'bold', lineHeight: 1.5 }}>
                        <span style={{ minWidth: '11.5em', display: 'inline-block' }}>
                          {openIdx && openIdx.type === 'workexp' && openIdx.idx === idx
                            ? <>{colorFirstN(exp.subExp.startDate, 8)}</>
                            : exp.subExp.startDate}
                          -{exp.subExp.endDate}
                        </span>
                        <span style={{ minWidth: '13em', display: 'inline-block' }}>
                          {openIdx && openIdx.type === 'workexp' && openIdx.idx === idx
                            ? <>{colorFirstN(exp.subExp.company, exp.subExp.colorN)}</>
                            : exp.subExp.company}
                        </span>
                        <span className="workexp-position">{exp.subExp.position}</span>
                      </li>
                      {exp.subExp.description && exp.subExp.description.length > 0 && exp.subExp.description.map((desc: string, sdIdx: number) => (
                        <li key={`subdesc-${sdIdx}`} style={{ marginBottom: '0.2em', lineHeight: 1.5, display: 'flex', alignItems: 'center', paddingLeft: '1.5em' }}>
                          <span className="secondary-text" style={{ marginRight: '0.6em', fontWeight: 'bold', fontSize: '1.1em' }}>&#8226;</span>
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
      <h2><span className="secondary-text">history</span> | grep edu</h2>
      <ul className="workexp-list" style={{ marginTop: '0.5em', marginBottom: '0.5em', paddingLeft: 0 }}>
        {edu.map((ed, idx) => (
          <>
            <li
              style={{
                listStyleType: 'none',
                cursor: 'pointer',
                alignItems: 'center',
                display: 'flex',
                fontWeight: openIdx && openIdx.type === 'edu' && openIdx.idx === idx ? 'bold' : 'normal'
              }}
              onClick={() => handleEduToggle(idx)}
            >
              <span
                className={`secondary-text workexp-arrow ${openIdx && openIdx.type === 'edu' && openIdx.idx === idx ? 'open' : 'closed'}`}
                style={{ minWidth: '2em', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', height: '2em' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" style={{ display: 'block' }}>
                  <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
                <span style={{ minWidth: '12em', display: 'inline-block' }}>
                  {openIdx && openIdx.type === 'edu' && openIdx.idx === idx
                    ? <>{colorFirstN(ed.startDate, 8)}</>
                    : ed.startDate}
                  -{ed.endDate}
                </span>
                <span style={{ minWidth: '13em', display: 'inline-block' }}>
                  {openIdx && openIdx.type === 'edu' && openIdx.idx === idx
                    ? <>{colorFirstN(ed.institute,  ed.colorN)}</>
                    : ed.institute}
                  <span className="edu-degree">, {ed.degree}</span>
                </span>
            </li>
            <li
              className={`workexp-details${openIdx && openIdx.type === 'edu' && openIdx.idx === idx ? ' open' : ''}`}
              style={{
                listStyleType: 'none',
                paddingLeft: '2em',
                marginBottom: '0.5em'
              }}
            >
              {ed.description && ed.description.length > 0 ? (
                <ul style={{ margin: '0 0 0.7em 0', paddingLeft: '1.5em' }}>
                  {ed.description.map((desc, dIdx) => (
                    <li key={dIdx} style={{ marginBottom: '0.2em', lineHeight: 1.5, display: 'flex', alignItems: 'center' }}>
                      <span className="secondary-text" style={{ marginRight: '0.6em', fontWeight: 'bold', fontSize: '1.1em' }}>&#8226;</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                  {ed.subDescription && Array.isArray(ed.subDescription) && ed.subDescription.length > 0 && (
                    ed.subDescription.map((sub, subIdx) => (
                      <>
                        <li style={{ marginTop: '1em', marginBottom: '0.2em' }}>
                          <span className="edu-subdesc-title">{sub.title}</span>
                        </li>
                        {sub.description && sub.description.length > 0 && sub.description.map((desc, sdIdx) => (
                          <li key={`subdesc-item-${sdIdx}`} style={{ marginBottom: '0.2em', lineHeight: 1.5, display: 'flex', alignItems: 'center', paddingLeft: '1.5em' }}>
                            <span className="secondary-text" style={{ marginRight: '0.6em', fontWeight: 'bold', fontSize: '1.1em' }}>&#8226;</span>
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
