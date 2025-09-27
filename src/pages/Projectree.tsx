import React, { useEffect, useState } from 'react';
import './projectree.css';

import projectsData from '../data/projects.json';

interface Project {
  name: string;
  github: string;
  live?: string;
  description: string;
}

interface Category {
  category: string;
  colorN: number;
  projects: Project[];
}

interface ProjectreeProps {
  theme: string;
}

// Utility to color first N chars (for category only)
const colorFirstN = (text: string, n: number) => (
  <>
    <span className="secondary-text">{text.slice(0, n)}</span>{text.slice(n)}
  </>
);

const GithubIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    className="projectree-logo projectree-github"
    style={{ verticalAlign: 'middle', transition: 'color 0.2s' }}
  >
    <path
      fill="currentColor"
      d="M12 2C6.477 2 2 6.484 2 12.012c0 4.418 2.865 8.167 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.088 2.91.832.091-.646.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.254-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.338 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.396.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.337 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .268.18.579.688.481C19.138 20.175 22 16.426 22 12.012 22 6.484 17.523 2 12 2z"
    />
  </svg>
);

const LiveIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    className="projectree-logo projectree-live"
    style={{ verticalAlign: 'middle', transition: 'color 0.2s' }}
  >
    <path
      fill="currentColor"
      d="M14 3v2h3.59L7 15.59 8.41 17 19 6.41V10h2V3z"
    />
    <path
      fill="currentColor"
      d="M5 5v14h14v-7h-2v5H7V7h5V5z"
    />
  </svg>
);

const Projectree = ({ theme }: ProjectreeProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    setCategories(projectsData);
  }, []);

  const [openIdx, setOpenIdx] = useState<null | number>(null);
  const ANIMATION_DURATION = 180;

  const handleToggle = (idx: number) => {
    if (openIdx !== null && openIdx !== idx) {
      setOpenIdx(null);
      setTimeout(() => {
        setOpenIdx(idx);
      }, ANIMATION_DURATION);
    } else {
      setOpenIdx(openIdx === idx ? null : idx);
    }
  };

  return (
    <div className="section-content projectree-root">
      <h2 className="projectree-title">projec<span className="secondary-text">tree</span></h2>
      <ul className="projectree-list">
        {categories.map((cat, idx) => {
          const isOpen = openIdx === idx;
          const isLastCat = idx === categories.length - 1;
          return (
            <React.Fragment key={idx}>
              <li
                className={`projectree-category ${isOpen ? 'open' : ''}`}
                onClick={() => handleToggle(idx)}
              >
                <span className="projectree-ascii">{isLastCat ? '└──' : '├──'}</span>
                <span className="projectree-category-title">
                  {isOpen
                    ? colorFirstN(cat.category, cat.colorN)
                    : cat.category
                  }
                </span>
                <span className={`secondary-text projectree-arrow${isOpen ? ' open' : ''}`}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 20 20"
                    className={isOpen ? 'arrow-rotate' : ''}
                  >
                    <polyline points="8 6 12 10 8 14" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </li>
              <li
                className={`projectree-category-details${isOpen ? ' open' : ''}${isLastCat ? ' last' : ''}`}
              >
                {isOpen && (
                  <ul className="projectree-project-list">
                    {cat.projects.map((proj, pIdx) => {
                      const isLastProj = pIdx === cat.projects.length - 1;
                      return (
                        <React.Fragment key={pIdx}>
                          <li className={`projectree-project`}>
                            <div className="projectree-project-row">
                              <span className="projectree-ascii">{isLastProj ? '└──' : '├──'}</span>
                              <span className={`projectree-project-title${isOpen ? ' open' : ''}`}>{proj.name}</span>
                              {proj.github && (
                                <a
                                  href={proj.github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="holocene-calendar projectree-link"
                                >
                                  <GithubIcon />
                                </a>
                              )}
                              {proj.live && (
                                <a
                                  href={proj.live}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="holocene-calendar projectree-link"
                                >
                                  <LiveIcon />
                                </a>
                              )}
                            </div>
                          </li>
                          {proj.description && (
                            <li
                              className={`projectree-project-desc${isLastProj ? ' last' : ''}`}
                            >
                              <span className="projectree-ascii">{isLastProj ? '└──' : '├──'}</span>
                              <span>{proj.description}</span>
                            </li>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </ul>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default Projectree;